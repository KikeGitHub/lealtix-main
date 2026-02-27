import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

import {
  GenericResponse,
  ValidateCustomerRequest,
  ValidateCustomerResponse,
  RegisterCustomerRequest,
  Customer,
  CouponValidationRequest,
  CouponValidationResponse,
  RedeemCouponRequest,
  RedeemCouponResponse,
  CreateOrderRequest,
  OrderResponse,
  Product,
  OrderProduct,
  ChatMessage
} from '../models/lealbot.models';

@Injectable({
  providedIn: 'root'
})
export class LealbotService {
  private readonly BASE_URL = 'http://localhost:8080/api/chatbot';
  private readonly REQUEST_TIMEOUT = 30000; // 30 segundos

  constructor(private http: HttpClient) {}

  /**
   * 1️⃣ Validar Cliente por teléfono o email
   */
  validateCustomer(request: ValidateCustomerRequest): Observable<GenericResponse<ValidateCustomerResponse>> {
    return this.http
      .post<GenericResponse<ValidateCustomerResponse>>(`${this.BASE_URL}/validate-customer`, request)
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        catchError(this.handleError)
      );
  }

  /**
   * 2️⃣ Registrar Cliente Rápido
   */
  registerCustomer(request: RegisterCustomerRequest): Observable<GenericResponse<Customer>> {
    return this.http
      .post<GenericResponse<Customer>>(`${this.BASE_URL}/register-customer`, request)
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        catchError(this.handleError)
      );
  }

  /**
   * 3️⃣ Obtener "Lo de Siempre" (Última orden)
   */
  getLastOrder(customerId: number, tenantId: number): Observable<GenericResponse<OrderProduct[]>> {
    return this.http
      .get<GenericResponse<OrderProduct[]>>(
        `${this.BASE_URL}/customer/${customerId}/last-order?tenantId=${tenantId}`
      )
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        catchError(this.handleError)
      );
  }

  /**
   * 4️⃣ Obtener Sugerencias de Venta Cruzada
   */
  getCrosellSuggestions(productId: number, tenantId: number): Observable<GenericResponse<Product[]>> {
    return this.http
      .get<GenericResponse<Product[]>>(
        `${this.BASE_URL}/product/${productId}/cross-sell?tenantId=${tenantId}`
      )
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        catchError(this.handleError)
      );
  }

  /**
   * 5️⃣ Validar Cupón (Nueva API)
   */
  validateCoupon(request: CouponValidationRequest): Observable<CouponValidationResponse> {
    return this.http
      .post<any>(`${this.BASE_URL}/validate-coupon`, request)
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        map((response: any) => {
          // Mapear la respuesta del BE (GenericResponse) a CouponValidationResponse
          const couponData = response.object || {};

          return {
            code: response.code,
            message: response.message,
            data: {
              isValid: couponData.valid === true, // Mapear 'valid' a 'isValid'
              couponCode: couponData.couponCode || '',
              status: couponData.status,
              campaignTitle: couponData.campaignTitle,
              rewardType: couponData.rewardType,
              rewardValue: couponData.numericValue, // Mapear 'numericValue' a 'rewardValue'
              description: couponData.rewardDescription || couponData.benefit, // Usar rewardDescription o benefit
              expiresAt: couponData.expiresAt,
              isExpired: couponData.expired === true, // Mapear 'expired' a 'isExpired'
              message: couponData.message || '',
              customerName: couponData.customerName,
              customerEmail: couponData.customerEmail
            }
          } as CouponValidationResponse;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * 5️⃣-B Redimir Cupón (Nueva API)
   */
  redeemCoupon(request: RedeemCouponRequest): Observable<RedeemCouponResponse> {
    return this.http
      .post<any>(`${this.BASE_URL}/redeem-coupon`, request)
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        map((response: any) => {
          // El BE retorna en 'object', copiar todos los datos directamente
          const redemption = response.object || null;

          return {
            code: response.code ?? 0,
            message: response.message ?? '',
            data: redemption ? { ...redemption, success: true } : null
          } as RedeemCouponResponse;
        }),
        catchError((error) => {
          // Errores de validación/negocio (como cupón ya redimido) deben ser respuestas, no errores
          if (error.status === 400 || error.status === 422) {
            const response: RedeemCouponResponse = {
              code: error.status,
              message: error.error?.message || 'Error en la solicitud',
              data: null
            };
            return of(response); // Retornar como respuesta válida (next handler)
          }
          // Para errores de red/servidor reales, lanzar como error
          return this.handleError(error);
        })
      );
  }

  /**
   * 6️⃣ Crear Orden desde ChatBot
   */
  createOrder(request: CreateOrderRequest): Observable<GenericResponse<OrderResponse>> {
    return this.http
      .post<GenericResponse<OrderResponse>>(`${this.BASE_URL}/create-order`, request)
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        catchError(this.handleError)
      );
  }

  /**
   * 7️⃣ Obtener Historial de Mensajes
   */
  getSessionMessages(sessionId: string): Observable<GenericResponse<ChatMessage[]>> {
    return this.http
      .get<GenericResponse<ChatMessage[]>>(`${this.BASE_URL}/session/${sessionId}/messages`)
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        catchError(this.handleError)
      );
  }

  /**
   * 8️⃣ Abandonar Sesión
   */
  abandonSession(sessionId: string): Observable<GenericResponse<null>> {
    return this.http
      .post<GenericResponse<null>>(`${this.BASE_URL}/session/${sessionId}/abandon`, {})
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        catchError(this.handleError)
      );
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente (ej: network error)
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      if (error.status === 0) {
        errorMessage = 'No se puede conectar al servidor. Verifica tu conexión.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Solicitud inválida';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status === 500) {
        errorMessage = error.error?.message || 'Error interno del servidor';
      } else if (error.name === 'TimeoutError') {
        errorMessage = 'La solicitud tardó demasiado. Intenta de nuevo.';
      } else {
        errorMessage = `Error HTTP ${error.status}: ${error.error?.message || 'Desconocido'}`;
      }
    }

    console.error('LealbotService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Generar sessionId único (UUID v4)
   */
  generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Validación de email en cliente
   */
  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validación de teléfono en cliente
   */
  isValidPhone(phone: string): boolean {
    const regex = /^(\+?[1-9]\d{1,14}|[0-9]{9,11})$/;
    return regex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Detectar si es email o teléfono
   */
  detectContactType(contact: string): 'email' | 'phone' | null {
    const cleaned = contact.trim();
    if (this.isValidEmail(cleaned)) return 'email';
    if (this.isValidPhone(cleaned)) return 'phone';
    return null;
  }
}
