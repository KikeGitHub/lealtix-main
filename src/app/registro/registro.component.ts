import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { TokenValidationService } from '../services/token-validation.service';
import { RegisterModel } from '../models/RegisterModel';
import { RegisterService } from '../services/register.service';
import { PaymentService } from '../services/payment.service';
import { environment } from '../../environments/environment';
import { ConfettiService } from '../confetti/confetti.service';
import { ConfettiComponent } from '../confetti/confetti.component';

@Component({
  selector: 'app-registro',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    ReactiveFormsModule,
    CommonModule,
      RouterModule,
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
    ConfettiComponent,
  ],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent implements OnInit, OnDestroy {
  // Form properties
  showPassword = false;
  registroForm: FormGroup;
  submitted = false;
  loading = true;
  errorMsg: string | null = null;

  // Stepper properties
  activeStep: number = 0;
  isValidating = false;
  stepItems: any[] = [
    { label: 'Información Personal' },
    { label: 'Método de Pago' },
    { label: 'Confirmación' },
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
  // Flag to indicate a failed payment that can be retried
  paymentFailed: boolean = false;
  // Flag used while retrying to avoid double clicks
  retryInProgress: boolean = false;
  // Structured payment error details (technical) for support/debug
  paymentErrorDetails:
    | { code?: string; decline_code?: string; stripeMessage?: string; paymentIntentId?: string }
    | null = null;
  // Toggle to show/hide technical details in the UI
  showErrorDetails: boolean = false;
  // Track which clientSecret the currently mounted element was created with
  mountedClientSecret: string | null = null;
  userId: string | null = null;
  // Flag set when payment is finally confirmed (succeeded)
  paymentConfirmed: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tokenValidationService: TokenValidationService,
    private registerService: RegisterService,
    private paymentService: PaymentService,
    private confettiService: ConfettiService
  ) {
    this.registroForm = this.fb.group({
      tenant: this.fb.group({
        fullName: ['', Validators.required],
        fechaNacimiento: ['', [Validators.required, this.minAgeValidator(18)]],
        telefono: [''],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
      }),
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
              telefono: resp.object.registroDto.telefono || '',
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
          debugger;
          this.errorMsg = err?.error?.message || 'Invitación inválida o expirada.';
          this.loading = false;
          this.router.navigate(['/error'], { queryParams: { msg: this.errorMsg } });
        },
      });
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.tenant[fieldName];
    return field && field.invalid && (field.dirty || field.touched || this.submitted);
  }

  minAgeValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) return null;
      const dob = new Date(value);
      if (isNaN(dob.getTime())) return { invalidDate: true };
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age } };
    };
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
    // Prevent going back once payment is confirmed
    if (this.paymentConfirmed) {
      return;
    }
    if (this.activeStep > 0) {
      this.activeStep--;
    }
  }

  onStepClick(index: number) {
    // Block navigation to steps 0 and 1 once payment is confirmed
    if (this.paymentConfirmed && index < 2) {
      return;
    }
    this.activeStep = index;
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
      token: this.route.snapshot.queryParams['token'],
    };

    this.registerService.register(registroData).subscribe({
      next: (resp) => {
        if (resp && resp.object) {
          this.userId = resp.object.id;
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
      },
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



  async createStripePaymentIntent() {
    // small debugger left intentionally commented for dev-time troubleshooting
    // debugger;
    const paymentData = {
      email: this.tenant['email'].value,
      amount: 29900,
      currency: 'mxn',
      plan: 'Plan Básico',
      userId: this.userId,
    };

  // Reset retry/failure and error detail state when creating a fresh PaymentIntent
  this.paymentFailed = false;
  this.retryInProgress = false;
  this.paymentErrorDetails = null;
  this.showErrorDetails = false;
  // Show loading overlay while we request the client_secret and initialize the element
  this.paymentElementLoading = true;

    this.paymentService.createStripePaymentIntent(paymentData).subscribe({
      next: async (response) => {
        try {
          if (response && response.clientSecret) {
            const candidate: any = response.clientSecret;
            if (typeof candidate === 'string' && candidate.startsWith('sk_')) {
              console.error('[registro] server returned secret key (sk_) instead of client_secret');
              this.paymentError = 'Error de configuración: el servidor está devolviendo la clave secreta de Stripe.';
              this.paymentElementLoading = false;
              return;
            }
            if (typeof candidate === 'string' && !candidate.includes('_secret_')) {
              console.error('[registro] received value is not a client_secret:', candidate);
              this.paymentError = 'El servidor no devolvió un client_secret válido.';
              this.paymentElementLoading = false;
              return;
            }
            this.clientSecret = candidate;
            console.debug('[registro] received clientSecret:', this.clientSecret);
            // Keep the overlay visible until setupPaymentElement clears it
            await this.setupPaymentElement();
          } else {
            this.paymentError = 'No se obtuvo clientSecret.';
            this.paymentElementLoading = false;
          }
        } catch (err) {
          console.error('createStripePaymentIntent next-handler error:', err);
          this.paymentError = 'Error al preparar el formulario de pago.';
          this.paymentElementLoading = false;
        }
      },
      error: (err) => {
        console.error('Error creando PaymentIntent:', err);
        this.paymentError = 'Error al crear el PaymentIntent.';
        this.paymentElementLoading = false;
      },
    });
  }

  async setupPaymentElement() {
    if (!this.stripe || !this.clientSecret) {
      console.warn('[registro] setupPaymentElement aborted: stripe or clientSecret missing', {
        stripe: !!this.stripe,
        clientSecret: !!this.clientSecret,
      });
      this.paymentElementLoading = false;
      return;
    }

    try {
      console.debug('[registro] setupPaymentElement() starting...');

      // If a previous element exists, only unmount/destroy it when the clientSecret changed
      try {
        if (this.paymentElement && this.mountedClientSecret && this.mountedClientSecret !== this.clientSecret) {
          try { this.paymentElement.unmount(); } catch (uErr) { console.warn('[registro] error unmounting previous paymentElement:', uErr); }
          try { (this.paymentElement as any).destroy?.(); } catch (dErr) { console.warn('[registro] error destroying previous paymentElement:', dErr); }
          this.paymentElement = null;
          this.mountedClientSecret = null;
        }
      } catch (errUnmount) {
        console.warn('[registro] failed to cleanup previous payment element:', errUnmount);
      }

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
            borderRadius: '8px',
          },
        },
      });

      // If we already have a mounted element for the same clientSecret, skip creating a new one.
      if (!this.paymentElement) {
        this.paymentElement = this.elements.create('payment');
        this.paymentElement.mount('#payment-element');
        this.mountedClientSecret = this.clientSecret;
      } else {
        // element already exists and was not recreated; ensure mountedClientSecret is set
        this.mountedClientSecret = this.mountedClientSecret || this.clientSecret;
      }

      // Fallback check: sometimes 'ready' may not fire (network/HTTP issues). Inspect DOM after short delay
      setTimeout(() => {
        try {
          const container = document.getElementById('payment-element');
          console.debug('[registro] payment-element container after mount:', container);
          if (
            container &&
            container.children &&
            container.children.length > 0 &&
            !this.stripeInitialized
          ) {
            console.debug(
              '[registro] payment-element appears to be mounted (children found). Marking as initialized.'
            );
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
          // show immediate validation errors
          this.paymentError = e.error.message;
        } else {
          // only clear transient validation errors when we are NOT in a payment-failed state
          if (!this.paymentFailed) {
            this.paymentError = null;
          }
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
      const result = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}/registro-completado`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        // Payment failed synchronously (card declined, validation, etc.)
        const err: any = (result as any).error || {};
        // Fill technical details for support (code, decline_code, message)
        this.paymentErrorDetails = {
          code: err.code,
          decline_code: err.decline_code,
          stripeMessage: err.message,
          paymentIntentId: undefined,
        };

        // Friendly message to show to the user, based on the code / decline_code
        this.paymentError = this.getFriendlyMessage(err.code, err.decline_code, err.message);

        this.paymentFailed = true;
        this.isProcessingPayment = false;
        console.warn('Stripe confirmPayment returned error', err);
        // Stop further processing when Stripe returned an error.
        return;
      }

      const pi = (result as any).paymentIntent;
      debugger;
      if (pi) {
        // Comprueba el estado explícitamente
        if (pi.status === 'succeeded') {
          // mark confirmed before UI celebration and navigation locking
          this.paymentConfirmed = true;
          this.confettiService.trigger({ action: 'burst' });
          this.activeStep = 2;
        } else if (pi.status === 'processing' || pi.status === 'requires_capture') {
          this.activeStep = 2; // o un estado "pendiente"
          this.paymentError = 'El pago está en proceso. Te notificaremos cuando esté confirmado.';
        } else {
          // For statuses like 'requires_payment_method' the card was rejected — allow retry
          this.paymentFailed = true;
          const lastErr: any = pi.last_payment_error || {};
          this.paymentErrorDetails = {
            code: lastErr.code,
            decline_code: lastErr.decline_code,
            stripeMessage: lastErr.message,
            paymentIntentId: pi.id,
          };
          this.paymentError = this.getFriendlyMessage(lastErr.code, lastErr.decline_code, lastErr.message) || `Estado de pago: ${pi.status}`;
        }
      } else {
        // No paymentIntent returned but also no error: treat as success for UX purposes
        this.paymentConfirmed = true;
        this.confettiService.trigger({ action: 'burst' });
        this.paymentError = null;
        this.activeStep = 2;
      }

      this.isProcessingPayment = false;
    } catch (error) {
      const errAny: any = error || {};
      this.paymentErrorDetails = {
        code: errAny.code,
        decline_code: errAny.decline_code,
        stripeMessage: errAny.message || String(errAny),
        paymentIntentId: undefined,
      };
      this.paymentError = this.getFriendlyMessage(errAny.code, errAny.decline_code, errAny.message) || 'Error inesperado al procesar el pago.';
      this.paymentFailed = true;
      this.isProcessingPayment = false;
      console.error('Payment processing error:', error);
    }
  }

  /**
   * Map stripe error codes and decline codes to friendly, actionable messages for end users.
   * Keep this list small and focused; fall back to the provider message when available.
   */
  getFriendlyMessage(code?: string, declineCode?: string, stripeMessage?: string): string {
    // Prefer decline_code because it's more specific for issuer declines
    if (declineCode) {
      switch (declineCode) {
        case 'insufficient_funds':
          return 'Fondos insuficientes. Intenta con otra tarjeta o contacta a tu banco.';
        case 'lost_card':
          return 'La tarjeta fue reportada como perdida. Usa otra tarjeta.';
        case 'stolen_card':
          return 'La tarjeta fue reportada como robada. Usa otra tarjeta.';
        case 'incorrect_number':
          return 'El número de tarjeta parece incorrecto. Verifica los datos e intenta de nuevo.';
        default:
          // fall back to stripeMessage when available
          return stripeMessage || 'El pago fue rechazado por el emisor. Intenta con otra tarjeta.';
      }
    }

    if (code) {
      switch (code) {
        case 'card_declined':
          return 'Tu banco rechazó la tarjeta. Intenta con otra tarjeta o contacta a tu banco.';
        case 'incorrect_cvc':
          return 'El código CVC es incorrecto. Verifica y vuelve a intentarlo.';
        case 'expired_card':
          return 'La tarjeta está vencida. Usa otra tarjeta.';
        case 'processing_error':
          return 'Ocurrió un error procesando el pago. Intenta de nuevo en unos minutos.';
        case 'authentication_required':
          return 'Tu banco requiere autenticación adicional. Sigue las instrucciones para completar el pago.';
        default:
          return stripeMessage || 'Hubo un problema con el pago. Intenta con otra tarjeta.';
      }
    }

    // Last fallback
    return stripeMessage || 'No se pudo procesar el pago. Intenta de nuevo.';
  }

  /**
   * Retry the payment flow by requesting a new PaymentIntent and remounting the PaymentElement.
   * This follows Stripe best-practices: on a payment failure that requires a new payment method
   * create a fresh PaymentIntent and collect payment details again instead of reusing the old one.
   */
  async retryPayment() {
    if (this.retryInProgress) return;
    this.retryInProgress = true;
    this.paymentError = null;
    // Keep the mounted element when possible to avoid a full reset of the component.
    // Request a new client secret and let setupPaymentElement decide whether the element
    // needs recreation (we only recreate if clientSecret actually changed).
    try {
      await this.createStripePaymentIntent();
    } catch (err) {
      console.error('Retry createStripePaymentIntent failed:', err);
      this.paymentError = 'No se pudo reintentar el pago. Inténtalo de nuevo más tarde.';
    } finally {
      this.retryInProgress = false;
    }
  }

  goToDashboard() {
    this.router.navigate(['http://localhost:4201/auth/login']);
  }
}
