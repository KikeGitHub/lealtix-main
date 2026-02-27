/**
 * Barrel exports para simplificar importaciones del módulo Lealbot
 */

// Componente
export { LealbotComponent } from './lealbot.component';

// Servicio
export { LealbotService } from './services/lealbot.service';

// Modelos
export type {
  GenericResponse,
  Customer,
  ValidateCustomerRequest,
  ValidateCustomerResponse,
  RegisterCustomerRequest,
  Product,
  OrderProduct,
  CartItem,
  Coupon,
  CouponValidationRequest,
  CouponValidationResponse,
  OrderItem,
  CreateOrderRequest,
  OrderResponseItem,
  OrderResponse,
  ChatMessage,
  ChatMessageUI,
  LealboState,
  DialogChip
} from './models/lealbot.models';

export { ConversationState } from './models/lealbot.models';

// Mensajes
export { LEALBOT_MESSAGES, MESSAGE_HELPERS } from './lealbot-messages';

// Configuración
export { LEALBOT_CONFIG, LEALBOT_CONSTANTS } from './lealbot.config';

// Utilidades
export { LealbotUtils } from './lealbot.utils';
