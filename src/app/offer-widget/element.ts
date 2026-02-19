import { Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { OfferWidgetComponent } from './offer-widget.component';

export function defineOfferWidget(injector: Injector) {
  const el = createCustomElement(OfferWidgetComponent, { injector });
  if (!customElements.get('offer-widget')) {
    customElements.define('offer-widget', el);
  }
}
