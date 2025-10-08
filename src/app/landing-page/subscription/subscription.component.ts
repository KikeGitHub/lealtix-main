import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '../../services/subscription.service';
import { clearMessage } from '../../utils/clear-message';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class SubscriptionComponent {
  suscripcionForm: FormGroup;
  loading = false;
  message: string | null = null;
  messageType: 'success' | 'error' | null = null;

  constructor(private fb: FormBuilder, private subscriptionService: SubscriptionService) {
    this.suscripcionForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.suscripcionForm.invalid) {
      this.suscripcionForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.message = null;

    const { nombre, email } = this.suscripcionForm.value;
    this.subscriptionService.preSubscribe({ nombre, email }).subscribe({
      next: () => {
        this.message = 'Gracias por suscribirte a Lealtix 🎉 Revisa tu correo para continuar.';
        this.messageType = 'success';
        this.suscripcionForm.reset();
      },
      error: () => {
        this.message = 'Este correo ya está registrado ❌';
        this.messageType = 'error';
        this.loading = false;
    clearMessage(this);
      },
      complete: () => {
        this.loading = false;
    clearMessage(this);
      }
    });
  }
}
