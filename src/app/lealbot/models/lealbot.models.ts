/**
 * Modelos e interfaces para el Lealbot - Mesero Virtual
 */

// ============ TIPOS BASE ============
export interface GenericResponse<T> {
  code: number;
  message: string;
  object: T | null;
}

// ============ CUSTOMER ============
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  birthDate?: string;
  active: boolean;
  acceptedPromotions: boolean;
}

export interface ValidateCustomerRequest {
  tenantId: number;
  phone?: string;
  email?: string;
}

export interface ValidateCustomerResponse {
  exists: boolean;
  customer: Customer | null;
  ltv: number | null;
  orderCount: number | null;
  activeCoupons: Coupon[] | null;
  lastOrderProducts: OrderProduct[] | null;
  frequentProducts: any[] | null;
}

export interface RegisterCustomerRequest {
  tenantId: number;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  acceptedPromotions?: boolean;
}

// ============ PRODUCTS ============
export interface Product {
  productId: number;
  productName: string;
  description: string;
  price: number;
  imageUrl?: string;
  quantity?: number;
  comments?: string;
}

export interface OrderProduct extends Product {
  quantity: number;
}

export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  comments?: string;
}

// ============ COUPONS ============
export interface Coupon {
  id: number;
  code: string;
  status: string;
  expiresAt: string;
  qrUrl?: string;
  campaignId?: number | null;
  campaignTitle?: string | null;
  customerId?: number | null;
  customerName?: string | null;
  rewardDescription?: string | null;
  rewardType?: 'PERCENT_DISCOUNT' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'FREE_PRODUCT' | null;
  numericValue?: number | null;
  minPurchaseAmount?: number | null;
  usageLimit?: number | null;
  usageCount?: number | null;
}

// Request para validar cupón (nuevo API)
export interface CouponValidationRequest {
  couponCode: string;
  tenantId: number;
}

// Response detallada de validación de cupón
export interface CouponValidationData {
  isValid: boolean;
  couponCode: string;
  status?: string;
  campaignTitle?: string;
  rewardType?: 'PERCENT_DISCOUNT' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'FREE_PRODUCT';
  rewardValue?: number;
  description?: string;
  expiresAt?: string;
  isExpired: boolean;
  message: string;
  customerName?: string;
  customerEmail?: string;
}

export interface CouponValidationResponse {
  code: number;
  message: string;
  data: CouponValidationData;
}

// Request para redimir cupón
export interface OrderProductRequest {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface RedeemCouponRequest {
  tenantId: number;
  couponCode: string;
  customerId: number;
  orderTotal: number;
  sessionId: string;
  orderProducts: OrderProductRequest[];
  metadata?: string;
}

// Detalles de 2x1
export interface TwoForOneDetails {
  productId: number;
  productName: string;
  buyQuantity: number;
  freeQuantity: number;
  unitPrice: number;
  totalSavings: number;
  message: string;
}

// Response detallada de redención de cupón
export interface RedeemCouponData {
  success: boolean;
  message: string;
  couponCode: string;
  couponId: number;
  campaignTitle: string;
  redeemedAt: string;
  discountType: 'PERCENT_DISCOUNT' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'FREE_PRODUCT';
  discountDescription: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  discountValue?: number | null;
  discountPercentage?: number | null;
  fixedDiscountAmount?: number | null;
  twoForOneDetails?: TwoForOneDetails | null;
  affectedProducts?: any | null;
}

export interface RedeemCouponResponse {
  code: number;
  message: string;
  data: RedeemCouponData | null;
}

// ============ ORDERS ============
export interface OrderItem {
  productId: number;
  cantidad: number;
  precioUnitario: number;
  comentarios?: string;
}

export interface CreateOrderRequest {
  tenantId: number;
  sessionId: string;
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: OrderItem[];
  couponCode?: string;
  descuento?: number;
  subtotal?: number;
  totalFinal?: number;
  source?: string;
}

export interface OrderResponseItem {
  id: number;
  productId: number;
  productName: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  comentarios?: string;
}

export interface OrderResponse {
  id: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  tenantId: number;
  fecha: string;
  estado: string;
  subtotal: number;
  descuento: number;
  total: number;
  source: string;
  items: OrderResponseItem[];
  createdAt: string;
  updatedAt: string;
}

// ============ MESSAGES (CHAT) ============
export interface ChatMessage {
  id?: number;
  messageType: 'TEXT' | 'PRODUCT_SUGGESTION' | 'COUPON_VALIDATION' | 'ORDER_CONFIRMATION' | 'ERROR';
  sender: 'USER' | 'BOT' | 'SYSTEM';
  content: string;
  metadata?: any;
  timestamp?: string;
}

export interface ChatMessageUI extends ChatMessage {
  isLoading?: boolean;
  isError?: boolean;
}

// ============ SESSION STATE ============
export interface LealboState {
  sessionId: string;
  customer: Customer | null;
  messages: ChatMessageUI[];
  cart: CartItem[];
  isLoading: boolean;
  error: string | null;
  appliedCoupon: CouponValidationData | null;
  redeemedCoupon: RedeemCouponData | null;
  subtotal: number;
  discount: number;
  total: number;
  isOpen: boolean;
  availableCoupons?: Coupon[];
}

// ============ CONVERSATION FLOW STATES ============
export enum ConversationState {
  INITIAL = 'INITIAL',
  WAITING_CONTACT = 'WAITING_CONTACT',
  CUSTOMER_IDENTIFIED = 'CUSTOMER_IDENTIFIED',
  CUSTOMER_NEW = 'CUSTOMER_NEW',
  BROWSING = 'BROWSING',
  PRODUCT_SELECTED = 'PRODUCT_SELECTED',
  CROSS_SELL = 'CROSS_SELL',
  COUPON_VALIDATION = 'COUPON_VALIDATION',
  COUPON_SELECTION = 'COUPON_SELECTION',
  REVIEW_ORDER = 'REVIEW_ORDER',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ABANDONED = 'ABANDONED'
}

// ============ DIALOG CHIP (Quick Response) ============
export interface DialogChip {
  label: string;
  value: any;
  icon?: string;
  disabled?: boolean;
}
