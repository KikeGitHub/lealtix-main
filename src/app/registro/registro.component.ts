
import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MAT_DATE_LOCALE } from '@angular/material/core';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { RippleModule } from 'primeng/ripple';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { PagoComponent } from '../pago/pago.component';
import { TokenValidationService } from '../services/token-validation.service';
import { RegisterModel } from '../models/RegisterModel';
import { RegisterService } from '../services/register.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    InputTextModule,
    ButtonModule,
    InputMaskModule,
    InputNumberModule,
    RippleModule,
    CardModule,
    DatePickerModule,
    MessageModule,
    ToastModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-MX' }
  ],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  showPassword = false;
  isSubmitting = false;
  registroForm: FormGroup;
  submitted = false;
  pagoValido = false;
  showPagoModal = false;
  pagoResult: any = null;
  today = new Date();
  yearRange = `1950:${new Date().getFullYear()}`;
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
        fullName: ['', Validators.required],
        fechaNacimiento: ['', Validators.required],
        telefono: ['', [
          Validators.pattern('^[0-9]{10}$'),
          Validators.required
        ]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
      })
    });

    // Validar query params y token
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
          debugger;
            if (resp && resp.code) {
              const tenantGroup = this.registroForm.get('tenant') as FormGroup;
              tenantGroup.patchValue({
                email: resp.object.registroDto.email,
                fullName: resp.object.registroDto.fullName,
                fechaNacimiento: resp.object.registroDto.fechaNacimiento
                  ? new Date(resp.object.registroDto.fechaNacimiento).toISOString().substring(0, 10)
                  : '',
                telefono: resp.object.registroDto.telefono || ''
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

  onCancel() {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
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
  fullName: this.tenant['fullName'].value,
  fechaNacimiento: this.tenant['fechaNacimiento'].value,
  telefono: this.tenant['telefono'].value,
  email: this.tenant['email'].value,
  password: this.tenant['password'].value,
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
