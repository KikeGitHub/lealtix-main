import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
    // Redirige a landing-page/demo
    this.router.navigate(['/landing-page/demo']);
  }

  goToConfig() {
    // Redirige a configuración de cuenta
  }
}
