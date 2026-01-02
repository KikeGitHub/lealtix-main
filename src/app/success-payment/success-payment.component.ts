import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../services/payment.service';
import { environment } from '../../environments/environment';

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
              private paymentService: PaymentService,
              private router: Router) {}

  ngOnInit() {
    debugger
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      if (sessionId) {
        this.paymentService.getPaymentSuccess(sessionId).subscribe({
          next: (data) => {
            debugger
            this.userName = data.object.name;
            this.planName = data.object.plan;
            this.cost = data.object.cost + ' ' + data.object.currency;
            this.purchaseDate = data.object.paymentDate;
            this.nextRenewal = data.object.nextPaymentDate;
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
    // Redirect using configured dashboardUrl so it varies per environment
    const base = (environment && environment.dashboardUrl) ? String(environment.dashboardUrl) : window.location.origin;
    const url = base.replace(/\/+$/, '') + '/auth/login';
    window.location.href = url;
  }
}
