import { AbstractControl, FormControl, FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { TenantUserService } from '../../services/tenant-user.service';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-admin-wizard',
  standalone: true,
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CdkStepperModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatTableModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'es-ES' }],
})
export class WizardComponent implements OnInit {
  passwordPattern = '^[a-zA-Z0-9!#$%&/()=?_.]*$';

  hidePassword = true;
  tenantId: number = 0;
  email: string = '';
  userForm: FormGroup;
  businessForm: FormGroup;
  aboutForm: FormGroup;
  schedulesForm: FormGroup;
  socialForm: FormGroup;
  logoPreview: string | ArrayBuffer | null = null;
  visionSuggestions = ['Calidad en cada taza', 'Compartimos momentos', 'Experiencia memorable'];
  displayedColumns = ['day', 'open', 'close', 'actions'];
  confirmMsg = '';
  // Habilita/deshabilita los campos de redes sociales
  enableSocial = true;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private tenantUserService: TenantUserService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      birthdate: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: [{ value: '', disabled: true }],
      password: ['', Validators.required],
    });

    this.businessForm = this.fb.group({
      businessName: ['', Validators.required],
      businessAddress: ['', Validators.required],
      businessPhone: ['', [Validators.required, Validators.pattern(/^\d{10,}$/)]],
      businessType: ['', Validators.required],
      businessLogo: [null],
      slogan: ['', Validators.required],
    });

    this.aboutForm = this.fb.group({
      history: ['', Validators.required],
      vision: ['', Validators.required],
      visionPoints: this.fb.array([this.fb.control('')]),
    });

    this.schedulesForm = this.fb.group({
      schedules: this.fb.array([this.createScheduleGroup()]),
    });

    this.socialForm = this.fb.group({
      facebook: [''],
      instagram: [''],
      tiktok: [''],
      twitter: [''],
      linkedin: [''],
    });
  }

  ngOnInit() {
    debugger;
    // obtener token de query params
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      // validar token y obtener datos del usuario
      this.tenantUserService.validateWizardToken(token).subscribe({
        next: (user) => {
          debugger;
          if (!user || !user.object) {
            // Si no hay usuario, redirigir a una página de error o mostrar mensaje
            this.router.navigate(['/error'], { queryParams: { message: 'Token inválido o expirado' } });
            return;
          }
          this.tenantId = user.object?.id.tenantId;
          this.email = user.object?.user.email;
          // llenar userForm con los datos obtenidos
          this.userForm.patchValue({
            name: user.object?.user?.fullName,
            birthdate: user.object?.user?.fechaNacimiento ? new Date(user.object.user.fechaNacimiento) : null,
            phone: user.object?.user?.telefono,
            email: user.object?.user?.email,
            password: user.object?.user?.password
          });
          // llenar businessForm con los datos obtenidos
          this.businessForm.patchValue({
            businessName: user.object?.tenant?.nombreNegocio,
            businessAddress: user.object?.tenant?.direccion,
            businessPhone: user.object?.tenant?.telefono,
            businessType: user.object?.tenant?.tipoNegocio
          });

        },
        error: (err) => {
          console.error('Error al validar token:', err);
        }
      });
    }

  }


  asFormControl(ctrl: AbstractControl) {
    return ctrl as FormControl;
  }

  get visionPoints() {
    return this.aboutForm.get('visionPoints') as FormArray;
  }

  addVisionPointFromInput(event: any) {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim() && this.visionPoints.length < 3) {
      this.visionPoints.push(this.fb.control(value.trim()));
    }

    if (input) {
      input.value = '';
    }
  }

  removeVisionPoint(index: number) {
    if (this.visionPoints.length > 1) {
      this.visionPoints.removeAt(index);
    }
  }

  get schedules() {
    return this.schedulesForm.get('schedules') as FormArray;
  }

  createScheduleGroup(): FormGroup {
    return this.fb.group({
      day: ['', Validators.required],
      open: ['', Validators.required],
      close: ['', Validators.required],
    });
  }

  addSchedule() {
    this.schedules.push(this.createScheduleGroup());
  }

  removeSchedule(index: number) {
    if (this.schedules.length > 1) {
      this.schedules.removeAt(index);
    }
  }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.businessForm.patchValue({ businessLogo: file });
      const reader = new FileReader();
      reader.onload = (e) => (this.logoPreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.confirmMsg = '¡Datos guardados exitosamente!';
    this.snackBar.open(this.confirmMsg, 'Cerrar', { duration: 3000 });
  }

  // Guarda la info del usuario y avanza el stepper
  onUserStepNext(stepper: any) {
    if (this.userForm.valid) {
      // Llena AppUserModel con los datos del formulario
      const userData = {
        fullName: this.userForm.value.name,
        fechaNacimiento: this.userForm.value.birthdate,
        telefono: this.userForm.value.phone,
        email: this.email,
        password: this.userForm.value.password,
      };
      debugger;
      this.tenantUserService.updateAppUser(this.tenantId, userData).subscribe({
        next: () => {
          //this.snackBar.open('Datos de usuario guardados', 'Cerrar', { duration: 2000 });
          stepper.next();
        },
        error: () => {
          this.snackBar.open('Error al guardar los datos de usuario', 'Cerrar', { duration: 2000 });
        },
      });
    } else {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 2000,
      });
      this.userForm.markAllAsTouched();
    }
  }
}
