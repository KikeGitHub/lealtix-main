import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SubscriptionComponent } from './subscription/subscription.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [SubscriptionComponent, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent {
  suscripcionForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.suscripcionForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.suscripcionForm.invalid) {
      this.suscripcionForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { nombre, email } = this.suscripcionForm.value;

    this.http
      .post<{ success: boolean; message: string }>('http://localhost:3000/api/suscripcion', {
        nombre,
        email,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            alert(
              'Gracias por suscribirte a Lealtix 🎉, te enviamos un correo para continuar tu registro.'
            );
            this.suscripcionForm.reset();
          } else {
            alert(res.message || 'El correo ya está registrado.');
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error en la suscripción:', err);
          alert('Hubo un problema con la suscripción, intenta más tarde.');
          this.loading = false;
        },
      });
  }
}
