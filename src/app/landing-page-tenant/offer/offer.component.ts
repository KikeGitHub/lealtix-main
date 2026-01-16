import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TenantCustomerService } from '../../services/tenant-customer.service';

@Component({
  selector: 'app-offer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.css'],
  providers: [TenantCustomerService]
})
export class OfferComponent implements OnInit {
  @Input() tenantId: number = 0;
  customerForm!: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private tenantCustomerService: TenantCustomerService
  ) {}

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(140), Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿÑñ\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', [Validators.required]],
      birthDate: ['', [Validators.required, this.minAgeValidator(13)]],
      phone: ['', [this.optionalPhoneValidator]]
      ,acceptedPromotions: [false]
    });
  }

  // Validador para edad mínima (en años). Retorna null si válido.
  minAgeValidator(minAge: number) {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) return null; // required validator manejará vacío
      const birth = new Date(value);
      if (isNaN(birth.getTime())) {
        return { invalidDate: true };
      }
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age } };
    };
  }

  // Validador opcional para teléfono: si viene vacío -> válido, si viene, debe ser 10 dígitos numéricos
  optionalPhoneValidator(control: AbstractControl) {
    const v = control.value;
    if (v === null || v === undefined || v === '') return null;
    const cleaned = String(v).replace(/\D+/g, '');
    if (!/^\d{10}$/.test(cleaned)) {
      return { invalidPhone: true };
    }
    return null;
  }

  // Formatea el input en vivo: elimina no numéricos y limita a 10 dígitos
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D+/g, '').slice(0, 10);
    if (input.value !== cleaned) {
      input.value = cleaned;
    }
    const control = this.customerForm.get('phone');
    if (control && control.value !== cleaned) {
      control.setValue(cleaned, { emitEvent: false });
    }
  }

  onSubmit(): void {
    debugger;
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;

    const formValue = this.customerForm.value;
    const genderValue = formValue.gender ? String(formValue.gender).toLowerCase() : formValue.gender;
    const phoneClean = formValue.phone ? String(formValue.phone).replace(/\D+/g, '') : undefined;

    const payload: any = {
      tenantId: this.tenantId,
      name: formValue.name,
      email: formValue.email,
      gender: genderValue,
      birthDate: formValue.birthDate
    };

    // Añadir acceptedPromotions y acceptedAt (fecha de hoy) al payload
    payload.acceptedPromotions = !!formValue.acceptedPromotions;
    const todayDateOnly = new Date().toISOString().split('T')[0];
    payload.acceptedAt = todayDateOnly;

    if (phoneClean) {
      payload.phone = phoneClean;
    }

    // TODO: Si tenantId no está disponible, debe extraerse desde auth, state o route param.
    if (!this.tenantId) {
        console.error('Tenant ID no está disponible.');
        this.errorMessage = 'Error: No se pudo identificar el negocio. No se puede registrar.';
        this.isLoading = false;
        return;
    }

    this.tenantCustomerService.createCustomer(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = '¡Registro exitoso! Revisa tu correo para ver nuestras promociones.';
        this.customerForm.reset();
      },
      error: (error) => {
        debugger;
        this.isLoading = false;
        this.errorMessage = error.error.message || 'Hubo un error en el registro. Por favor, inténtalo de nuevo.';
        console.error('Error al crear el cliente:', error);
      }
    });
  }
}
