
import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { RippleModule } from 'primeng/ripple';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { StepperModule } from 'primeng/stepper';
import { StepsModule } from 'primeng/steps';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';


// Stripe imports
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';

// Services and Models
import { TokenValidationService } from '../services/token-validation.service';
import { RegisterModel } from '../models/RegisterModel';
import { RegisterService } from '../services/register.service';
import { PaymentService } from '../services/payment.service';
import { PaymentIntentRequest } from '../models/payment-intent-request';
import { environment } from '../../environments/environment';
import { ConfettiService } from '../confetti/confetti.service';
import { ConfettiComponent } from "../confetti/confetti.component";

@Component({
  selector: 'app-registro',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    InputTextModule,
    ButtonModule,
    InputMaskModule,
    InputNumberModule,
    RippleModule,
    CardModule,
    MessageModule,
    ToastModule,
    StepperModule,
    StepsModule,
    DialogModule,
    ProgressSpinnerModule,
    ConfettiComponent
],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit, OnDestroy {
  // Form properties
  showPassword = false;
  registroForm: FormGroup;
  submitted = false;
  loading = true;
  errorMsg: string | null = null;

  // Stepper properties
  activeStep = 0;
  isValidating = false;
  stepItems: any[] = [
    { label: 'Información Personal' },
    { label: 'Método de Pago' },
    { label: 'Confirmación' }
  ];

  // Payment properties
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  paymentElement: StripePaymentElement | null = null;
  clientSecret: string | null = null;
  stripeInitialized = false;
  paymentElementLoading = false;
  isProcessingPayment = false;
  paymentError: string | null = null;
  tenantId: string | null = null;

  // Modal properties (unused now that confirmation is inline)
  // showSuccessModal = false; (kept commented intentionally)

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tokenValidationService: TokenValidationService,
    private registerService: RegisterService,
    private paymentService: PaymentService,
    private confettiService: ConfettiService,
  ) {
    this.registroForm = this.fb.group({
      tenant: this.fb.group({
        fullName: ['', Validators.required],
        fechaNacimiento: ['', Validators.required],
        telefono: [''],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
      })
    });
  }

  ngOnInit() {
    this.validateInvitation();
  }

  ngOnDestroy() {
    if (this.paymentElement) {
      this.paymentElement.destroy();
    }
  }

  get tenant() {
    return (this.registroForm.get('tenant') as FormGroup).controls;
  }

  // Validation methods
  validateInvitation() {
    this.route.queryParams.subscribe((params: any) => {
      const register = params['register'];
      const token = params['token'];

      if (register !== 'true' || !token) {
        this.errorMsg = 'Invitación inválida o incompleta.';
        this.loading = false;
        this.router.navigate(['/error'], { queryParams: { msg: this.errorMsg } });
        return;
      }

      this.tokenValidationService.validateToken(token).subscribe({
        next: (resp) => {
          if (resp && resp.code) {
            const tenantGroup = this.registroForm.get('tenant') as FormGroup;
            tenantGroup.patchValue({
              email: resp.object.registroDto.email,
              fullName: resp.object.registroDto.fullName,
              fechaNacimiento: resp.object.registroDto.fechaNacimiento
                ? new Date(resp.object.registroDto.fechaNacimiento).toISOString().substring(0, 10)
                : '',
              telefono: resp.object.registroDto.telefono || ''
            });

            tenantGroup.get('email')?.disable();
            this.loading = false;
          } else {
            this.errorMsg = resp?.message || 'Invitación inválida o expirada.';
            this.loading = false;
            this.router.navigate(['/error'], { queryParams: { msg: this.errorMsg } });
          }
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'Invitación inválida o expirada.';
          this.loading = false;
          this.router.navigate(['/error'], { queryParams: { msg: this.errorMsg } });
        }
      });
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.tenant[fieldName];
    return field && field.invalid && (field.dirty || field.touched || this.submitted);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Stepper navigation methods
  nextStep() {
    if (this.activeStep === 0) {
      this.validatePersonalInfo();
    }
  }

  previousStep() {
    if (this.activeStep > 0) {
      this.activeStep--;
    }
  }

  validatePersonalInfo() {
    this.submitted = true;
    this.isValidating = true;

    // Validate required fields
    const tenantForm = this.registroForm.get('tenant') as FormGroup;
    if (tenantForm.invalid) {
      this.isValidating = false;
      return;
    }

    // Register user first
    const registroData: RegisterModel = {
      fullName: this.tenant['fullName'].value,
      fechaNacimiento: this.tenant['fechaNacimiento'].value,
      telefono: this.tenant['telefono'].value,
      email: this.tenant['email'].value,
      password: this.tenant['password'].value,
      token: this.route.snapshot.queryParams['token']
    };

    this.registerService.register(registroData).subscribe({
      next: (resp) => {
        if (resp && resp.object) {
          this.tenantId = resp.object;
          this.activeStep = 1;
          this.initializeStripe();
        } else {
          this.errorMsg = 'Error al registrar usuario.';
        }
        this.isValidating = false;
      },
      error: (err) => {
        this.errorMsg = 'Error al registrar usuario. Inténtalo de nuevo más tarde.';
        this.isValidating = false;
      }
    });
  }

  // Stripe integration methods
  async initializeStripe() {
    try {
      // Initialize Stripe
      this.stripe = await loadStripe(environment.stripePublishableKey);

      if (!this.stripe) {
        throw new Error('Failed to initialize Stripe');
      }

      // Create payment intent
      await this.createStripePaymentIntent();

    } catch (error) {
      this.paymentError = 'Error al inicializar el sistema de pago. Inténtalo de nuevo.';
      console.error('Stripe initialization error:', error);
    }
  }

  async createPaymentIntent() {
    if (!this.tenantId) {
      this.paymentError = 'Error: ID de usuario no encontrado.';
      return;
    }

    const paymentData = {
      tenantId: this.tenantId,
      amount: 29900, // $299.00 MXN (amount in cents)
      currency: 'mxn'
    };

    // Cast to any to avoid strict model mismatch with PaymentIntentRequest
    this.paymentService.createPaymentIntent(paymentData as any, 'requires_payment_method').subscribe({
      next: async (response) => {
        if (response && response.clientSecret) {
          const candidate: any = response.clientSecret;
          if (typeof candidate === 'string' && candidate.startsWith('sk_')) {
            console.error('[registro] server returned secret key (sk_) instead of client_secret');
            this.paymentError = 'Error de configuración: el servidor está devolviendo la clave secreta de Stripe.';
            return;
          }
          if (typeof candidate === 'string' && !candidate.includes('_secret_')) {
            console.error('[registro] received value is not a client_secret:', candidate);
            this.paymentError = 'El servidor no devolvió un client_secret válido.';
            return;
          }
          this.clientSecret = candidate;
          await this.setupPaymentElement();
        } else {
          this.paymentError = 'Error al crear la intención de pago.';
        }
      },
      error: (err) => {
        this.paymentError = 'Error al configurar el pago. Inténtalo de nuevo.';
        console.error('Payment intent error:', err);
      }
    });
  }

  async createStripePaymentIntent() {
  const paymentData = {
    email: this.tenant['email'].value,
    amount: 29900,
    currency: 'mxn',
    plan: 'Plan Básico'
  };

  this.paymentService.createStripePaymentIntent(paymentData).subscribe({
    next: async (response) => {
      if (response && response.clientSecret) {
        const candidate: any = response.clientSecret;
        if (typeof candidate === 'string' && candidate.startsWith('sk_')) {
          console.error('[registro] server returned secret key (sk_) instead of client_secret');
          this.paymentError = 'Error de configuración: el servidor está devolviendo la clave secreta de Stripe.';
          return;
        }
        if (typeof candidate === 'string' && !candidate.includes('_secret_')) {
          console.error('[registro] received value is not a client_secret:', candidate);
          this.paymentError = 'El servidor no devolvió un client_secret válido.';
          return;
        }
        this.clientSecret = candidate;
        console.debug('[registro] received clientSecret:', this.clientSecret);
        this.paymentElementLoading = true;
        await this.setupPaymentElement();
      } else {
        this.paymentError = 'No se obtuvo clientSecret.';
      }
    },
    error: (err) => {
      console.error('Error creando PaymentIntent:', err);
      this.paymentError = 'Error al crear el PaymentIntent.';
    }
  });
}


  async setupPaymentElement() {
    if (!this.stripe || !this.clientSecret) {
      console.warn('[registro] setupPaymentElement aborted: stripe or clientSecret missing', { stripe: !!this.stripe, clientSecret: !!this.clientSecret });
      this.paymentElementLoading = false;
      return;
    }

    try {
      console.debug('[registro] setupPaymentElement() starting...');

      // small tick to ensure template rendered and #payment-element exists
      await new Promise((r) => setTimeout(r, 0));

      this.elements = this.stripe.elements({
        clientSecret: this.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#1e40af',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#df1b41',
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px'
          }
        }
      });

      this.paymentElement = this.elements.create('payment');
      this.paymentElement.mount('#payment-element');

      // Fallback check: sometimes 'ready' may not fire (network/HTTP issues). Inspect DOM after short delay
      setTimeout(() => {
        try {
          const container = document.getElementById('payment-element');
          console.debug('[registro] payment-element container after mount:', container);
          if (container && container.children && container.children.length > 0 && !this.stripeInitialized) {
            console.debug('[registro] payment-element appears to be mounted (children found). Marking as initialized.');
            this.stripeInitialized = true;
            this.paymentElementLoading = false;
            clearTimeout((<any>window).__lealtixPaymentReadyTimeout);
          }
        } catch (err) {
          console.warn('[registro] fallback DOM check failed:', err);
        }
      }, 600);

      // safety timeout: if Stripe doesn't fire 'ready' within 10s, fail gracefully
      const readyTimeout = setTimeout(() => {
        if (!this.stripeInitialized) {
          console.error('[registro] paymentElement ready timeout');
          this.paymentError = 'El formulario de pago tardó en cargar. Inténtalo de nuevo.';
          this.paymentElementLoading = false;
        }
      }, 10000);

      this.paymentElement.on('ready', () => {
        console.debug('[registro] paymentElement ready');
        clearTimeout(readyTimeout);
        this.stripeInitialized = true;
        this.paymentElementLoading = false;
      });

      this.paymentElement.on('change', (event) => {
        // event typing from stripe may not expose `error` in our TS defs; use any to be safe
        const e: any = event;
        if (e && e.error) {
          this.paymentError = e.error.message;
        } else {
          this.paymentError = null;
        }
      });

      console.debug('[registro] setupPaymentElement() mounted, waiting for ready...');

    } catch (error) {
      this.paymentError = 'Error al cargar el formulario de pago.';
      this.paymentElementLoading = false;
      console.error('Payment element setup error:', error);
    }
  }

  async processPayment() {
    if (!this.stripe || !this.elements || !this.clientSecret) {
      this.paymentError = 'Sistema de pago no inicializado correctamente.';
      return;
    }

    this.isProcessingPayment = true;
    this.paymentError = null;

    try {
      const { error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}/registro-completado`,
        },
        redirect: 'if_required'
      });

      if (error) {
        this.paymentError = error.message || 'Error al procesar el pago.';
        this.isProcessingPayment = false;
      } else {
        debugger;
        this.confettiService.trigger({ action: 'burst' });
        this.activeStep = 2;
        this.isProcessingPayment = false;
      }
    } catch (error) {
      this.paymentError = 'Error inesperado al procesar el pago.';
      this.isProcessingPayment = false;
      console.error('Payment processing error:', error);
    }
  }

  // Navigation methods
  goToDashboard() {
    // Inline confirmation used; simply navigate
    this.router.navigate(['/login']);
  }
}
