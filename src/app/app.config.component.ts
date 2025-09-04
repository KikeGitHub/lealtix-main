import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { provideRouter } from '@angular/router';


import { routes } from './app.routes.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes),
  importProvidersFrom(HttpClientModule)
  ]
};
