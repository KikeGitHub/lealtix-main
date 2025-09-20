import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaymentIntentRequest } from '../models/payment-intent-request';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = `${environment.apiUrl}/tenant-payment/intent`;
  private apiCheckout = `${environment.apiUrl}/stripe/create-checkout-session`;
  private apiSuccess = `${environment.apiUrl}/stripe/checkout-session/{sessionId}`;
  private apiCancel = `${environment.apiUrl}/stripe/checkout-cancel/{sessionId}`;

  constructor(private http: HttpClient) {}

  createPaymentIntent(data: PaymentIntentRequest, status: string): Observable<any> {
    debugger;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': '*/*'
    });
    const params = new HttpParams().set('status', status);
    return this.http.post<any>(this.apiUrl, data, { headers, params });
  }

  createCheckoutSession(priceId: string, tenantId?: string) {
    return this.http.post<{ id: string }>(this.apiCheckout, { priceId, tenantId });
  }


  getPaymentSuccess(sessionId: string): Observable<any> {
    return this.http.get<any>(this.apiSuccess.replace('{sessionId}', sessionId));
  }

  getPaymentCancel(sessionId: string): Observable<any> {
    return this.http.get<any>(this.apiCancel.replace('{sessionId}', sessionId));
  }
}
