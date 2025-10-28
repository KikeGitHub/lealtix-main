import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { RegistroComponent } from './registro/registro.component';
import { ErrorComponent } from './error/error.component';
import { SuccessPaymentComponent } from './success-payment/success-payment.component';
import { CancelPaymentComponent } from './cancel-payment/cancel-payment.component';
import { LandingPageTenantComponent } from './landing-page-tenant/landing-page.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'error', component: ErrorComponent },
  { path: 'checkout/success', component: SuccessPaymentComponent },
  { path: 'checkout/cancel', component: CancelPaymentComponent },
  { path: 'landing-page/demo', component: LandingPageTenantComponent },
  { path: 'landing-page', component: LandingPageTenantComponent }
];
