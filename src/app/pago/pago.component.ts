import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.css']
})
export class PagoComponent {
  @Input() plan: any;
  @Input() costo?: number;
  @Output() close = new EventEmitter<void>();
  @Output() paymentResult = new EventEmitter<any>();

  cardNumber: string = '';
  message: string = '';
  loading: boolean = false;
  securityMessage: string = 'Tus datos están protegidos, el pago se procesa con Stripe.';

  pagar() {
    this.loading = true;
    setTimeout(() => {
      if (this.cardNumber.includes('0000')) {
        this.message = 'Pago rechazado. Por favor, revisa los datos de tu tarjeta.';
        this.paymentResult.emit({
          status: 'rejected',
          stripe_customer_id: null,
          stripe_payment_method_id: null,
          stripe_subscription_id: null
        });
      } else if (this.cardNumber.includes('1111')) {
        this.message = 'Pago exitoso. ¡Gracias por tu compra!';
        this.paymentResult.emit({
          status: 'success',
          stripe_customer_id: 'cus_test_123',
          stripe_payment_method_id: 'pm_test_123',
          stripe_subscription_id: 'sub_test_123'
        });
      } else {
        this.message = 'Tarjeta no válida para la simulación.';
      }
      this.loading = false;
    }, 1200);
  }

  cerrar() {
    this.close.emit();
  }
}
