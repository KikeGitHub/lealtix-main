import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { RegistroComponent } from './registro/registro.component';
import { ErrorComponent } from './error/error.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'error', component: ErrorComponent }
];
