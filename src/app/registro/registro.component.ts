import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenValidationService } from '../services/token-validation.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  registroForm: FormGroup;
  submitted = false;
  pagoValido = false;
  tiposNegocio = [
    { value: 'Cafeteria', label: 'Cafetería' },
    { value: 'Boutique', label: 'Boutique' },
    { value: 'Restaurant', label: 'Restaurante' }
  ];
  errorMsg: string | null = null;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tokenValidationService: TokenValidationService
  ) {
    this.registroForm = this.fb.group({
      tenant: this.fb.group({
        nombre: ['', Validators.required],
        paterno: ['', Validators.required],
        materno: [''],
        fechaNacimiento: ['', Validators.required],
        telefono: [''],
        email: ['', [Validators.required, Validators.email]],
        contrasena: ['', Validators.required]
      }),
      negocio: this.fb.group({
        nombreNegocio: ['', Validators.required],
        direccion: [''],
        telefono: [''],
        tipoNegocio: ['', Validators.required]
      }),
      pago: this.fb.group({
        tarjeta: ['', Validators.required],
        expiracion: ['', Validators.required],
        cvc: ['', Validators.required]
      })
    });

    // Validar query params y token
    this.route.queryParams.subscribe(params => {
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
          debugger;
          if (resp && resp.ok) {
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

  get f() {
    return this.registroForm.controls;
  }
  get tenant() {
    return (this.registroForm.get('tenant') as FormGroup).controls;
  }
  get negocio() {
    return (this.registroForm.get('negocio') as FormGroup).controls;
  }
  get pago() {
    return (this.registroForm.get('pago') as FormGroup).controls;
  }


  simularPago() {
    this.pagoValido = true;
    alert('Pago simulado aprobado');
  }

  onSubmit() {
    this.submitted = true;
    if (this.registroForm.invalid) {
      return;
    }
    if (!this.pagoValido) {
      alert('Pago simulado no válido');
      return;
    }
    alert('Registro exitoso (simulado)');
    this.registroForm.reset();
    this.submitted = false;
    this.pagoValido = false;
  }
}
