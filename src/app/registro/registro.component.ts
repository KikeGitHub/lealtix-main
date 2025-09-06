import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
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
