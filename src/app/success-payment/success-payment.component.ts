import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-success-payment',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './success-payment.component.html',
  styleUrls: ['./success-payment.component.css']
})
export class SuccessPaymentComponent implements OnInit {
  userName: string = '';
  planName: string = '';
  cost: string = '';
  purchaseDate: string = '';
  nextRenewal: string = '';
  loading: boolean = true;
  error: string = '';

  constructor(private route: ActivatedRoute,
              private paymentService: PaymentService) {}

  ngOnInit() {
    debugger
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      if (sessionId) {
        this.paymentService.getPaymentSuccess(sessionId).subscribe({
          next: (data) => {
            debugger
            this.userName = data.name;
            this.planName = data.plan;
            this.cost = data.cost + ' ' + data.currency;
            this.purchaseDate = data.paymentDate;
            this.nextRenewal = data.nextPaymentDate;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'No se pudo obtener la información del pago.';
            this.loading = false;
          }
        });
      } else {
        this.error = 'No se encontró el identificador de sesión.';
        this.loading = false;
      }
    });
  }

  goToDashboard() {
    // Redirige al dashboard
  }

  goToConfig() {
    // Redirige a configuración de cuenta
  }
}
