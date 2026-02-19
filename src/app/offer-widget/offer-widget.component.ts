import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OfferWidgetService } from './offer-widget.service';

@Component({
  selector: 'offer-widget',
  templateUrl: './offer-widget.component.html',
  styleUrls: ['./offer-widget.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class OfferWidgetComponent implements OnInit {
  @Input() widgetToken?: string;
  @Input() apiBaseUrl?: string;
  @Output() success = new EventEmitter<any>();
  @Output() error = new EventEmitter<any>();

  customerForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private svc: OfferWidgetService) {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(140), Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      phone: ['', []],
      acceptedPromotions: [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit(): void {}

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 10);
    this.customerForm.get('phone')?.setValue(input.value);
  }

  onSubmit() {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = { ...this.customerForm.value };

    this.svc.submit(payload, this.apiBaseUrl || '', this.widgetToken).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res?.message || 'Registro guardado.';
        this.success.emit(res);
        setTimeout(() => (this.successMessage = ''), 4000);
        this.customerForm.reset();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Ocurrió un error al enviar.';
        this.error.emit(err);
      }
    });
  }
}
