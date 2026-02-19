import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { OfferWidgetModule } from './app/offer-widget/offer-widget.module';

platformBrowserDynamic()
  .bootstrapModule(OfferWidgetModule)
  .catch(err => console.error(err));
