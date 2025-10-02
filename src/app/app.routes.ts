import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { Campaigns } from './campaigns/campaigns';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent
  },
  {
    path: 'campaigns',
    component: Campaigns
  }
];
