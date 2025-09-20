
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PagoComponent } from '../pago/pago.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenValidationService } from '../services/token-validation.service';
import { RegisterModel } from '../models/RegisterModel';
import { RegisterService } from '../services/register.service';

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
  showPagoModal = false;
  pagoResult: any = null;
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
    private tokenValidationService: TokenValidationService,
    private registerService: RegisterService,
     private dialog: MatDialog
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
            if (resp && resp.code) {
              const tenantGroup = this.registroForm.get('tenant') as FormGroup;
              tenantGroup.patchValue({
                email: resp.object.registroDto.email,
                nombre: resp.object.registroDto.nombre || '',
                paterno: resp.object.registroDto.paterno || '',
                materno: resp.object.registroDto.materno || '',
                fechaNacimiento: resp.object.registroDto.fechaNacimiento
                  ? new Date(resp.object.registroDto.fechaNacimiento).toISOString().substring(0, 10)
                  : '',
                telefono: resp.object.registroDto.telefono || ''
              });
              const negocioGroup = this.registroForm.get('negocio') as FormGroup;
              negocioGroup.patchValue({
                nombreNegocio: resp.object.registroDto.nombreNegocio || '',
                direccion: resp.object.registroDto.direccion || '',
                telefono: resp.object.registroDto.telefono || '',
                tipoNegocio: resp.object.registroDto.tipoNegocio || ''
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


  cerrarPagoModal() {
    this.showPagoModal = false;
  }

  onPagoResult(result: any) {
    this.pagoResult = result;
    if (result.status === 'success') {
      this.pagoValido = true;
      this.showPagoModal = false;
    } else {
      this.pagoValido = false;
    }
  }

  onSubmit() {
    debugger
    this.submitted = true;
    if (this.registroForm.invalid) {
      console.log(this.registroForm.errors, this.registroForm);
      return;
    }
    const registroData: RegisterModel = {
      nombre: this.tenant['nombre'].value,
      paterno: this.tenant['paterno'].value,
      materno: this.tenant['materno'].value,
      fechaNacimiento: this.tenant['fechaNacimiento'].value,
      telefono: this.tenant['telefono'].value,
      email: this.tenant['email'].value,
      password: this.tenant['contrasena'].value,
      nombreNegocio: this.negocio['nombreNegocio'].value,
      direccion: this.negocio['direccion'].value,
      telefonoNegocio: this.negocio['telefono'].value,
      tipoNegocio: this.negocio['tipoNegocio'].value,
      plan: 'basic',
      status: 'active',
      token: this.route.snapshot.queryParams['token']
    };
    this.registerService.register(registroData).subscribe({
      next: (resp) => {
        // Abrir PagoComponent como modal y pasar el email
        this.dialog.open(PagoComponent, {
          width: '400px',
          data: { tenantId: resp.object }
        });
      },
      error: (err) => {
        this.errorMsg = 'Error al registrar usuario. Inténtalo de nuevo más tarde.';
        this.loading = false;
      }
    });
    this.submitted = false;
    this.pagoValido = false;
    this.pagoResult = null;
  }

}
