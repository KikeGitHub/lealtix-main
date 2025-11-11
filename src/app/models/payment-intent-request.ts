import { Injectable } from '@angular/core';

export interface PaymentIntentRequest {
  email: string;
  plan?: string;
  status?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePaymentMethodId?: string;
  startDate?: string;
  endDate?: string;
}
