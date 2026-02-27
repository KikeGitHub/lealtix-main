/**
 * Mensajes del Lealbot - Diálogos predefinidos
 * Centralizados para mantener la lógica limpia y facilitando actualizaciones
 */

export const LEALBOT_MESSAGES = {
  // ============ SALUDO INICIAL ============
  GREETING_INITIAL: {
    text: '¡Hola! Soy Lealbot ☕. Soy tu mesero virtual y estoy aquí para transformar tu compra en una experiencia increíble.',
    quick_reply: [
      { label: '📱 Empezar', value: 'start' },
      { label: '❌ Quizás después', value: 'close' }
    ]
  },

  ASKING_CONTACT: {
    text: '¿Me das tu teléfono o email para reconocerte? Así ganas puntos y disfrutas beneficios exclusivos.',
    input_type: 'CONTACT', // 'PHONE' | 'EMAIL' | 'CONTACT'
    placeholder: '+34 600 123 456 o correo@email.com',
    quick_reply: [
      { label: '📱 Teléfono', value: 'phone' },
      { label: '✉️ Email', value: 'email' }
    ]
  },

  // ============ VALIDACIÓN DE CLIENTE ============
  LOADING_CUSTOMER: {
    text: '⏳ Buscándote en nuestro sistema...',
    loading: true
  },

  // ============ CLIENTE EXISTENTE ============
  GREETING_RETURNING: {
    text: (name: string) => `¡Hola ${name}! 👋 Te reconocí. ¡Qué alegría verte de nuevo!`,
    quick_reply: null
  },

  ASKING_REPEAT_ORDER: {
    text: (name: string, productName: string) =>
      `Veo que hace poco pediste ${productName}. ¿Queremos "lo de siempre"?`,
    quick_reply: [
      { label: '✅ Sí, lo de siempre', value: 'repeat_last' },
      { label: '🔍 Ver menú completo', value: 'browse_menu' }
    ]
  },

  LOADING_LAST_PRODUCTS: {
    text: '⏳ Trayendo tus últimos pedidos...',
    loading: true
  },

  // ============ CLIENTE NUEVO ============
  GREETING_NEW: {
    text: '¡Bienvenido! 🎉 Soy tu primer paso en la familia Lealbox.',
    quick_reply: null
  },

  ASKING_NAME: {
    text: '¿Cómo te llamas? Te registraré para que empieces a sumar puntos hoy mismo.',
    input_type: 'TEXT',
    placeholder: 'Tu nombre completo',
    quick_reply: null
  },

  ASKING_EMAIL: {
    text: '¿Cuál es tu email? Te enviaremos confirmación y promociones exclusivas.',
    input_type: 'EMAIL',
    placeholder: 'correo@ejemplo.com',
    quick_reply: [
      { label: '⏭️ Saltarme esto', value: 'skip_email' }
    ]
  },

  ASKING_PHONE: {
    text: '¿Y tu teléfono? Podríamos contactarte por WhatsApp para confirmaciones.',
    input_type: 'PHONE',
    placeholder: '5512345678',
    quick_reply: [
      { label: '⏭️ Saltarme esto', value: 'skip_phone' }
    ]
  },

  ASKING_BIRTHDATE: {
    text: '¿Cuál es tu fecha de nacimiento? Te enviaremos sorpresas especiales! 🎂',
    input_type: 'TEXT',
    placeholder: 'DD/MM/AAAA',
    quick_reply: [
      { label: '⏭️ Saltarme esto', value: 'skip_birthdate' }
    ]
  },

  ASKING_GENDER: {
    text: '¿Con qué género te identificas? (Solo para estadísticas)',
    input_type: null,
    placeholder: null,
    quick_reply: [
      { label: '👨 Hombre', value: 'Hombre' },
      { label: '👩 Mujer', value: 'Mujer' },
      { label: '🌈 Otro', value: 'Otro' },
      { label: '⏭️ Prefiero no decir', value: 'skip_gender' }
    ]
  },

  REGISTERED_SUCCESS: {
    text: (name: string) =>
      `¡Registrado! 🎊 Bienvenido ${name}, ahora eres parte de nosotros.`,
    quick_reply: null
  },

  // ============ SELECCIÓN DE PRODUCTOS ============
  BROWSING_MENU: {
    text: '¿Qué te apetece hoy? Elige una categoría:',
    quick_reply: null // Se genera dinámicamente basado en categorías
  },

  PRODUCT_SELECTED_CONFIRM: {
    text: (productName: string, price: number) =>
      `${productName} agregado al carrito ($${price.toFixed(2)}). ¿Notas especiales?`,
    input_type: 'TEXTAREA',
    placeholder: 'Ej: Sin cebolla, extra queso, poco picante...',
    quick_reply: [
      { label: '✅ Sin notas', value: 'no_comments' },
      { label: '➕ Agregar otra cosa', value: 'add_more' }
    ]
  },

  // ============ VENTA CRUZADA ============
  CROSS_SELL_SUGGESTION: {
    text: (productName: string) =>
      `¡Buen choice! ${productName} combina muy bien con...`,
    quick_reply: null // Se genera dinámicamente
  },

  CROSS_SELL_ACCENT: {
    text: (mainProduct: string, suggestedProduct: string, price: number) =>
      `¿Te gustaría acompañarlo con ${suggestedProduct}? ($${price.toFixed(2)})`,
    quick_reply: [
      { label: '✅ Dale', value: 'accept_suggestion' },
      { label: '❌ No, gracias', value: 'skip_suggestion' }
    ]
  },

  // ============ CUPONES Y FIDELIZACIÓN ============
  ASKING_COUPON: {
    text: '¿Tienes algún cupón o código promocional?',
    input_type: 'TEXT',
    placeholder: 'Ej: WELCOME20',
    quick_reply: [
      { label: '⏭️ No tengo', value: 'no_coupon' },
      { label: '✅ Aplicar desde mis cupones', value: 'view_coupons' }
    ]
  },

  HAS_ACTIVE_COUPONS: {
    text: (count: number) =>
      `¡Genial! Tienes ${count} cupón${count > 1 ? 'es' : ''} activo${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}. ¿Quieres usar alguno? 🎁`,
    quick_reply: [
      { label: '✅ Ver mis cupones', value: 'view_coupons' },
      { label: '⏭️ No, gracias', value: 'no_coupon' }
    ]
  },

  NO_ACTIVE_COUPONS: {
    text: 'No tienes cupones activos en este momento. ¡Sigue comprando para ganar más! 💪',
    quick_reply: null
  },

  VALIDATING_COUPON: {
    text: '⏳ Validando cupón...',
    loading: true
  },

  COUPON_VALID: {
    text: (discount: number, type: string) =>
      type === 'PERCENT_DISCOUNT'
        ? `¡Excelente! Tu cupón te da un ${discount}% de descuento. 🎁`
        : `¡Excelente! Tu cupón te da $${discount} de descuento. 🎁`,
    quick_reply: null
  },

  COUPON_APPLIED: {
    text: (campaignTitle: string, description: string) =>
      `✅ Cupón aplicado: ${campaignTitle}\n${description}`,
    quick_reply: null
  },

  COUPON_DISCOUNT_PERCENT: {
    text: (discount: number, amount: number, originalAmount: number, finalAmount: number) =>
      `🎁 Descuento del ${discount}%:\n💰 Subtotal original: $${originalAmount.toFixed(2)}\n🔻 Ahorras: -$${amount.toFixed(2)}\n💳 Total a pagar: $${finalAmount.toFixed(2)}`,
    quick_reply: null
  },

  COUPON_DISCOUNT_FIXED: {
    text: (amount: number, originalAmount: number, finalAmount: number) =>
      `🎁 Descuento de $${amount.toFixed(2)}:\n💰 Subtotal original: $${originalAmount.toFixed(2)}\n🔻 Ahorras: -$${amount.toFixed(2)}\n💳 Total a pagar: $${finalAmount.toFixed(2)}`,
    quick_reply: null
  },

  COUPON_TWO_FOR_ONE: {
    text: (productName: string, savings: number, originalAmount: number, finalAmount: number) =>
      `🎉 ¡2x1 en ${productName}!\n💰 Subtotal original: $${originalAmount.toFixed(2)}\n🔻 Ahorras: -$${savings.toFixed(2)}\n💳 Total a pagar: $${finalAmount.toFixed(2)}`,
    quick_reply: null
  },

  COUPON_FREE_PRODUCT: {
    text: (productName: string, savings: number, originalAmount: number, finalAmount: number) =>
      `🎁 ¡${productName} gratis!\n💰 Subtotal original: $${originalAmount.toFixed(2)}\n🔻 Ahorras: -$${savings.toFixed(2)}\n💳 Total a pagar: $${finalAmount.toFixed(2)}`,
    quick_reply: null
  },

  COUPON_INVALID: {
    text: (reason: string) =>
      `Oops, ese cupón no es válido: ${reason}`,
    quick_reply: [
      { label: '↩️ Intentar otro', value: 'try_another_coupon' },
      { label: '⏭️ Continuar sin cupón', value: 'skip_coupon' }
    ]
  },

  COUPON_ERROR: {
    text: (message: string) =>
      `❌ Error al aplicar cupón: ${message}`,
    quick_reply: [
      { label: '↩️ Intentar otro', value: 'try_another_coupon' },
      { label: '⏭️ Continuar sin cupón', value: 'skip_coupon' }
    ]
  },

  // ============ RESUMEN Y FINALIZACIÓN ============
  ORDER_SUMMARY: {
    text: (subtotal: number, discount: number, total: number) =>
      `📋 Resumen de tu orden:\n\n💰 Subtotal: $${subtotal.toFixed(2)}\n🎁 Descuento: -$${discount.toFixed(2)}\n💳 Total: $${total.toFixed(2)}`,
    quick_reply: [
      { label: '✅ Confirmar pedido', value: 'confirm_order' },
      { label: '✏️ Modificar', value: 'modify_order' },
      { label: '❌ Cancelar', value: 'cancel_order' }
    ]
  },

  LOADING_ORDER: {
    text: '⏳ Procesando tu pedido...',
    loading: true
  },

  ORDER_CONFIRMED: {
    text: (orderId: string, totalTime?: string) =>
      `¡Pedido confirmado! 🎉\n\nTu orden #${orderId} está en la cocina.${totalTime ? ` Estará listo en aproximadamente ${totalTime}.` : ''}`,
    quick_reply: [
      { label: '👋 Adiós', value: 'close' },
      { label: '🛒 Pedir algo más', value: 'start' }
    ]
  },

  ORDER_ERROR: {
    text: 'Oops, algo salió mal al procesar tu pedido. Intenta de nuevo o contacta con nosotros.',
    quick_reply: [
      { label: '🔄 Reintentar', value: 'retry_order' },
      { label: '📞 Contactar soporte', value: 'contact_support' }
    ]
  },

  // ============ DESPEDIDAS ============
  CLOSING_MESSAGE: {
    text: '¡Gracias por usar Lealbot! Esperamos tu próximo pedido. 👋',
    quick_reply: null
  },

  ABANDONED_SESSION: {
    text: 'Sabemos que a veces no es el momento. Tu carrito está guardado, ¡vuelve cuando quieras! 💚',
    quick_reply: null
  },

  // ============ ERRORES ============
  ERROR_GENERIC: {
    text: 'Disculpa, algo no funcionó como esperábamos. Por favor, intenta de nuevo.',
    quick_reply: [
      { label: '🔄 Reintentar', value: 'retry' },
      { label: '❌ Cerrar', value: 'close' }
    ]
  },

  ERROR_INVALID_CONTACT: {
    text: 'Parece que ese formato no es válido. Por favor, usa un teléfono (+34 600 123 456) o email (correo@ejemplo.com).',
    quick_reply: null
  },

  ERROR_INVALID_EMAIL: {
    text: 'Ese email no parece correcto. Por favor, intenta de nuevo.',
    quick_reply: null
  },

  ERROR_EMPTY_CART: {
    text: 'Tu carrito está vacío. ¿Hay algo que te gustaría pedir?',
    quick_reply: [
      { label: '🔍 Ver menú', value: 'browse_menu' },
      { label: '❌ Cancelar', value: 'close' }
    ]
  },

  // ============ HELPERS Y CONFIRMACIONES ============
  ADDED_TO_CART: {
    text: (productName: string, quantity: number) =>
      `✅ Agregué ${quantity}x ${productName} a tu carrito.`,
    quick_reply: null
  },

  EMPTY_STATE: {
    text: 'Estoy aquí para ayudarte. ¿Deseas hacer un pedido?',
    quick_reply: [
      { label: '✅ Obvio', value: 'start' },
      { label: '❌ No gracias', value: 'close' }
    ]
  },

  // ============ ESTADO DE CARGA Y TRANSICIONES ============
  TYPING_INDICATOR: {
    text: 'Lealbot está escribiendo...',
    loading: true
  }
};

/**
 * Validadores y helpers para mensajes
 */
export const MESSAGE_HELPERS = {
  /**
   * Valida si una cadena parece un email válido
   */
  isValidEmail: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Valida si una cadena parece un teléfono válido
   */
  isValidPhone: (phone: string): boolean => {
    // Soporta formatos: +34 600 123 456, +34600123456, 600123456, etc.
    const regex = /^(\+?[1-9]\d{1,14}|[0-9]{9,11})$/;
    return regex.test(phone.replace(/\s/g, ''));
  },

  /**
   * Detecta si es email o teléfono
   */
  detectContactType: (contact: string): 'email' | 'phone' | null => {
    const cleaned = contact.trim();
    if (MESSAGE_HELPERS.isValidEmail(cleaned)) return 'email';
    if (MESSAGE_HELPERS.isValidPhone(cleaned)) return 'phone';
    return null;
  },

  /**
   * Formatea moneda en euros
   */
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  },

  /**
   * Obtiene un mensaje aleatorio de bienvenida
   */
  getRandomGreeting: (): string => {
    const greetings = [
      '¡Hola! ☕',
      '¡Bienvenido! 👋',
      '¿Qué tal? 😊',
      '¡Aquí estoy! 🤖',
      '¡Hola amigo! 👍'
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
};
