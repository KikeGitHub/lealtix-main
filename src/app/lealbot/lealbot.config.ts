/**
 * Configuración y Constantes para Lealbot
 */

export const LEALBOT_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: 'http://localhost:8080/api/chatbot',
    TIMEOUT: 10000, // milliseconds
    RETRY_ATTEMPTS: 3
  },

  // UI Configuration
  UI: {
    CHAT_WIDTH: '384px',
    CHAT_HEIGHT: '600px',
    BUTTON_SIZE: '56px',
    ANIMATION_DURATION: '300ms',
    SCROLL_BEHAVIOR: 'smooth'
  },

  // Feature Toggles
  FEATURES: {
    ENABLE_CROSS_SELL: true,
    ENABLE_COUPONS: true,
    ENABLE_LAST_ORDER: true,
    ENABLE_AUTO_REGISTRATION: true,
    ENABLE_TYPING_INDICATOR: true,
    ENABLE_CHAT_HISTORY: true
  },

  // Validation Rules
  VALIDATION: {
    MIN_PHONE_LENGTH: 9,
    MAX_PHONE_LENGTH: 15,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
    MIN_COMMENT_LENGTH: 1,
    MAX_COMMENT_LENGTH: 500,
    MIN_COUPON_CODE_LENGTH: 2,
    MAX_COUPON_CODE_LENGTH: 50,
    MIN_QUANTITY: 1,
    MAX_QUANTITY: 99
  },

  // Message Delays (para UX natural)
  DELAYS: {
    BOT_REPLY: 500, // ms antes de que el bot responda
    TYPING_INDICATOR: 300, // ms que dura el indicador
    TRANSITION: 300 // ms para transiciones
  },

  // Storage
  STORAGE: {
    SESSION_KEY: 'lealbot_session_id',
    CART_KEY: 'lealbot_cart',
    CUSTOMER_KEY: 'lealbot_customer',
    HISTORY_KEY: 'lealbot_history'
  },

  // Colors (Tailwind palette)
  COLORS: {
    PRIMARY: '#6366f1',     // Indigo-500
    PRIMARY_LIGHT: '#e0e7ff', // Indigo-100
    PRIMARY_DARK: '#4f46e5',   // Indigo-600
    SECONDARY: '#64748b',   // Slate-600
    SUCCESS: '#10b981',     // Emerald-500
    WARNING: '#f59e0b',     // Amber-500
    ERROR: '#ef4444',       // Red-500
    BACKGROUND: '#f9fafb',  // Gray-50
    BORDER: '#e2e8f0',      // Slate-200
    TEXT: '#1e293b'         // Slate-900
  },

  // Icons (PrimeNG)
  ICONS: {
    SEND: 'pi pi-send',
    CLOSE: 'pi pi-times',
    CHAT: 'pi pi-comments',
    USER: 'pi pi-user',
    LOADING: 'pi pi-spinner',
    ERROR: 'pi pi-exclamation-circle',
    SUCCESS: 'pi pi-check-circle',
    PHONE: 'pi pi-phone',
    EMAIL: 'pi pi-envelope',
    COUPON: 'pi pi-tag',
    CART: 'pi pi-shopping-cart',
    PRODUCT: 'pi pi-box'
  },

  // Regex Patterns
  PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^(\+?[1-9]\d{1,14}|[0-9]{9,11})$/,
    COUPON_CODE: /^[A-Z0-9-]{2,50}$/i,
    NAME: /^[a-záéíóúñ\s'-]{2,100}$/i
  },

  // Response Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },

  // Mensaje Default Para Errores
  STATIC_MESSAGES: {
    NETWORK_ERROR: 'No se pudo conectar. Verifica tu internet.',
    TIMEOUT_ERROR: 'La solicitud tardó mucho. Intenta de nuevo.',
    VALIDATION_ERROR: 'Por favor verifica los datos.',
    SERVER_ERROR: 'Error en el servidor. Intenta luego.',
    UNKNOWN_ERROR: 'Algo salió mal. Intenta de nuevo.'
  }
};

/**
 * Utility Constants
 */
export const LEALBOT_CONSTANTS = {
  // Session
  SESSION_DURATION: 30 * 60 * 1000, // 30 minutes
  EXPIRATION_CHECK_INTERVAL: 5 * 60 * 1000, // Check every 5 minutes

  // Chat
  MAX_MESSAGES: 200,
  MAX_QUICK_REPLIES: 5,
  SCROLL_INTO_VIEW_DELAY: 100,

  // Product
  DEFAULT_PRODUCT_IMAGE: 'https://via.placeholder.com/200',

  // Pagination
  PRODUCTS_PER_PAGE: 10,
  CATEGORIES_PER_PAGE: 8,

  // Analytics
  TRACK_EVENTS: true,
  TRACK_ABANDONED_CARTS: true,
  TRACK_COMPLETED_ORDERS: true
};

/**
 * Helper function para obtener color por tipo de mensaje
 */
export function getMessageColor(sender: 'USER' | 'BOT' | 'SYSTEM'): string {
  switch (sender) {
    case 'USER':
      return LEALBOT_CONFIG.COLORS.PRIMARY;
    case 'BOT':
      return LEALBOT_CONFIG.COLORS.PRIMARY_LIGHT;
    case 'SYSTEM':
      return LEALBOT_CONFIG.COLORS.BORDER;
    default:
      return LEALBOT_CONFIG.COLORS.BACKGROUND;
  }
}

/**
 * Helper function para obtener icono por tipo de acción
 */
export function getActionIcon(action: string): string {
  const iconMap: { [key: string]: string } = {
    send: LEALBOT_CONFIG.ICONS.SEND,
    close: LEALBOT_CONFIG.ICONS.CLOSE,
    loading: LEALBOT_CONFIG.ICONS.LOADING,
    error: LEALBOT_CONFIG.ICONS.ERROR,
    success: LEALBOT_CONFIG.ICONS.SUCCESS
  };
  return iconMap[action] || LEALBOT_CONFIG.ICONS.CHAT;
}

/**
 * Feature Flag Helper
 */
export function isFeatureEnabled(feature: keyof typeof LEALBOT_CONFIG.FEATURES): boolean {
  return LEALBOT_CONFIG.FEATURES[feature];
}
