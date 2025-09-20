import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { PaymentService } from '../services/payment.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.css']
})
export class PagoComponent implements OnInit {

  stripe: Stripe | null = null;
  loading: boolean = false;
  message: string = '';
  securityMessage: string = 'Tus datos están protegidos, el pago se procesa con Stripe.';

  plan = {
    name: 'Plan Lealtix Básico',
    priceId: 'price_1S89U9F30XYgfrgVUT38xvm4', // price ID de Stripe
    amount: 299,             // cantidad visible
    interval: 'mes'          // intervalos mensuales
  };
  @Input() tenantId?: string;
  @Output() close = new EventEmitter<void>();
  @Output() paymentResult = new EventEmitter<any>();

  constructor(
    private paymentService: PaymentService,
    public dialogRef: MatDialogRef<PagoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    this.stripe = await loadStripe('pk_test_51S88J5F30XYgfrgVDNixlIFUVK9HphUlvSTFcG6IuoAheSQL2NBY95v9Zqy8xUY4WdREAJwOUW3FP3QmgsYwCq9400y8Ov9b6x'); // tu clave pública
  }

  async pagar() {
    debugger;
    if (!this.stripe || !this.plan?.priceId) {
      this.message = 'Plan no seleccionado o Stripe no cargado.';
      return;
    }

    this.loading = true;
    this.message = '';

    try {
      // Crear sesión de checkout desde backend
      this.tenantId = this.data.tenantId;
      const session = await this.paymentService.createCheckoutSession(this.plan.priceId, this.tenantId).toPromise();

      // Verificar que la sesión se haya creado correctamente
      if (!session || !session.id) {
        this.message = 'No se pudo crear la sesión de pago.';
        this.paymentResult.emit({ success: false, error: 'Sesión de pago no válida.' });
        this.loading = false;
        return;
      }

      // Redirigir a Stripe Checkout
      const { error } = await this.stripe.redirectToCheckout({ sessionId: session.id });

      if (error) {
        console.error(error);
        this.message = error.message || 'Ocurrió un error al procesar el pago.';
        this.paymentResult.emit({ success: false, error });
      }

    } catch (err: any) {
      console.error(err);
      this.message = 'No se pudo iniciar el pago. Intenta de nuevo.';
      this.paymentResult.emit({ success: false, error: err });
    } finally {
      this.loading = false;
    }
  }

  cerrar() {
    this.dialogRef.close();
  }
}
