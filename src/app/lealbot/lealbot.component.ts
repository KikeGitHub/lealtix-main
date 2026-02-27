import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

// Services && Models
import { LealbotService } from './services/lealbot.service';
import { ProductsMenuService } from '../services/products-menu.service';
import {
  LealboState,
  ConversationState,
  ChatMessageUI,
  Customer,
  CartItem,
  CouponValidationRequest,
  CouponValidationResponse,
  CouponValidationData,
  RedeemCouponRequest,
  RedeemCouponResponse,
  OrderProductRequest,
  Coupon,
  ValidateCustomerRequest,
  CreateOrderRequest,
  OrderItem,
  DialogChip,
  RegisterCustomerRequest
} from './models/lealbot.models';
import { LEALBOT_MESSAGES, MESSAGE_HELPERS } from './lealbot-messages';

@Component({
  selector: 'app-lealbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TextareaModule,
    ProgressSpinnerModule,
    TooltipModule
  ],
  templateUrl: './lealbot.component.html',
  styleUrls: ['./lealbot.component.scss']
})
export class LealbotComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() tenantId: number = 1; // Se debe pasar como input desde el padre
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  // Estado del componente
  state: LealboState = {
    sessionId: '',
    customer: null,
    messages: [],
    cart: [],
    isLoading: false,
    error: null,
    appliedCoupon: null,
    redeemedCoupon: null,
    subtotal: 0,
    discount: 0,
    total: 0,
    isOpen: false,
    availableCoupons: []
  };

  // Control de conversación
  conversationState: ConversationState = ConversationState.INITIAL;
  currentQuickReplies: DialogChip[] = [];
  userInput: string = '';
  isScrollingToBottom = false;
  shouldScroll = false;

  // Para controlar la forma de entrada del usuario
  currentInputType: 'TEXT' | 'EMAIL' | 'PHONE' | 'TEXTAREA' | 'CONTACT' | 'DATE' | null = null;
  inputPlaceholder: string = '';

  // Datos temporales de registro
  private tempRegistrationName: string = '';
  private tempRegistrationEmail: string = '';
  private tempRegistrationPhone: string = '';
  private tempRegistrationGender: string = '';
  private tempRegistrationBirthDate: string = '';
  private initialContactType: 'email' | 'phone' | null = null;

  // Menú de productos
  menuCategories: { name: string; products: any[] }[] = [];
  selectedCategory: string | null = null;

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private lealbotService: LealbotService,
    private productsMenuService: ProductsMenuService
  ) {}

  ngOnInit(): void {
    this.initializeSession();
    this.loadMenu();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    if (this.state.sessionId && this.conversationState !== ConversationState.ORDER_CONFIRMED) {
      this.abandonSession();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * ============ CICLO DE VIDA ============
   */

  private initializeSession(): void {
    // Generar sessionId único
    this.state.sessionId = this.lealbotService.generateSessionId();
    console.log('🚀 Sesión iniciada:', this.state.sessionId);
  }

  toggleChat(): void {
    this.state.isOpen = !this.state.isOpen;
    if (this.state.isOpen && this.state.messages.length === 0) {
      this.sendBotMessage(LEALBOT_MESSAGES.GREETING_INITIAL.text);
      this.currentQuickReplies = LEALBOT_MESSAGES.GREETING_INITIAL.quick_reply || [];
    }
    this.shouldScroll = true;
  }

  /**
   * Reiniciar conversación completa
   */
  resetChat(): void {
    // Abandonar sesión actual si existe
    if (this.state.sessionId && this.conversationState !== ConversationState.ORDER_CONFIRMED) {
      this.abandonSession();
    }

    // Reiniciar todo el estado
    this.state = {
      sessionId: '',
      customer: null,
      messages: [],
      cart: [],
      isLoading: false,
      error: null,
      appliedCoupon: null,
      redeemedCoupon: null,
      subtotal: 0,
      discount: 0,
      total: 0,
      isOpen: true, // Mantener el chat abierto
      availableCoupons: []
    };

    // Reiniciar estado de conversación
    this.conversationState = ConversationState.INITIAL;
    this.currentQuickReplies = [];
    this.userInput = '';
    this.currentInputType = null;
    this.inputPlaceholder = '';

    // Inicializar nueva sesión
    this.initializeSession();

    // Enviar mensaje de bienvenida
    this.sendBotMessage(LEALBOT_MESSAGES.GREETING_INITIAL.text);
    this.currentQuickReplies = LEALBOT_MESSAGES.GREETING_INITIAL.quick_reply || [];
    this.shouldScroll = true;

    console.log('♻️ Chat reiniciado');
  }

  /**
   * ============ MANEJO DE MENSAJES ============
   */

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput.trim();

    // Agregar mensaje del usuario al chat
    this.addMessageToChat('USER', userMessage);
    this.userInput = '';
    this.shouldScroll = true;

    // Procesar el mensaje
    this.processUserMessage(userMessage);
  }

  private processUserMessage(message: string): void {
    const contactType = this.lealbotService.detectContactType(message);

    switch (this.conversationState) {
      case ConversationState.INITIAL:
        this.handleInitialState(message);
        break;

      case ConversationState.WAITING_CONTACT:
        if (contactType) {
          this.validateCustomer(message, contactType);
        } else {
          this.sendBotMessage(LEALBOT_MESSAGES.ERROR_INVALID_CONTACT.text);
          this.shouldScroll = true;
        }
        break;

      case ConversationState.CUSTOMER_NEW:
        if (this.currentInputType === 'TEXT') {
          this.handleNewCustomerName(message);
        } else if (this.currentInputType === 'EMAIL') {
          this.handleNewCustomerEmail(message);
        } else if (this.currentInputType === 'PHONE') {
          this.handleNewCustomerPhone(message);
        } else if (this.currentInputType === 'DATE') {
          this.handleNewCustomerBirthDate(message);
        }
        break;

      case ConversationState.BROWSING:
        // Aquí se manejarían selecciones de categoría
        this.handleCategorySelection(message);
        break;

      case ConversationState.PRODUCT_SELECTED:
        if (this.currentInputType === 'TEXT') {
          this.handleProductSelection(message);
        } else if (this.currentInputType === 'TEXTAREA') {
          this.handleProductComments(message);
        }
        break;

      case ConversationState.COUPON_VALIDATION:
        this.validateCoupon(message);
        break;

      default:
        this.sendBotMessage(LEALBOT_MESSAGES.EMPTY_STATE.text);
        this.currentQuickReplies = LEALBOT_MESSAGES.EMPTY_STATE.quick_reply || [];
        this.shouldScroll = true;
    }
  }

  handleQuickReply(value: any): void {
    // Agregar respuesta rápida como si fuera un mensaje del usuario
    const chip = this.currentQuickReplies.find(c => c.value === value);
    if (chip) {
      this.addMessageToChat('USER', chip.label);
      this.shouldScroll = true;
    }

    // Manejar selección de producto por quick reply
    if (typeof value === 'string' && value.startsWith('product_')) {
      const productIndex = parseInt(value.replace('product_', ''));
      this.handleProductSelectionByIndex(productIndex);
      return;
    }

    // Manejar selección de categoría
    if (typeof value === 'string' && value.startsWith('category_')) {
      const categoryName = value.replace('category_', '').replace(/_/g, ' ');
      this.handleCategorySelectionByValue(categoryName);
      return;
    }

    // Manejar selección de cupón
    if (typeof value === 'string' && value.startsWith('coupon_')) {
      const couponCode = value.replace('coupon_', '');
      this.handleCouponSelection(couponCode);
      return;
    }

    switch (value) {
      case 'start':
        this.startOrder();
        break;

      case 'close':
        this.closeChat();
        break;

      case 'repeat_last':
        this.repeatLastOrder();
        break;

      case 'browse_menu':
        this.browseMenu();
        break;

      case 'no_comments':
        this.finalizeProductSelection();
        break;

      case 'add_more':
        this.browseMenu();
        break;

      case 'accept_suggestion':
        // Se maneja en el contexto de sugerencias
        this.browseMenu();
        break;

      case 'skip_suggestion':
        this.handleSkipSuggestion();
        break;

      case 'no_coupon':
        this.skipCouponSelection();
        break;

      case 'view_coupons':
        this.showAvailableCoupons();
        break;

      case 'skip_email':
        this.handleNewCustomerEmail('skip_email');
        break;

      case 'skip_phone':
        this.handleNewCustomerPhone('skip_phone');
        break;

      case 'skip_birthdate':
        this.handleNewCustomerBirthDate('skip_birthdate');
        break;

      case 'skip_gender':
      case 'Hombre':
      case 'Mujer':
      case 'Otro':
        this.handleNewCustomerGender(value);
        break;

      case 'confirm_order':
        this.confirmOrder();
        break;

      case 'confirm_order_no_coupon':
        this.state.appliedCoupon = null;
        this.state.redeemedCoupon = null;
        this.createOrder();
        break;

      case 'modify_order':
        this.browseMenu();
        break;

      case 'cancel_order':
        this.closeChat();
        break;

      case 'try_another_coupon':
        this.askForCoupon();
        break;

      case 'skip_coupon':
        this.reviewOrder();
        break;

      // Estados de error
      case 'retry':
      case 'retry_order':
        this.startOrder();
        break;
    }
  }

  /**
   * ============ FLUJOS DEL CHATBOT ============
   */

  private handleInitialState(message: string): void {
    if (message.toLowerCase().includes('si') || message.toLowerCase().includes('hola')) {
      this.startOrder();
    } else {
      this.closeChat();
    }
  }

  private startOrder(): void {
    this.conversationState = ConversationState.WAITING_CONTACT;
    this.sendBotMessage(LEALBOT_MESSAGES.ASKING_CONTACT.text);
    this.currentInputType = 'CONTACT';
    this.inputPlaceholder = LEALBOT_MESSAGES.ASKING_CONTACT.placeholder;
    this.currentQuickReplies = LEALBOT_MESSAGES.ASKING_CONTACT.quick_reply || [];
    this.shouldScroll = true;
  }

  private validateCustomer(contact: string, type: 'email' | 'phone'): void {
    this.state.isLoading = true;
    this.sendBotMessage(LEALBOT_MESSAGES.LOADING_CUSTOMER.text);

    // Guardar el tipo de contacto inicial para registro posterior
    this.initialContactType = type;
    if (type === 'email') {
      this.tempRegistrationEmail = contact;
    } else {
      this.tempRegistrationPhone = contact;
    }

    const request: ValidateCustomerRequest = {
      tenantId: this.tenantId
    };

    if (type === 'email') {
      request.email = contact;
    } else {
      request.phone = contact;
    }

    this.lealbotService
      .validateCustomer(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.state.isLoading = false;
          if (response.object && response.object.exists && response.object.customer) {
            this.handleExistingCustomer(
              response.object.customer,
              response.object.lastOrderProducts,
              response.object.activeCoupons
            );
          } else {
            this.handleNewCustomer();
          }
        },
        error: (error) => {
          this.state.isLoading = false;
          this.handleApiError(error);
        }
      });
  }

  private handleExistingCustomer(customer: Customer, lastProducts: any[] | null, activeCoupons: Coupon[] | null): void {
    this.state.customer = customer;
    this.state.availableCoupons = activeCoupons || [];
    this.conversationState = ConversationState.CUSTOMER_IDENTIFIED;

    // Saludar
    this.sendBotMessage(LEALBOT_MESSAGES.GREETING_RETURNING.text(customer.name));

    if (lastProducts && lastProducts.length > 0) {
      // Ofrecer repetir último pedido
      const firstProduct = lastProducts[0];
      setTimeout(() => {
        this.sendBotMessage(
          LEALBOT_MESSAGES.ASKING_REPEAT_ORDER.text(customer.name, firstProduct.productName)
        );
        this.currentQuickReplies = LEALBOT_MESSAGES.ASKING_REPEAT_ORDER.quick_reply || [];
        this.shouldScroll = true;
      }, 300);
    } else {
      setTimeout(() => {
        this.browseMenu();
      }, 300);
    }
  }

  private handleNewCustomer(): void {
    this.conversationState = ConversationState.CUSTOMER_NEW;
    this.sendBotMessage(LEALBOT_MESSAGES.GREETING_NEW.text);

    setTimeout(() => {
      this.askNewCustomerName();
    }, 500);
  }

  private askNewCustomerName(): void {
    this.sendBotMessage(LEALBOT_MESSAGES.ASKING_NAME.text);
    this.currentInputType = 'TEXT';
    this.inputPlaceholder = LEALBOT_MESSAGES.ASKING_NAME.placeholder;
    this.currentQuickReplies = [];
    this.shouldScroll = true;
  }

  private handleNewCustomerName(name: string): void {
    this.tempRegistrationName = name;
    this.state.customer = {
      id: 0, // Se asignará al registrar
      name: name,
      email: this.tempRegistrationEmail,
      phone: this.tempRegistrationPhone,
      active: true,
      acceptedPromotions: true
    };

    // Pedir el contacto complementario (email si dio phone, phone si dio email)
    // Solo preguntar si aún no lo tenemos
    if (this.initialContactType === 'phone' && !this.tempRegistrationEmail) {
      this.askNewCustomerEmail();
    } else if (this.initialContactType === 'email' && !this.tempRegistrationPhone) {
      this.askNewCustomerPhone();
    } else {
      // Si ya tenemos ambos contactos, ir directo a fecha de nacimiento
      this.askNewCustomerBirthDate();
    }
  }

  private askNewCustomerEmail(): void {
    this.sendBotMessage(LEALBOT_MESSAGES.ASKING_EMAIL.text);
    this.currentInputType = 'EMAIL';
    this.inputPlaceholder = LEALBOT_MESSAGES.ASKING_EMAIL.placeholder;
    this.currentQuickReplies = LEALBOT_MESSAGES.ASKING_EMAIL.quick_reply || [];
    this.shouldScroll = true;
  }

  private handleNewCustomerEmail(email: string): void {
    if (email === 'skip_email') {
      this.tempRegistrationEmail = '';
      this.askNewCustomerBirthDate();
      return;
    }

    if (!this.lealbotService.isValidEmail(email)) {
      this.sendBotMessage(LEALBOT_MESSAGES.ERROR_INVALID_EMAIL.text);
      this.shouldScroll = true;
      return;
    }

    this.tempRegistrationEmail = email;
    if (this.state.customer) {
      this.state.customer.email = email;
    }

    // Siguiente paso: fecha de nacimiento
    this.askNewCustomerBirthDate();
  }

  private askNewCustomerPhone(): void {
    this.sendBotMessage(LEALBOT_MESSAGES.ASKING_PHONE.text);
    this.currentInputType = 'PHONE';
    this.inputPlaceholder = LEALBOT_MESSAGES.ASKING_PHONE.placeholder;
    this.currentQuickReplies = LEALBOT_MESSAGES.ASKING_PHONE.quick_reply || [];
    this.shouldScroll = true;
  }

  private handleNewCustomerPhone(phone: string): void {
    if (phone === 'skip_phone') {
      this.tempRegistrationPhone = '';
      this.askNewCustomerBirthDate();
      return;
    }

    this.tempRegistrationPhone = phone;
    if (this.state.customer) {
      this.state.customer.phone = phone;
    }

    // Siguiente paso: fecha de nacimiento
    this.askNewCustomerBirthDate();
  }

  private askNewCustomerBirthDate(): void {
    this.sendBotMessage(LEALBOT_MESSAGES.ASKING_BIRTHDATE.text);
    this.currentInputType = 'DATE';
    this.inputPlaceholder = LEALBOT_MESSAGES.ASKING_BIRTHDATE.placeholder;
    this.currentQuickReplies = LEALBOT_MESSAGES.ASKING_BIRTHDATE.quick_reply || [];
    this.shouldScroll = true;
  }

  private handleNewCustomerBirthDate(birthDate: string): void {
    if (birthDate === 'skip_birthdate') {
      this.tempRegistrationBirthDate = '';
      this.askNewCustomerGender();
      return;
    }

    // Validación simple de formato DD/MM/AAAA
    const datePattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!datePattern.test(birthDate)) {
      this.sendBotMessage('Por favor, usa el formato DD/MM/AAAA (ejemplo: 15/03/1990)');
      this.shouldScroll = true;
      return;
    }

    this.tempRegistrationBirthDate = birthDate;
    if (this.state.customer) {
      this.state.customer.birthDate = birthDate;
    }

    // Siguiente paso: género
    this.askNewCustomerGender();
  }

  private askNewCustomerGender(): void {
    this.sendBotMessage(LEALBOT_MESSAGES.ASKING_GENDER.text);
    this.currentInputType = null; // Solo quick replies, no input de texto
    this.inputPlaceholder = '';
    this.currentQuickReplies = LEALBOT_MESSAGES.ASKING_GENDER.quick_reply || [];
    this.shouldScroll = true;
  }

  private handleNewCustomerGender(gender: string): void {
    if (gender === 'skip_gender') {
      this.tempRegistrationGender = '';
    } else {
      this.tempRegistrationGender = gender;
      if (this.state.customer) {
        this.state.customer.gender = gender;
      }
    }

    // Registrar el cliente con todos los datos recopilados
    this.registerNewCustomer();
  }

  private registerNewCustomer(): void {
    this.state.isLoading = true;
    this.sendBotMessage(LEALBOT_MESSAGES.LOADING_CUSTOMER.text);

    // Convertir fecha de DD/MM/AAAA a formato ISO YYYY-MM-DD
    let birthDateISO: string | undefined = undefined;
    if (this.tempRegistrationBirthDate) {
      birthDateISO = this.convertToISODate(this.tempRegistrationBirthDate);
    }

    const request: RegisterCustomerRequest = {
      tenantId: this.tenantId,
      name: this.tempRegistrationName,
      email: this.tempRegistrationEmail || '',
      phone: this.tempRegistrationPhone || undefined,
      gender: this.tempRegistrationGender || undefined,
      birthDate: birthDateISO,
      acceptedPromotions: true
    };

    this.lealbotService
      .registerCustomer(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.state.isLoading = false;
          if (response.object) {
            this.state.customer = response.object;
            this.sendBotMessage(LEALBOT_MESSAGES.REGISTERED_SUCCESS.text(this.tempRegistrationName));

            // Limpiar datos temporales
            this.clearTempRegistrationData();

            setTimeout(() => {
              this.browseMenu();
            }, 500);
          }
        },
        error: (error) => {
          this.state.isLoading = false;
          this.handleApiError(error);
        }
      });
  }

  private clearTempRegistrationData(): void {
    this.tempRegistrationName = '';
    this.tempRegistrationEmail = '';
    this.tempRegistrationPhone = '';
    this.tempRegistrationGender = '';
    this.tempRegistrationBirthDate = '';
    this.initialContactType = null;
  }

  /**
   * Convierte una fecha de formato DD/MM/AAAA a formato ISO YYYY-MM-DD
   * @param dateStr Fecha en formato DD/MM/AAAA
   * @returns Fecha en formato YYYY-MM-DD
   */
  private convertToISODate(dateStr: string): string {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;

    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];

    return `${year}-${month}-${day}`;
  }

  private repeatLastOrder(): void {
    if (!this.state.customer) return;

    this.state.isLoading = true;
    this.sendBotMessage(LEALBOT_MESSAGES.LOADING_LAST_PRODUCTS.text);

    this.lealbotService
      .getLastOrder(this.state.customer.id, this.tenantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.state.isLoading = false;
          if (response.object && response.object.length > 0) {
            // Convertir OrderProducts a CartItems
            this.state.cart = response.object.map(p => ({
              productId: p.productId,
              productName: p.productName,
              price: p.price,
              imageUrl: p.imageUrl,
              quantity: p.quantity || 1,
              comments: p.comments
            }));

            // Mostrar resumen
            this.sendBotMessage('✅ Añadí lo de siempre a tu carrito.');
            this.sendBotMessage('¿Algo más? ¿Un postre? ¿Una bebida?');
            this.currentQuickReplies = [
              { label: '✅ Confirmar', value: 'confirm_order' },
              { label: '➕ Agregar más', value: 'browse_menu' }
            ];
            this.shouldScroll = true;
          }
        },
        error: (error) => {
          this.state.isLoading = false;
          this.handleApiError(error);
        }
      });
  }

  private browseMenu(): void {
    this.conversationState = ConversationState.BROWSING;
    this.sendBotMessage(LEALBOT_MESSAGES.BROWSING_MENU.text);

    if (this.menuCategories.length === 0) {
      this.sendBotMessage('⏳ Cargando menú...');
      this.loadMenu().then(() => {
        this.showCategoryOptions();
      });
    } else {
      this.showCategoryOptions();
    }
  }

  private showCategoryOptions(): void {
    if (this.menuCategories.length === 0) {
      this.sendBotMessage('⚠️ Lo siento, no hay productos disponibles en este momento.');
      this.currentQuickReplies = [];
      this.shouldScroll = true;
      return;
    }

    // Crear chips con las categorías disponibles
    this.currentQuickReplies = this.menuCategories.map(cat => ({
      label: `🍽️ ${cat.name}`,
      value: `category_${cat.name.toLowerCase().replace(/\s+/g, '_')}`
    }));
    this.shouldScroll = true;
  }

  private async loadMenu(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.productsMenuService.getProductsByTenantId(this.tenantId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            console.log('🍔 Productos cargados:', response);
            if (response.object && Array.isArray(response.object)) {
              this.menuCategories = this.mapProductsToCategories(response.object);
              console.log('🏷️ Categorías procesadas:', this.menuCategories);
            }
            resolve();
          },
          error: (error) => {
            console.error('❌ Error al cargar menú:', error);
            this.menuCategories = [];
            resolve(); // Resolvemos de todas formas para no bloquear el flujo
          }
        });
    });
  }

  private mapProductsToCategories(products: any[]): { name: string; products: any[] }[] {
    const categoriesMap: { [key: string]: any[] } = {};

    products.forEach(product => {
      // Filtrar productos o categorías inactivas
      if (product.isActive === false || product.categoryIsActive === false) {
        return;
      }

      const categoryName = product.categoryName || 'Sin categoría';
      if (!categoriesMap[categoryName]) {
        categoriesMap[categoryName] = [];
      }

      categoriesMap[categoryName].push({
        id: product.id,
        productId: product.id, // Para compatibilidad
        name: product.name,
        productName: product.name, // Para compatibilidad
        description: product.description || '',
        price: product.price || 0,
        imageUrl: product.imageUrl || '',
        categoryName: categoryName
      });
    });

    // Convertir a array de categorías
    return Object.keys(categoriesMap)
      .filter(key => categoriesMap[key].length > 0)
      .map(key => ({
        name: key,
        products: categoriesMap[key]
      }));
  }

  private handleCategorySelection(message: string): void {
    // Limpiar el mensaje (remover emojis y espacios extra)
    const cleanMessage = message.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim().toLowerCase();
    this.handleCategorySelectionByValue(cleanMessage);
  }

  private handleCategorySelectionByValue(categoryValue: string): void {
    const searchTerm = categoryValue.toLowerCase().trim();

    console.log('🔍 Buscando categoría:', searchTerm);
    console.log('📂 Categorías disponibles:', this.menuCategories.map(c => c.name));

    // Buscar la categoría que coincida
    const category = this.menuCategories.find(cat =>
      cat.name.toLowerCase() === searchTerm ||
      cat.name.toLowerCase().includes(searchTerm) ||
      searchTerm.includes(cat.name.toLowerCase())
    );

    if (!category || !category.products || category.products.length === 0) {
      this.sendBotMessage(`⚠️ No encontré productos en esta categoría.`);
      this.sendBotMessage(`Buscaste: "${categoryValue}"`);
      this.browseMenu();
      return;
    }

    this.selectedCategory = category.name;
    this.sendBotMessage(`🍽️ ${category.name} (${category.products.length} productos):`);
    this.sendBotMessage('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

    // Mostrar todos los productos o hasta 20 si son muchos
    const maxToShow = 20;
    const productsToShow = category.products.slice(0, maxToShow);
    productsToShow.forEach((product, index) => {
      this.sendBotMessage(`${index + 1}. ${product.name} - $${product.price}`);
    });

    if (category.products.length > maxToShow) {
      this.sendBotMessage(`... y ${category.products.length - maxToShow} productos más`);
    }

    this.sendBotMessage('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

    // Preguntar qué producto quiere
    setTimeout(() => {
      this.sendBotMessage('👆 Escribe el número o nombre del producto que deseas agregar.');
      this.conversationState = ConversationState.PRODUCT_SELECTED;
      this.currentInputType = 'TEXT';
      this.inputPlaceholder = 'Ej: 1 o Huevos rancheros';

      // Si hay pocos productos (10 o menos), crear quick replies con números
      if (category.products.length <= 10) {
        this.currentQuickReplies = [
          ...category.products.map((p, index) => ({
            label: `${index + 1}. ${p.name}`,
            value: `product_${index}`
          })),
          { label: '⬅️ Volver', value: 'browse_menu' }
        ];
      } else {
        this.currentQuickReplies = [
          { label: '⬅️ Volver a categorías', value: 'browse_menu' }
        ];
      }
      this.shouldScroll = true;
    }, 300);
  }

  private handleProductSelection(productName: string): void {
    if (!this.selectedCategory) {
      this.sendBotMessage('⚠️ Por favor selecciona primero una categoría.');
      this.browseMenu();
      return;
    }

    // Buscar la categoría seleccionada
    const category = this.menuCategories.find(cat => cat.name === this.selectedCategory);
    if (!category) {
      this.sendBotMessage('⚠️ No encontré la categoría seleccionada.');
      this.browseMenu();
      return;
    }

    // Verificar si es un número
    const productNumber = parseInt(productName.trim());
    if (!isNaN(productNumber) && productNumber > 0 && productNumber <= category.products.length) {
      this.handleProductSelectionByIndex(productNumber - 1);
      return;
    }

    // Buscar el producto por nombre (búsqueda flexible)
    const searchTerm = productName.toLowerCase().trim();
    const product = category.products.find(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      searchTerm.includes(p.name.toLowerCase())
    );

    if (!product) {
      this.sendBotMessage(`❌ No encontré "${productName}" en ${this.selectedCategory}.`);
      this.sendBotMessage('Por favor, intenta con el número o el nombre del producto.');
      this.currentQuickReplies = [
        { label: '⬅️ Volver a categorías', value: 'browse_menu' }
      ];
      this.shouldScroll = true;
      return;
    }

    this.addProductToCart(product);
  }

  private handleProductSelectionByIndex(index: number): void {
    if (!this.selectedCategory) {
      this.sendBotMessage('⚠️ Por favor selecciona primero una categoría.');
      this.browseMenu();
      return;
    }

    const category = this.menuCategories.find(cat => cat.name === this.selectedCategory);
    if (!category || !category.products[index]) {
      this.sendBotMessage('⚠️ Producto no encontrado.');
      this.browseMenu();
      return;
    }

    const product = category.products[index];
    this.addProductToCart(product);
  }

  private addProductToCart(product: any): void {
    const existingItem = this.state.cart.find(item => item.productId === product.productId);
    if (existingItem) {
      existingItem.quantity += 1;
      this.sendBotMessage(`✅ Agregué otro ${product.name} a tu carrito. Llevas ${existingItem.quantity}.`);
    } else {
      this.state.cart.push({
        productId: product.productId,
        productName: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: 1,
        comments: ''
      });
      this.sendBotMessage(`✅ Agregué ${product.name} ($${product.price}) a tu carrito.`);
    }

    // Actualizar totales del carrito
    this.calculateTotals();

    // Preguntar por comentarios
    setTimeout(() => {
      this.sendBotMessage('¿Algún comentario para este producto? (ej: sin cebolla, bien cocido, etc.)');
      this.currentInputType = 'TEXTAREA';
      this.inputPlaceholder = 'Escribe aquí tus comentarios...';
      this.currentQuickReplies = [
        { label: '✅ Sin comentarios', value: 'no_comments' }
      ];
      // Guardar temporalmente el producto para asignarle los comentarios
      this.state.cart[this.state.cart.length - 1].comments = '';
      this.shouldScroll = true;
    }, 300);
  }

  private handleProductComments(comments: string): void {
    // Asignar comentarios al último producto del carrito
    if (this.state.cart.length > 0) {
      const lastProduct = this.state.cart[this.state.cart.length - 1];
      lastProduct.comments = comments.trim();
      if (comments.trim()) {
        this.sendBotMessage(`📝 Comentario agregado: "${comments}"`);
      }
    }
    this.finalizeProductSelection();
  }

  private finalizeProductSelection(): void {
    // Preguntar si quiere agregar más productos
    this.sendBotMessage('¿Deseas agregar algo más a tu orden?');
    this.currentQuickReplies = [
      { label: '➕ Agregar más', value: 'add_more' },
      { label: '✅ Continuar con mi orden', value: 'skip_coupon' }
    ];
    this.conversationState = ConversationState.CROSS_SELL;
    this.currentInputType = null;
    this.shouldScroll = true;
  }

  private handleSkipSuggestion(): void {
    this.conversationState = ConversationState.CROSS_SELL;
    this.browseMenu();
  }

  private askForCoupon(): void {
    this.conversationState = ConversationState.COUPON_VALIDATION;
    this.sendBotMessage(LEALBOT_MESSAGES.ASKING_COUPON.text);
    this.currentInputType = 'TEXT';
    this.inputPlaceholder = LEALBOT_MESSAGES.ASKING_COUPON.placeholder;
    this.currentQuickReplies = LEALBOT_MESSAGES.ASKING_COUPON.quick_reply || [];
    this.shouldScroll = true;
  }

  private validateCoupon(couponCode: string): void {
    this.state.isLoading = true;
    this.sendBotMessage(LEALBOT_MESSAGES.VALIDATING_COUPON.text);

    this.lealbotService
      .validateCoupon({ couponCode, tenantId: this.tenantId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.state.isLoading = false;
          if (response.data && response.data.isValid) {
            // Cupón válido
            this.state.appliedCoupon = response.data;
            this.sendBotMessage(LEALBOT_MESSAGES.COUPON_APPLIED.text(
              response.data.campaignTitle || 'Cupón',
              response.data.description || ''
            ));

            setTimeout(() => {
              this.showOrderSummary();
            }, 500);
          } else if (response.data) {
            this.sendBotMessage(LEALBOT_MESSAGES.COUPON_INVALID.text(response.data.message || 'Cupón inválido'));
            this.currentQuickReplies = LEALBOT_MESSAGES.COUPON_INVALID.quick_reply || [];
            this.shouldScroll = true;
          }
        },
        error: (error) => {
          this.state.isLoading = false;
          this.sendBotMessage(LEALBOT_MESSAGES.COUPON_ERROR.text(error.message));
          this.currentQuickReplies = LEALBOT_MESSAGES.COUPON_ERROR.quick_reply || [];
          this.shouldScroll = true;
        }
      });
  }

  private reviewOrder(): void {
    if (this.state.cart.length === 0) {
      this.sendBotMessage(LEALBOT_MESSAGES.ERROR_EMPTY_CART.text);
      this.currentQuickReplies = LEALBOT_MESSAGES.ERROR_EMPTY_CART.quick_reply || [];
      this.shouldScroll = true;
      return;
    }

    // Si no se ha aplicado un cupón y hay cupones disponibles, preguntar primero
    if (!this.state.appliedCoupon && this.state.availableCoupons && this.state.availableCoupons.length > 0) {
      this.offerCoupons();
      return;
    }

    // Calcular totales
    this.calculateTotals();

    this.conversationState = ConversationState.REVIEW_ORDER;
    this.sendBotMessage(
      LEALBOT_MESSAGES.ORDER_SUMMARY.text(
        this.state.subtotal,
        this.state.discount,
        this.state.total
      )
    );
    this.currentQuickReplies = LEALBOT_MESSAGES.ORDER_SUMMARY.quick_reply || [];
    this.shouldScroll = true;
  }

  private calculateTotals(): void {
    this.state.subtotal = this.state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (this.state.redeemedCoupon) {
      // Si ya se redimió el cupón, usar esos valores
      this.state.discount = this.state.redeemedCoupon.discountAmount;
      this.state.total = this.state.redeemedCoupon.finalAmount;
    } else if (this.state.appliedCoupon) {
      // Si solo se validó, calcular estimado
      const rewardValue = this.state.appliedCoupon.rewardValue || 0;
      const type = this.state.appliedCoupon.rewardType;

      if (type === 'PERCENT_DISCOUNT') {
        this.state.discount = (this.state.subtotal * rewardValue) / 100;
      } else if (type === 'FIXED_AMOUNT') {
        this.state.discount = rewardValue;
      } else {
        this.state.discount = 0; // Para 2x1 y FREE_PRODUCT, se calcula al redimir
      }
      this.state.total = Math.max(0, this.state.subtotal - this.state.discount);
    } else {
      this.state.discount = 0;
      this.state.total = this.state.subtotal;
    }
  }

  /**
   * ============ GESTIÓN DE CUPONES ============
   */

  private offerCoupons(): void {
    const count = this.state.availableCoupons?.length || 0;
    if (count > 0) {
      this.conversationState = ConversationState.COUPON_SELECTION;
      this.sendBotMessage(LEALBOT_MESSAGES.HAS_ACTIVE_COUPONS.text(count));
      this.currentQuickReplies = LEALBOT_MESSAGES.HAS_ACTIVE_COUPONS.quick_reply || [];
      this.shouldScroll = true;
    } else {
      this.skipCouponSelection();
    }
  }

  private showAvailableCoupons(): void {
    if (!this.state.availableCoupons || this.state.availableCoupons.length === 0) {
      this.sendBotMessage(LEALBOT_MESSAGES.NO_ACTIVE_COUPONS.text);
      this.skipCouponSelection();
      return;
    }

    // Crear chips para cada cupón con descripción
    const couponChips: DialogChip[] = this.state.availableCoupons.map(coupon => {
      let label = `🎟️ ${coupon.code}`;

      // Agregar título de campaña si está disponible
      if (coupon.campaignTitle) {
        label = `${coupon.campaignTitle} (${coupon.code})`;
      }

      // Agregar info del descuento si está disponible
      if (coupon.rewardType && coupon.numericValue) {
        if (coupon.rewardType === 'PERCENT_DISCOUNT') {
          label += ` - ${coupon.numericValue}% OFF`;
        } else if (coupon.rewardType === 'FIXED_AMOUNT') {
          label += ` - $${coupon.numericValue} OFF`;
        } else if (coupon.rewardType === 'BUY_X_GET_Y') {
          label += ` - 2x1`;
        } else if (coupon.rewardType === 'FREE_PRODUCT') {
          label += ` - Producto Gratis`;
        }
      }

      return {
        label: label,
        value: `coupon_${coupon.code}`,
        disabled: coupon.status !== 'ACTIVE'
      };
    });

    couponChips.push({ label: '⏭️ No usar cupón', value: 'no_coupon' });

    this.sendBotMessage('🎁 Selecciona un cupón para aplicar a tu orden:');

    // Si los cupones tienen descripción, mostrarla
    if (this.state.availableCoupons.some(c => c.rewardDescription)) {
      let descriptions = '\n\n';
      this.state.availableCoupons.forEach(coupon => {
        if (coupon.rewardDescription) {
          descriptions += `• ${coupon.code}: ${coupon.rewardDescription}\n`;
        }
      });
      if (descriptions !== '\n\n') {
        this.sendBotMessage(descriptions);
      }
    }

    this.currentQuickReplies = couponChips;
    this.shouldScroll = true;
  }

  private handleCouponSelection(couponCode: string): void {
    this.state.isLoading = true;
    this.sendBotMessage(LEALBOT_MESSAGES.VALIDATING_COUPON.text);

    const request: CouponValidationRequest = {
      couponCode: couponCode,
      tenantId: this.tenantId
    };

    this.lealbotService
      .validateCoupon(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.state.isLoading = false;
          if (response.data && response.data.isValid) {
            // Cupón válido
            this.state.appliedCoupon = response.data;

            // Construir mensaje informativo según el tipo de recompensa
            let message = `✅ Cupón aplicado: ${response.data.campaignTitle || couponCode}`;

            if (response.data.description) {
              message += `\n${response.data.description}`;
            }

            // Mostrar tipo de descuento
            if (response.data.rewardType && response.data.rewardValue) {
              message += '\n\n';
              switch (response.data.rewardType) {
                case 'PERCENT_DISCOUNT':
                  message += `🎁 Descuento: ${response.data.rewardValue}% de descuento`;
                  break;
                case 'FIXED_AMOUNT':
                  message += `🎁 Descuento: $${response.data.rewardValue} de descuento`;
                  break;
                case 'BUY_X_GET_Y':
                  message += `🎁 Promoción: 2x1 en productos seleccionados`;
                  break;
                case 'FREE_PRODUCT':
                  message += `🎁 Promoción: Producto gratis`;
                  break;
              }
            }

            this.sendBotMessage(message);
            this.shouldScroll = true;

            // Continuar con el resumen de la orden
            setTimeout(() => {
              this.showOrderSummary();
            }, 500);
          } else if (response.data) {
            // Cupón inválido
            this.sendBotMessage(LEALBOT_MESSAGES.COUPON_INVALID.text(response.data.message || 'Cupón inválido'));
            this.currentQuickReplies = LEALBOT_MESSAGES.COUPON_INVALID.quick_reply || [];
            this.shouldScroll = true;
          }
        },
        error: (error) => {
          this.state.isLoading = false;
          this.sendBotMessage(LEALBOT_MESSAGES.COUPON_ERROR.text(error.message));
          this.currentQuickReplies = LEALBOT_MESSAGES.COUPON_ERROR.quick_reply || [];
          this.shouldScroll = true;
        }
      });
  }

  private skipCouponSelection(): void {
    this.state.appliedCoupon = null;
    this.showOrderSummary();
  }

  private showOrderSummary(): void {
    this.calculateTotals();
    this.conversationState = ConversationState.REVIEW_ORDER;
    this.sendBotMessage(
      LEALBOT_MESSAGES.ORDER_SUMMARY.text(
        this.state.subtotal,
        this.state.discount,
        this.state.total
      )
    );
    this.currentQuickReplies = LEALBOT_MESSAGES.ORDER_SUMMARY.quick_reply || [];
    this.shouldScroll = true;
  }

  /**
   * ============ CONFIRMACIÓN DE ORDEN ============
   */

  private confirmOrder(): void {
    if (this.state.cart.length === 0) {
      this.sendBotMessage(LEALBOT_MESSAGES.ERROR_EMPTY_CART.text);
      return;
    }

    // Si hay un cupón seleccionado, redimirlo primero
    if (this.state.appliedCoupon && !this.state.redeemedCoupon) {
      this.redeemCouponAndCreateOrder();
    } else {
      this.createOrder();
    }
  }

  private redeemCouponAndCreateOrder(): void {
    if (!this.state.appliedCoupon || !this.state.customer) {
      this.createOrder();
      return;
    }

    this.state.isLoading = true;
    this.sendBotMessage('⏳ Aplicando cupón...');

    // Preparar productos para la redención
    const orderProducts: OrderProductRequest[] = this.state.cart.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.price,
      subtotal: item.price * item.quantity
    }));

    const redeemRequest: RedeemCouponRequest = {
      tenantId: this.tenantId,
      couponCode: this.state.appliedCoupon.couponCode,
      customerId: this.state.customer.id,
      orderTotal: this.state.subtotal,
      sessionId: this.state.sessionId,
      orderProducts: orderProducts,
      metadata: JSON.stringify({ source: 'chatbot', version: '1.0' })
    };

    this.lealbotService
      .redeemCoupon(redeemRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.state.isLoading = false;
          console.log('Respuesta redención:', response);

          const isSuccess = response.code === 200 || response.code === 201;

          if (isSuccess && response.data) {
            // Cupón redimido exitosamente con detalles
            console.log('Redención exitosa con detalles:', response.data);
            this.state.redeemedCoupon = response.data;

            // Actualizar totales con los valores de la redención
            this.state.discount = response.data.discountAmount || 0;
            this.state.total = response.data.finalAmount || 0;

            // Mostrar información del descuento aplicado
            this.showCouponRedemptionMessage(response.data);

            // Continuar con la creación de la orden
            setTimeout(() => {
              this.createOrder();
            }, 2000); // Aumentar a 2 segundos para que el usuario vea el mensaje
          } else if (isSuccess && !response.data) {
            // Éxito pero sin detalles de redención
            console.log('Redención exitosa sin detalles');
            this.sendBotMessage(`✅ ${response.message || 'Cupón redimido exitosamente'}`);
            this.shouldScroll = true;

            setTimeout(() => {
              this.createOrder();
            }, 2000);
          } else {
            // Error al redimir - respuesta con código de error
            console.log('Error en redención:', response);
            this.state.isLoading = false;
            const errorMsg = response.message || 'No se pudo aplicar el cupón';
            this.sendBotMessage(LEALBOT_MESSAGES.COUPON_ERROR.text(errorMsg));

            // Ofrecer continuar sin cupón
            this.currentQuickReplies = [
              { label: '✅ Continuar sin cupón', value: 'confirm_order_no_coupon' },
              { label: '❌ Cancelar', value: 'cancel_order' }
            ];
            this.shouldScroll = true;
          }
        },
        error: (error) => {
          this.state.isLoading = false;
          this.sendBotMessage(LEALBOT_MESSAGES.COUPON_ERROR.text(error.message));

          // Ofrecer continuar sin cupón
          this.currentQuickReplies = [
            { label: '✅ Continuar sin cupón', value: 'confirm_order_no_coupon' },
            { label: '❌ Cancelar', value: 'cancel_order' }
          ];
          this.shouldScroll = true;
        }
      });
  }

  /**
   * Muestra el mensaje de redención de cupón según el tipo de recompensa
   */
  private showCouponRedemptionMessage(redemption: any): void {
    const discountType = redemption.discountType;
    console.log('Mostrando mensaje de redención:', { discountType, redemption });

    switch (discountType) {
      case 'PERCENT_DISCOUNT':
        // Usar discountValue o discountPercentage (el BE puede enviar cualquiera)
        const percentage = redemption.discountPercentage ?? redemption.discountValue ?? 0;
        this.sendBotMessage(
          `✅ ${redemption.campaignTitle || 'Cupón aplicado'}\n` +
          `${redemption.discountDescription || ''}\n\n` +
          `💰 Total original: $${Number(redemption.originalAmount).toFixed(2)}\n` +
          `🔻 Descuento${percentage > 0 ? ` (${percentage}%)` : ''}: -$${Number(redemption.discountAmount).toFixed(2)}\n` +
          `💳 Total a pagar: $${Number(redemption.finalAmount).toFixed(2)}`
        );
        this.shouldScroll = true;
        break;

      case 'FIXED_AMOUNT':
        // Descuento de monto fijo aplicado por el backend
        this.sendBotMessage(
          `✅ ${redemption.campaignTitle || 'Descuento aplicado'}\n` +
          `${redemption.discountDescription || ''}\n\n` +
          `💰 Total original: $${Number(redemption.originalAmount).toFixed(2)}\n` +
          `🔻 Descuento: -$${Number(redemption.discountAmount).toFixed(2)}\n` +
          `💳 Total a pagar: $${Number(redemption.finalAmount).toFixed(2)}`
        );
        this.shouldScroll = true;
        break;

      case 'BUY_X_GET_Y':
        this.sendBotMessage(
          `✅ ${redemption.campaignTitle || 'Promoción 2x1 aplicada'}\n` +
          `${redemption.discountDescription || ''}\n\n` +
          `💰 Total original: $${Number(redemption.originalAmount).toFixed(2)}\n` +
          `🔻 Ahorro: -$${Number(redemption.discountAmount).toFixed(2)}\n` +
          `💳 Total a pagar: $${Number(redemption.finalAmount).toFixed(2)}`
        );
        this.shouldScroll = true;
        break;

      case 'FREE_PRODUCT':
        this.sendBotMessage(
          `✅ ${redemption.campaignTitle || 'Producto gratis'}\n` +
          `${redemption.discountDescription || ''}\n\n` +
          `💰 Total original: $${Number(redemption.originalAmount).toFixed(2)}\n` +
          `🔻 Producto gratis: -$${Number(redemption.discountAmount).toFixed(2)}\n` +
          `💳 Total a pagar: $${Number(redemption.finalAmount).toFixed(2)}`
        );
        this.shouldScroll = true;
        break;

      default:
        // Caso genérico para cualquier otro tipo de cupón
        this.sendBotMessage(
          `✅ ${redemption.campaignTitle || 'Cupón redimido exitosamente'}\n` +
          `${redemption.discountDescription || redemption.message || ''}\n\n` +
          `💰 Total original: $${Number(redemption.originalAmount).toFixed(2)}\n` +
          `🔻 Descuento: -$${Number(redemption.discountAmount).toFixed(2)}\n` +
          `💳 Total a pagar: $${Number(redemption.finalAmount).toFixed(2)}`
        );
        this.shouldScroll = true;
    }
  }

  private createOrder(): void {
    this.state.isLoading = true;
    this.sendBotMessage(LEALBOT_MESSAGES.LOADING_ORDER.text);

    // Preparar items de la orden
    const items: OrderItem[] = this.state.cart.map(item => ({
      productId: item.productId,
      cantidad: item.quantity,
      precioUnitario: item.price,
      comentarios: item.comments
    }));

    const request: CreateOrderRequest = {
      tenantId: this.tenantId,
      sessionId: this.state.sessionId,
      customerId: this.state.customer?.id || undefined,
      customerName: this.state.customer?.name,
      customerEmail: this.state.customer?.email,
      customerPhone: this.state.customer?.phone,
      items: items,
      // Solo enviar couponCode si fue aplicado pero aún no redimido
      couponCode: !this.state.redeemedCoupon ? this.state.appliedCoupon?.couponCode : undefined,
      subtotal: this.state.subtotal,
      descuento: this.state.discount,
      totalFinal: this.state.total,
      source: 'CHATBOT'
    };

    this.lealbotService
      .createOrder(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.state.isLoading = false;
          if (response.object) {
            this.conversationState = ConversationState.ORDER_CONFIRMED;
            this.sendBotMessage(LEALBOT_MESSAGES.ORDER_CONFIRMED.text(response.object.id));
            this.currentQuickReplies = LEALBOT_MESSAGES.ORDER_CONFIRMED.quick_reply || [];
            this.state.cart = []; // Limpiar carrito
            this.shouldScroll = true;
          }
        },
        error: (error) => {
          this.state.isLoading = false;
          this.handleApiError(error);
        }
      });
  }

  private closeChat(): void {
    this.state.isOpen = false;
    this.convertationState = ConversationState.ABANDONED;
    if (this.state.sessionId && this.state.cart.length > 0) {
      this.abandonSession();
    }
  }

  private abandonSession(): void {
    this.lealbotService
      .abandonSession(this.state.sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Sesión abandonada:', this.state.sessionId);
        },
        error: (error) => {
          console.error('Error al abandonar sesión:', error);
        }
      });
  }

  /**
   * ============ UTILIDADES ============
   */

  private addMessageToChat(sender: 'USER' | 'BOT' | 'SYSTEM', content: string): void {
    this.state.messages.push({
      sender,
      messageType: 'TEXT',
      content,
      timestamp: new Date().toISOString(),
      isLoading: false
    });
  }

  private sendBotMessage(content: string): void {
    this.addMessageToChat('BOT', content);
    this.shouldScroll = true;
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer && this.messagesContainer.nativeElement) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (error) {
      console.error('Error al hacer scroll:', error);
    }
  }

  private handleApiError(error: Error): void {
    console.error('Error de API:', error.message);
    this.state.error = error.message;
    this.sendBotMessage(
      `❌ ${error.message || LEALBOT_MESSAGES.ERROR_GENERIC.text}`
    );
    this.currentQuickReplies = LEALBOT_MESSAGES.ERROR_GENERIC.quick_reply || [];
    this.shouldScroll = true;
  }

  // Getter para compatibilidad de tipos (typo en closeChat)
  private set convertationState(state: ConversationState) {
    this.conversationState = state;
  }
}
