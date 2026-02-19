import { NgModule, Injector, DoBootstrap } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { OfferWidgetComponent } from './offer-widget.component';
import { defineOfferWidget } from './element';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, HttpClientModule, OfferWidgetComponent]
})
export class OfferWidgetModule implements DoBootstrap {
  constructor(private injector: Injector) {
    defineOfferWidget(this.injector);
  }

  ngDoBootstrap() {
    // Intentionally empty: this module is designed to be used as an elements bundle
  }
}
