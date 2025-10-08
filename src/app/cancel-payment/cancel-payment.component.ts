import { PaymentService } from './../services/payment.service';
import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cancel-payment',
  standalone: true,
  templateUrl: './cancel-payment.component.html',
  styleUrls: ['./cancel-payment.component.css']
  ,imports: [NgIf]
})
export class CancelPaymentComponent implements OnInit {
  loading = true;
  error: string = '';
  cancelInfo: any = null;
  userName: string = '';
  errorReason: string = '';

  constructor(private route: ActivatedRoute,
              private http: HttpClient,
              private paymentService: PaymentService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      if (sessionId) {
        this.paymentService.getPaymentCancel(sessionId).subscribe({
          next: (data) => {
            debugger
            this.userName = data.object.name;
            this.errorReason = data.object.description;
            this.loading = false;
          },
          error: (err) => {
            this.error = err?.error?.message || 'Error al cancelar el pago.';
            this.loading = false;
          }
        });
      } else {
        this.error = 'No se encontró el identificador de sesión.';
        this.loading = false;
      }
    });
  }

  retryPayment() {}
}
