/**
 * EJEMPLO DE USO - Formulario de Captura de Cliente
 *
 * Este archivo muestra cómo integrar el microcopy de privacidad
 * en un formulario de captura de clientes para landing pages de tenants.
 *
 * NO ES NECESARIO USAR ESTE ARCHIVO - es solo un ejemplo de referencia.
 * Copia y adapta el código según tus necesidades.
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LealtixConfig, PrivacyHelpers } from '../utils/lealtix-config';

@Component({
  selector: 'app-customer-capture-example',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="customer-capture-form">
      <h3>{{ formTitle }}</h3>
      <p class="form-subtitle">{{ formSubtitle }}</p>

      <form [formGroup]="customerForm" (ngSubmit)="onSubmit()">
        <!-- Nombre -->
        <div class="form-group">
          <label for="name">Nombre completo *</label>
          <input
            id="name"
            type="text"
            formControlName="name"
            placeholder="Tu nombre"
            [class.error]="customerForm.get('name')?.invalid && customerForm.get('name')?.touched"
          />
          <span class="error-message" *ngIf="customerForm.get('name')?.invalid && customerForm.get('name')?.touched">
            El nombre es requerido
          </span>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email">Correo electrónico *</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            placeholder="tu@email.com"
            [class.error]="customerForm.get('email')?.invalid && customerForm.get('email')?.touched"
          />
          <span class="error-message" *ngIf="customerForm.get('email')?.invalid && customerForm.get('email')?.touched">
            Ingresa un email válido
          </span>
        </div>

        <!-- Teléfono -->
        <div class="form-group">
          <label for="phone">Teléfono</label>
          <input
            id="phone"
            type="tel"
            formControlName="phone"
            placeholder="5512345678"
          />
        </div>

        <!-- Microcopy de Privacidad - Opción 1: Usando constantes directamente -->
        <div class="privacy-notice">
          <i class="icon-shield">🛡️</i>
          <p>
            {{ getConsentMessage() }}
            <a [href]="privacyUrl" target="_blank">Ver Aviso de Privacidad</a>
          </p>
        </div>

        <!-- Botón de envío -->
        <button
          type="submit"
          class="submit-button"
          [disabled]="customerForm.invalid || isSubmitting"
        >
          {{ isSubmitting ? 'Enviando...' : 'Registrarme' }}
        </button>

        <!-- Texto adicional de privacidad -->
        <p class="footer-text">
          {{ dataProtectionMessage }}
        </p>
      </form>
    </div>
  `,
  styles: [`
    .customer-capture-form {
      max-width: 500px;
      margin: 0 auto;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    h3 {
      color: #1e3a8a;
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }

    .form-subtitle {
      color: #64748b;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #334155;
      font-weight: 500;
      font-size: 0.9rem;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    input:focus {
      outline: none;
      border-color: #06b6d4;
      box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
    }

    input.error {
      border-color: #ef4444;
    }

    .error-message {
      display: block;
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .privacy-notice {
      background-color: #f0f9ff;
      border: 1px solid #bae6fd;
      border-left: 4px solid #06b6d4;
      border-radius: 8px;
      padding: 1rem;
      margin: 1.5rem 0;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      font-size: 0.875rem;
      color: #0c4a6e;
      line-height: 1.5;
    }

    .icon-shield {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .privacy-notice p {
      margin: 0;
    }

    .privacy-notice a {
      color: #0369a1;
      text-decoration: underline;
      font-weight: 600;
    }

    .privacy-notice a:hover {
      color: #1e3a8a;
    }

    .submit-button {
      width: 100%;
      padding: 0.875rem;
      background: linear-gradient(135deg, #1e3a8a 0%, #06b6d4 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
    }

    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .footer-text {
      text-align: center;
      color: #64748b;
      font-size: 0.8rem;
      margin-top: 1rem;
      margin-bottom: 0;
    }
  `]
})
export class CustomerCaptureExampleComponent {
  @Input() businessName: string = '';
  @Input() formTitle: string = 'Únete a nuestro programa de lealtad';
  @Input() formSubtitle: string = 'Recibe promociones y beneficios exclusivos';

  customerForm: FormGroup;
  isSubmitting = false;

  // Constantes de privacidad reutilizables
  privacyUrl = LealtixConfig.PRIVACY_URL;
  dataProtectionMessage = LealtixConfig.PRIVACY_MICROCOPY.REGISTRATION_CONSENT_SHORT;

  constructor(private fb: FormBuilder) {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
  }

  /**
   * Genera el mensaje de consentimiento personalizado con el nombre del negocio
   */
  getConsentMessage(): string {
    if (this.businessName) {
      return PrivacyHelpers.getRegistrationConsent(this.businessName, false);
    }
    return LealtixConfig.PRIVACY_MICROCOPY.REGISTRATION_CONSENT;
  }

  onSubmit() {
    if (this.customerForm.valid) {
      this.isSubmitting = true;

      const formData = {
        ...this.customerForm.value,
        // Aquí puedes agregar campos adicionales
        acceptedPrivacyPolicy: true,
        registrationDate: new Date().toISOString()
      };

      console.log('Datos del cliente:', formData);

      // Aquí llamarías a tu servicio para guardar el cliente
      // Ejemplo:
      // this.customerService.register(formData).subscribe({
      //   next: (response) => {
      //     console.log('Cliente registrado:', response);
      //     this.customerForm.reset();
      //     this.isSubmitting = false;
      //   },
      //   error: (error) => {
      //     console.error('Error al registrar:', error);
      //     this.isSubmitting = false;
      //   }
      // });

      // Simulación de llamada al servidor
      setTimeout(() => {
        this.isSubmitting = false;
        alert('¡Registro exitoso! (esto es solo una simulación)');
        this.customerForm.reset();
      }, 1500);
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.customerForm.controls).forEach(key => {
        this.customerForm.get(key)?.markAsTouched();
      });
    }
  }
}

/**
 * INSTRUCCIONES DE USO:
 *
 * 1. Importa el componente en tu landing page de tenant:
 *
 *    import { CustomerCaptureExampleComponent } from '../customer-capture-example/customer-capture-example.component';
 *
 * 2. Agrégalo al array de imports del componente:
 *
 *    imports: [
 *      CommonModule,
 *      CustomerCaptureExampleComponent,
 *      // ... otros imports
 *    ]
 *
 * 3. Úsalo en tu template:
 *
 *    <app-customer-capture-example
 *      [businessName]="navBarData.bussinessName"
 *      [formTitle]="'Únete al programa de lealtad de ' + navBarData.bussinessName"
 *      formSubtitle="Recibe cupones, promociones y beneficios exclusivos"
 *    ></app-customer-capture-example>
 *
 * 4. O si prefieres crear tu propio formulario, copia el código del microcopy:
 *
 *    HTML:
 *    <div class="privacy-notice">
 *      <i class="icon-shield">🛡️</i>
 *      <p>
 *        Al registrarte aceptas recibir promociones del negocio.
 *        Tus datos están protegidos y no se comparten con terceros.
 *        <a href="/privacy" target="_blank">Ver Aviso de Privacidad</a>
 *      </p>
 *    </div>
 *
 *    TypeScript:
 *    import { LealtixConfig } from '../utils/lealtix-config';
 *
 *    privacyUrl = LealtixConfig.PRIVACY_URL;
 *    consentMessage = LealtixConfig.PRIVACY_MICROCOPY.REGISTRATION_CONSENT;
 *
 * NOTA: Este componente es solo un ejemplo. Adáptalo según tus necesidades
 * o crea tu propia implementación siguiendo el patrón mostrado aquí.
 */
