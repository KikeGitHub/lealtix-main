import { AbstractControl, FormControl, FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
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
import { tenantModel } from '../../models/tenant-model';
import { tenantService } from '../../services/tenant.service';
import { tenantConfigModel } from '../../models/tenant-config.model';

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
  userId: number = 0;
  email: string = '';
  userForm: FormGroup;
  businessForm: FormGroup;
  tiposNegocio = [
    { value: 'Cafeteria', label: 'Cafetería' },
    { value: 'Boutique', label: 'Boutique' },
    { value: 'Restaurant', label: 'Restaurante' }
  ];
  aboutForm: FormGroup;
  socialForm: FormGroup;
  logoPreview: string | ArrayBuffer | null = null;
  visionSuggestions = ['Calidad en cada taza', 'Compartimos momentos', 'Experiencia memorable'];
  displayedColumns = ['day', 'open', 'close', 'actions'];
  confirmMsg = '';
  // Habilita/deshabilita los campos de redes sociales
  enableSocial = true;
  fileName: string = '';
  snackBar: any;

  constructor(
    private fb: FormBuilder,
    private tenantUserService: TenantUserService,
    private tenantService: tenantService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      birthdate: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: [{ value: '', disabled: true }],
      password: ['', Validators.required],
    });

    this.businessForm = this.fb.group({
      businessName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]{1,50}$/)
        ]
      ],
      businessAddress: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 #\-.\n\r]{1,150}$/m),
          Validators.maxLength(150)
        ]
      ],
      businessPhone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{1,10}$/),
          Validators.maxLength(10)
        ]
      ],
      businessType: ['', Validators.required],
      businessLogo: [null],
      slogan: [
        '',
        [
          Validators.maxLength(80)
        ]
      ],
      horario: ['', [Validators.maxLength(100)]]
    });

    this.aboutForm = this.fb.group({
      history: ['', [Validators.required, Validators.maxLength(499)]],
      vision: ['', [Validators.required, Validators.maxLength(499)]],
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

    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      // validar token y obtener datos del usuario
      this.tenantUserService.validateWizardToken(token).subscribe({
        next: (user) => {
          debugger
          if (!user || !user.object) {
            this.router.navigate(['/error'], {
              queryParams: { message: 'Token inválido o expirado' },
            });
            return;
          }
          this.userId = user.object?.user.id;
          this.email = user.object?.user.email;
          this.tenantId = user.object?.tenant?.id;
          // llenar userForm con los datos obtenidos
          this.userForm.patchValue({
            name: user.object?.user.fullName,
            birthdate: user.object?.user.fechaNacimiento
              ? new Date(user.object.user.fechaNacimiento)
              : null,
            phone: user.object?.user.telefono,
            email: user.object?.user.email,
            password: user.object?.user.password,
          });
          // llenar businessForm con los datos obtenidos
          this.businessForm.patchValue({
            businessName: user.object?.tenant?.nombreNegocio || '',
            businessAddress: user.object?.tenant?.direccion || '',
            businessPhone: user.object?.tenant?.telefono || '',
            businessType: user.object?.tenant?.tipoNegocio || '',
            businessLogo: user.object?.tenant?.logoUrl || '',
            slogan: user.object?.tenant?.slogan || '',
            horario: user.object?.tenant?.schedules || '',
          });
          // Mostrar logo existente
          this.fileName = user.object?.tenant?.logoUrl || '';
          // llenar aboutForm con los datos obtenidos
          this.aboutForm.patchValue({
            history: user.object?.tenantConfig?.history || '',
            vision: user.object?.tenantConfig?.vision || '',
          });
          // llenar socialForm con los datos obtenidos
          this.socialForm.patchValue({
            facebook: user.object?.tenantConfig?.facebook || '',
            instagram: user.object?.tenantConfig?.instagram || '',
            tiktok: user.object?.tenantConfig?.tiktok || '',
            twitter: user.object?.tenantConfig?.twitter || '',
            linkedin: user.object?.tenantConfig?.linkedin || '',
          });
        },
        error: (err) => {
          console.error('Error al validar token:', err);
        },
      });
    }
  }

  createScheduleGroup(): FormGroup {
    return this.fb.group({
      day: ['', Validators.required],
      open: ['', Validators.required],
      close: ['', Validators.required],
    });
  }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = reader.result;
        this.businessForm.patchValue({ businessLogo: 'https://stock.adobe.com/es/search?k=%22cafeteria+logo%22' }); // Guarda la ruta base64
      };
      reader.readAsDataURL(file);
      this.fileName = file.name;
    }
  }

  onSubmit() {
    this.confirmMsg = '¡Datos guardados exitosamente!';
    this.snackBar.open(this.confirmMsg, 'Cerrar', { duration: 3000 });
  }

  // Guarda la info del usuario y avanza el stepper paso 1
  onUserStepNext(stepper: any) {
    if (this.userForm.valid) {
      const userData = {
        fullName: this.userForm.value.name,
        fechaNacimiento: this.userForm.value.birthdate,
        telefono: this.userForm.value.phone,
        email: this.email,
        password: this.userForm.value.password,
      };
      this.tenantUserService.updateAppUser(this.userId, userData).subscribe({
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

  // Guarda la info del negocio y avanza el stepper paso 2
  onBusinessStepNext(stepper: any) {

    if (this.businessForm.valid) {
      // llena tenantModel para los datos del negocio
      const businessData: tenantModel = {
        userId: this.userId,
        nombreNegocio: this.businessForm.value.businessName,
        direccion: this.businessForm.value.businessAddress,
        telefono: this.businessForm.value.businessPhone,
        tipoNegocio: this.businessForm.value.businessType,
        logoUrl: this.businessForm.value.businessLogo,
        slogan: this.businessForm.value.slogan,
        schedules: this.businessForm.value.horario
      };
      this.tenantService.createTenant(businessData).subscribe({
        next: (tenant) => {
          debugger
          this.tenantId = tenant.id;
          //this.snackBar.open('Datos del negocio guardados', 'Cerrar', { duration: 2000 });
          stepper.next();
        },
        error: () => {
          this.snackBar.open('Error al guardar los datos del negocio', 'Cerrar', { duration: 2000 });
        },
      });
    }else {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 2000,
      });
      this.businessForm.markAllAsTouched();
    }
  }

  // Guarda la info del About y avanza el stepper paso 3
  onAboutStepNext(stepper: any) {
    if (this.aboutForm.valid) {
      debugger
      // llena tenantModel para los datos del negocio
      const AboutData: tenantConfigModel = {
        tenantId: this.tenantId,
        bussinesEmail: this.email,
        history: this.aboutForm.value.history,
        vision: this.aboutForm.value.vision
      };
      this.tenantService.createTenantConfig(AboutData).subscribe({
        next: () => {
          //this.snackBar.open('Datos del negocio guardados', 'Cerrar', { duration: 2000 });
          stepper.next();
        },
        error: () => {
          this.snackBar.open('Error al guardar los datos del negocio', 'Cerrar', { duration: 2000 });
        },
      });
    }else {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 2000,
      });
      this.aboutForm.markAllAsTouched();
    }
  }

  onRedesSocialesStepNext(stepper: any) {
    debugger;
    if (this.socialForm.valid) {
      // llena tenantModel para los datos del negocio
      const socialData: tenantConfigModel = {
        tenantId: this.tenantId,
        facebook: this.socialForm.value.facebook,
        instagram: this.socialForm.value.instagram,
        tiktok: this.socialForm.value.tiktok,
        twitter: this.socialForm.value.twitter,
      };
      this.tenantService.createTenantConfig(socialData).subscribe({
        next: () => {
          //this.snackBar.open('Datos del negocio guardados', 'Cerrar', { duration: 2000 });
          stepper.next();
        },
        error: () => {
          this.snackBar.open('Error al guardar los datos del negocio', 'Cerrar', { duration: 2000 });
        },
      });
    }else {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 2000,
      });
      this.socialForm.markAllAsTouched();
    }
  }
  }
