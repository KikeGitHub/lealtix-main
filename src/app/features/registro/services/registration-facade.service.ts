import { Injectable, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TokenValidationService } from '../../../services/token-validation.service';
import { RegisterService } from '../../../services/register.service';
import { PaymentService } from '../../../services/payment.service';
import { StripePaymentGatewayService, StripeErrorDetails } from '../../../core/services/stripe-payment-gateway.service';
import { ConfettiService } from '../../../confetti/confetti.service';
import { minAgeValidator } from '../../../shared/validators/min-age.validator';
import { RegisterModel } from '../../../models/RegisterModel';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistrationFacadeService {
  // Estado reactivo con Signals
  private _loading = signal<boolean>(true);
  private _activeStep = signal<number>(0);
  private _isValidating = signal<boolean>(false);
  private _errorMsg = signal<string | null>(null);
  private _showPassword = signal<boolean>(false);
  private _userId = signal<string | null>(null);
  private _clientSecret = signal<string | null>(null);
  private _stripeInitialized = signal<boolean>(false);
  private _paymentElementLoading = signal<boolean>(false);
  private _isProcessingPayment = signal<boolean>(false);
  private _paymentError = signal<string | null>(null);
  private _paymentFailed = signal<boolean>(false);
  private _retryInProgress = signal<boolean>(false);
  private _paymentErrorDetails = signal<StripeErrorDetails | null>(null);
  private _showErrorDetails = signal<boolean>(false);
  private _paymentConfirmed = signal<boolean>(false);

  // Selectores públicos de solo lectura
  public readonly loading = computed(() => this._loading());
  public readonly activeStep = computed(() => this._activeStep());
  public readonly isValidating = computed(() => this._isValidating());
  public readonly errorMsg = computed(() => this._errorMsg());
  public readonly showPassword = computed(() => this._showPassword());
  public readonly userId = computed(() => this._userId());
  public readonly clientSecret = computed(() => this._clientSecret());
  public readonly stripeInitialized = computed(() => this._stripeInitialized());
  public readonly paymentElementLoading = computed(() => this._paymentElementLoading());
  public readonly isProcessingPayment = computed(() => this._isProcessingPayment());
  public readonly paymentError = computed(() => this._paymentError());
  public readonly paymentFailed = computed(() => this._paymentFailed());
  public readonly retryInProgress = computed(() => this._retryInProgress());
  public readonly paymentErrorDetails = computed(() => this._paymentErrorDetails());
  public readonly showErrorDetails = computed(() => this._showErrorDetails());
  public readonly paymentConfirmed = computed(() => this._paymentConfirmed());

  public readonly registroForm: FormGroup;
  public readonly stepItems = [
    { label: 'Información Personal' },
    { label: 'Método de Pago' },
    { label: 'Confirmación' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private tokenValidationService: TokenValidationService,
    private registerService: RegisterService,
    private paymentService: PaymentService,
    private stripeGateway: StripePaymentGatewayService,
    private confettiService: ConfettiService
  ) {
    this.registroForm = this.fb.group({
      tenant: this.fb.group({
        fullName: ['', Validators.required],
        fechaNacimiento: ['', [Validators.required, minAgeValidator(18)]],
        telefono: [''],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
      }),
    });
  }

  public get tenantGroup(): FormGroup {
    return this.registroForm.get('tenant') as FormGroup;
  }

  public validateInvitation(registerParam: string | null, tokenParam: string | null): void {
    if (registerParam !== 'true' || !tokenParam) {
      this._errorMsg.set('Invitación inválida o incompleta.');
      this._loading.set(false);
      this.router.navigate(['/error'], { queryParams: { msg: this._errorMsg() } });
      return;
    }

    this.tokenValidationService.validateToken(tokenParam).subscribe({
      next: (resp: any) => {
        if (resp && resp.code) {
          const tenantGroup = this.tenantGroup;
          tenantGroup.patchValue({
            email: resp.object.registroDto.email,
            fullName: resp.object.registroDto.fullName,
            fechaNacimiento: resp.object.registroDto.fechaNacimiento
              ? new Date(resp.object.registroDto.fechaNacimiento).toISOString().substring(0, 10)
              : '',
          });
          tenantGroup.get('email')?.disable();
          this._loading.set(false);
        } else {
          this._errorMsg.set(resp?.message || 'Error al validar invitación.');
          this._loading.set(false);
          this.router.navigate(['/error'], { queryParams: { msg: this._errorMsg() } });
        }
      },
      error: (err: any) => {
        this._errorMsg.set('Hubo un error al procesar la invitación. Intenta más tarde.');
        this._loading.set(false);
        this.router.navigate(['/error'], { queryParams: { msg: this._errorMsg() } });
      }
    });
  }

  public togglePasswordVisibility(): void {
    this._showPassword.update((val) => !val);
  }

  public toggleErrorDetails(): void {
    this._showErrorDetails.update((val) => !val);
  }

  public goToStep(stepIndex: number): void {
    if (this._paymentConfirmed() && stepIndex < 2) {
      return; // Bloqueado tras pago confirmado
    }
    this._activeStep.set(stepIndex);
  }

  public nextStep(tokenParam: string): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this._isValidating.set(true);
    const formValues = this.registroForm.getRawValue();

    const data: RegisterModel = {
      token: tokenParam,
      fullName: formValues.tenant.fullName,
      email: formValues.tenant.email,
      telefono: formValues.tenant.telefono ? formValues.tenant.telefono.toString() : '',
      password: formValues.tenant.password,
      fechaNacimiento: formValues.tenant.fechaNacimiento,
    };

    this.registerService.register(data).subscribe({
      next: (resp: any) => {
        this._isValidating.set(false);
        if (resp && resp.object) {
          this._userId.set(resp.object.id);
          this._activeStep.set(1);
          this.initializeStripePayment();
        } else {
          this._errorMsg.set(resp?.message || 'Error al registrar.');
        }
      },
      error: (err: any) => {
        this._isValidating.set(false);
        this._errorMsg.set(err?.error?.message || 'Ocurrió un error al registrar.');
      }
    });
  }

  public previousStep(): void {
    if (this._activeStep() > 0 && !this._paymentConfirmed()) {
      this._activeStep.update((s) => s - 1);
    }
  }

  public initializeStripePayment(): void {
    const currentUserId = this._userId();
    if (!currentUserId) return;

    this._paymentElementLoading.set(true);
    this._paymentError.set(null);
    this._paymentErrorDetails.set(null);

    const formValues = this.registroForm.getRawValue()?.tenant || {};
    const emailVal = formValues.email || '';
    const nameVal = formValues.fullName || '';
    const payload = {
      email: emailVal,
      plan: 'mensual',
      userId: currentUserId,
      name: nameVal,
      amount: 29900,
      currency: 'usd'
    };

    this.paymentService.createStripePaymentIntent(payload).subscribe({
      next: async (res: any) => {
        const clientSec = res.object.clientSecret;
        this._clientSecret.set(clientSec);

        // Esperar a que el elemento contenedor esté disponible en el DOM
        setTimeout(async () => {
          const container = document.getElementById('payment-element');
          if (container) {
            const mounted = await this.stripeGateway.mountPaymentElement(
              container,
              clientSec,
              environment.stripePublishableKey
            );
            this._stripeInitialized.set(mounted);
          }
          this._paymentElementLoading.set(false);
        }, 150);
      },
      error: (err: any) => {
        console.error('Error al crear PaymentIntent:', err);
        this._paymentElementLoading.set(false);
        this._paymentError.set('No se pudo inicializar la pasarela de pago.');
      }
    });
  }

  public async processPayment(): Promise<void> {
    if (!this._stripeInitialized() || this._isProcessingPayment()) return;

    this._isProcessingPayment.set(true);
    this._paymentError.set(null);
    this._paymentErrorDetails.set(null);
    this._paymentFailed.set(false);

    const returnUrl = `${window.location.origin}/checkout/success`;
    const result = await this.stripeGateway.confirmPayment(returnUrl);

    this._isProcessingPayment.set(false);

    if (result.success) {
      this._paymentConfirmed.set(true);
      this._activeStep.set(2);
      this.confettiService.trigger({ action: 'burst' });
    } else {
      this._paymentFailed.set(true);
      this._paymentError.set(result.error || 'Error al procesar el pago.');
      this._paymentErrorDetails.set(result.errorDetails || null);
    }
  }

  public async retryPayment(): Promise<void> {
    if (this._retryInProgress()) return;
    this._retryInProgress.set(true);
    this._paymentError.set(null);
    this._paymentErrorDetails.set(null);

    await this.processPayment();
    this._retryInProgress.set(false);
  }

  public cleanup(): void {
    this.stripeGateway.destroyPaymentElement();
  }
}
