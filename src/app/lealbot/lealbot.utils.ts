/**
 * Utilidades y Helpers para Lealbot
 */

import { LEALBOT_CONFIG } from './lealbot.config';

export class LealbotUtils {
  /**
   * ============ VALIDACIÓN ============
   */

  /**
   * Valida si un email es válido
   */
  static isValidEmail(email: string): boolean {
    return LEALBOT_CONFIG.PATTERNS.EMAIL.test(email);
  }

  /**
   * Valida si un teléfono es válido
   */
  static isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/\s/g, '');
    return LEALBOT_CONFIG.PATTERNS.PHONE.test(cleaned);
  }

  /**
   * Valida un nombre
   */
  static isValidName(name: string): boolean {
    return (
      name.length >= LEALBOT_CONFIG.VALIDATION.MIN_NAME_LENGTH &&
      name.length <= LEALBOT_CONFIG.VALIDATION.MAX_NAME_LENGTH &&
      LEALBOT_CONFIG.PATTERNS.NAME.test(name)
    );
  }

  /**
   * Valida un código de cupón
   */
  static isValidCouponCode(code: string): boolean {
    return (
      code.length >= LEALBOT_CONFIG.VALIDATION.MIN_COUPON_CODE_LENGTH &&
      code.length <= LEALBOT_CONFIG.VALIDATION.MAX_COUPON_CODE_LENGTH &&
      LEALBOT_CONFIG.PATTERNS.COUPON_CODE.test(code)
    );
  }

  /**
   * Valida cantidad
   */
  static isValidQuantity(qty: number): boolean {
    return (
      qty >= LEALBOT_CONFIG.VALIDATION.MIN_QUANTITY &&
      qty <= LEALBOT_CONFIG.VALIDATION.MAX_QUANTITY &&
      Number.isInteger(qty)
    );
  }

  /**
   * Detecta el tipo de contacto (email o teléfono)
   */
  static detectContactType(contact: string): 'email' | 'phone' | null {
    const cleaned = contact.trim();
    if (this.isValidEmail(cleaned)) return 'email';
    if (this.isValidPhone(cleaned)) return 'phone';
    return null;
  }

  /**
   * Limpia y normaliza un teléfono
   */
  static normalizePhone(phone: string): string {
    return phone.replace(/\s/g, '').replace(/[+]/g, '');
  }

  /**
   * ============ FORMATEO ============
   */

  /**
   * Formatea moneda en EUR
   */
  static formatCurrency(amount: number, includeCurrency = true): string {
    if (includeCurrency) {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } else {
      return amount.toFixed(2);
    }
  }

  /**
   * Formatea un número con separadores de miles
   */
  static formatNumber(num: number, decimals = 2): string {
    return Number(num.toFixed(decimals)).toLocaleString('es-ES');
  }

  /**
   * Formatea una fecha/hora
   */
  static formatDate(date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    switch (format) {
      case 'short':
        return d.toLocaleDateString('es-ES');
      case 'long':
        return d.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'time':
        return d.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        });
      default:
        return d.toString();
    }
  }

  /**
   * Capitaliza la primera letra de una cadena
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Capitaliza cada palabra
   */
  static titleCase(str: string): string {
    return str
      .split(' ')
      .map(word => this.capitalize(word))
      .join(' ');
  }

  /**
   * Trunca una cadena con ellipsis
   */
  static truncate(str: string, length = 50): string {
    return str.length > length ? str.substring(0, length) + '...' : str;
  }

  /**
   * ============ GENERADORES ============
   */

  /**
   * Genera un UUID v4
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Genera un ID de sesión único
   */
  static generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Genera un color hexadecimal aleatorio
   */
  static generateRandomColor(): string {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  /**
   * ============ CÁLCULOS ============
   */

  /**
   * Calcula el descuento porcentual
   */
  static calculatePercentageDiscount(original: number, discount: number): number {
    return (discount / original) * 100;
  }

  /**
   * Calcula la cantidad de descuento en moneda
   */
  static calculateDiscountAmount(subtotal: number, discountPercent: number): number {
    return (subtotal * discountPercent) / 100;
  }

  /**
   * Calcula el total final
   */
  static calculateTotal(subtotal: number, discount: number): number {
    return Math.max(0, subtotal - discount);
  }

  /**
   * Calcula el valor promedio de un array de números
   */
  static average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * ============ STORAGE ============
   */

  /**
   * Guarda datos en localStorage
   */
  static saveToStorage(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error guardando en storage: ${key}`, error);
      return false;
    }
  }

  /**
   * Obtiene datos de localStorage
   */
  static getFromStorage(key: string): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error leyendo del storage: ${key}`, error);
      return null;
    }
  }

  /**
   * Elimina datos de localStorage
   */
  static removeFromStorage(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error eliminando del storage: ${key}`, error);
      return false;
    }
  }

  /**
   * Limpia todo el storage
   */
  static clearStorage(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error limpiando storage', error);
      return false;
    }
  }

  /**
   * ============ UTILIDADES ============
   */

  /**
   * Detecta si el dispositivo es móvil
   */
  static isMobile(): boolean {
    const regex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    return regex.test(navigator.userAgent.toLowerCase());
  }

  /**
   * Detecta si está en modo oscuro
   */
  static isDarkMode(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Detecta si reduce-motion está habilitado
   */
  static prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Delay async (promise-based)
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Copia texto al portapapeles
   */
  static copyToClipboard(text: string): Promise<boolean> {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Obtiene un parámetro de URL
   */
  static getUrlParam(paramName: string): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get(paramName);
  }

  /**
   * Detecta el navegador
   */
  static detectBrowser(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' {
    const ua = navigator.userAgent;
    if (ua.indexOf('Firefox') > -1) return 'firefox';
    if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'safari';
    if (ua.indexOf('Chrome') > -1) return 'chrome';
    if (ua.indexOf('Edge') > -1) return 'edge';
    return 'unknown';
  }

  /**
   * Obtiene la versión del SO
   */
  static getOSVersion(): string {
    return navigator.appVersion;
  }

  /**
   * Registra un evento en consola con timestamp
   */
  static log(message: string, data?: any): void {
    const timestamp = new Date().toLocaleTimeString('es-ES');
    const prefix = `[${timestamp}] 🤖 Lealbot:`;
    if (data) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }

  /**
   * Debounce function
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: Parameters<T>) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Throttle function
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function (this: any, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}
