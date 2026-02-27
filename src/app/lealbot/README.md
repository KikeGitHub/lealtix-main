# 🤖 Lealbot Component - Mesero Virtual

## Descripción

**Lealbot** es un componente Angular completo que implementa un chatbot inteligente (Mesero Virtual) para la plataforma Lealtix. Transforma las ventas en relaciones mediante una toma de pedidos personalizada, siguiendo la filosofía de los **3 Toques**: priorizando interacciones fluidas con botones de respuesta rápida.

### Características Principales

✅ **Identificación Inteligente**: Valida clientes existentes y registra nuevos automáticamente  
✅ **Multiplicidad de Canales**: Soporta teléfono, email y contacto mixto  
✅ **Venta Cruzada Automática**: Sugiere productos complementarios basados en historial  
✅ **Gestión de Cupones**: Validación y aplicación de códigos promocionales  
✅ **Carrito Dinámico**: Manage items con comentarios personalizados (ej: "sin cebolla")  
✅ **Flujo Conversacional Completo**: Desde registro hasta confirmación de orden  
✅ **Responsive Design**: Funciona perfectamente en mobile, tablet y desktop  
✅ **Accesibilidad**: Soporta dark mode y cumple con WCAG 2.1  
✅ **Estado Persistente**: Gestión de sesiones con abandonos controlados  

---

## 📁 Estructura de Archivos

```
src/app/lealbot/
├── services/
│   └── lealbot.service.ts           # Servicio para consumir API ChatBot
├── models/
│   └── lealbot.models.ts            # Interfaces y tipos
├── lealbot-messages.ts              # Diálogos y textos centralizados
├── lealbot.component.ts             # Lógica principal del componente
├── lealbot.component.html           # Template
├── lealbot.component.scss           # Estilos
└── README.md                        # Esta documentación
```

---

## 🚀 Instalación e Integración

### 1️⃣ Imports Necesarios

El componente es **standalone**, así que puedes importarlo directamente en tu módulo o componente:

```typescript
// En tu app.component.ts o módulo
import { LealbotComponent } from './lealbot/lealbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    // Otros imports...
    LealbotComponent
  ],
  template: `
    <app-lealbot [tenantId]="1"></app-lealbot>
  `
})
export class AppComponent {}
```

### 2️⃣ Configuración en app.config.ts (Si aplica)

```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { LealbotService } from './lealbot/services/lealbot.service';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(HttpClientModule),
    LealbotService
  ]
};
```

### 3️⃣ Uso en Template

```html
<!-- Usar el componente en cualquier página -->
<app-lealbot [tenantId]="tenantId"></app-lealbot>
```

**Props disponibles:**
- `@Input() tenantId: number = 1` - ID del tenant (requerido para las API calls)

---

## 🔗 API Endpoints Integrados

El servicio consume los siguientes endpoints de `http://localhost:8080/api/chatbot`:

| # | Método | Endpoint | Descripción |
|---|--------|----------|-------------|
| 1 | POST | `/validate-customer` | Valida cliente por teléfono/email |
| 2 | POST | `/register-customer` | Registra nuevo cliente |
| 3 | GET | `/customer/{id}/last-order` | Obtiene "lo de siempre" |
| 4 | GET | `/product/{id}/cross-sell` | Obtiene sugerencias |
| 5 | POST | `/validate-coupon` | Valida cupón |
| 6 | POST | `/create-order` | Crea orden |
| 7 | GET | `/session/{id}/messages` | Historial de mensajes |
| 8 | POST | `/session/{id}/abandon` | Marca sesión como abandonada |

---

## 💬 Flujo de Conversación

### Escenario 1: Cliente Recurrente

```
Bot: ¡Hola! Soy Lealbot ☕. ...
        ↓
User: +34 600 123 456  [teléfono validado]
        ↓
Bot: ¡Hola Juan! 👋 Vi que hace poco pediste Pizza Margarita. ¿Lo de siempre?
        ↓ [Usuario confirma]
        ↓
Bot: ¡Buen choice! Pizza combina con... ¿Te gustaría Coca-Cola?
        ↓
Bot: 📋 Resumen: Subtotal €27.50 | Descuento €0 | Total €27.50
        ↓ [Usuario confirma]
        ↓
Bot: ¡Pedido confirmado! 🎉 Tu orden está en la cocina.
```

### Escenario 2: Cliente Nuevo

```
Bot: ¡Hola! ¿Me das tu teléfono o email?
        ↓
User: +34 600 999 888  [no existe]
        ↓
Bot: ¡Bienvenido! ¿Cómo te llamas?
        ↓
User: María García
        ↓
Bot: ¿Cuál es tu email? (opcional)
        ↓
Bot: ¡Registrado! 🎊 Bienvenida María...
        ↓
Bot: ¿Qué te apetece hoy? [Categorías]
        ↓ [Flujo normal de selección]
```

---

## 🎨 Personalización

### Cambiar Colores Principales

En `lealbot.component.scss`, busca:

```scss
// Cambiar gradiente del botón y header
.lealbot-floating-button button,
.lealbot-header {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

// Cambiar a tu color corporativo (ej: #ff6b6b)
background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
```

### Personalizar Mensajes

Todos los diálogos están en `lealbot-messages.ts`:

```typescript
export const LEALBOT_MESSAGES = {
  GREETING_INITIAL: {
    text: 'Tu mensaje personalizado',
    quick_reply: [...]
  }
  // ...
};
```

### Añadir Nuevas Categorías de Productos

En el método `browseMenu()` del componente, reemplaza:

```typescript
private browseMenu(): void {
  // ...
  this.currentQuickReplies = [
    { label: '🍕 Pizzas', value: 'category_pizzas' },
    { label: '☕ Desayunos', value: 'category_breakfast' },
    // Añade más categorías aquí...
  ];
}
```

---

## 🔧 Configuración de Ambiente

### Desarrollo

```typescript
// En lealbot.service.ts, actualiza la BASE_URL
private readonly BASE_URL = 'http://localhost:8080/api/chatbot';
```

### Producción

```typescript
// Usar variable de entorno
private readonly BASE_URL = environment.chatbotApiUrl;
```

---

## 📊 Estados de Conversación

El componente maneja 10 estados principales:

```typescript
enum ConversationState {
  INITIAL = 'INITIAL',                    // Mensaje inicial
  WAITING_CONTACT = 'WAITING_CONTACT',   // Pidiendo teléfono/email
  CUSTOMER_IDENTIFIED = 'CUSTOMER_IDENTIFIED', // Cliente validado
  CUSTOMER_NEW = 'CUSTOMER_NEW',         // Nuevo cliente
  BROWSING = 'BROWSING',                 // Viendo catálogo
  PRODUCT_SELECTED = 'PRODUCT_SELECTED', // Producto añadido
  CROSS_SELL = 'CROSS_SELL',             // Sugiriendo complementos
  COUPON_VALIDATION = 'COUPON_VALIDATION', // Validando cupón
  REVIEW_ORDER = 'REVIEW_ORDER',         // Resumen de orden
  ORDER_CONFIRMED = 'ORDER_CONFIRMED'    // Orden completada
}
```

---

## 🚨 Manejo de Errores

El componente captura y muestra amigablemente:

- ❌ Errores de conexión
- ❌ Validaciones fallidas
- ❌ Timeouts (10 segundos)
- ❌ Errores del servidor (400, 500)

Cada error muestra un mensaje contextual y opciones para reintentar.

---

## 📱 Responsive Design

- **Desktop**: Ventana de 384px × 600px
- **Tablet**: Adapta al 50-80% del viewport
- **Mobile**: Ocupa casi toda la pantalla (con márgenes)

---

## ♿ Accesibilidad

✅ Cumple con WCAG 2.1 AA  
✅ Soporta navegación por teclado  
✅ Announces para lectores de pantalla (aria-labels)  
✅ Dark mode automático  
✅ Respeta `prefers-reduced-motion`  

---

## 🐛 Debugging

Habilita logs en la consola del navegador:

```typescript
// En lealbot.component.ts
console.log('🚀 Sesión iniciada:', this.state.sessionId);
console.log('📨 Mensaje enviado:', message);
```

O revisa la red en DevTools → Network para ver requests a la API.

---

## 📋 Checklist de Integración

Antes de deployer a producción:

- [ ] Tenantid correctamente configurado
- [ ] Base URL de API apunta al servidor correcto
- [ ] HttpClientModule importado en la aplicación
- [ ] PrimeNG instalado (`npm install primeng`)
- [ ] Tailwind CSS configurado
- [ ] Estilos SCSS compilando sin errores
- [ ] Pruebas E2E del flujo completo
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Mobile testing en dispositivos reales
- [ ] Mensajes personalizados para tu negocio
- [ ] Colores de marca actualizados

---

## 🤝 Dependencias

```json
{
  "@angular/core": "^17.0.0",
  "@angular/common": "^17.0.0",
  "@angular/forms": "^17.0.0",
  "primeng": "^17.0.0",
  "primeicons": "^17.0.0"
}
```

---

## 📚 Documentación Relacionada

- [API ChatBot Completa](./docs/chatbot-api.md)
- [Modelos de Datos](./models/lealbot.models.ts)
- [Mensajes Disponibles](./lealbot-messages.ts)
- [Servicio API](./services/lealbot.service.ts)

---

## 🎯 Próximas Mejoras

📌 Soporte para múltiples idiomas (i18n)  
📌 Integración con carrito persistente  
📌 Analytics y tracking de conversaciones  
📌 Notificaciones push para órdenes  
📌 Integración con WhatsApp Business  
📌 Recomendaciones con ML  
📌 Historial de conversaciones guardado  

---

## 💡 Tips y Buenas Prácticas

### 1. Session Management
El sessionId se genera automáticamente (UUID v4). Se mantiene durante toda la conversación y se abandona si el usuario cierra el chat sin completar la orden.

### 2. Errores de Validación
Utiliza los helpers del servicio:
```typescript
service.isValidEmail(email)    // → boolean
service.isValidPhone(phone)    // → boolean
service.detectContactType(str) // → 'email' | 'phone' | null
```

### 3. Performance
- Las imágenes de productos deben optimizarse (WebP)
- Los requests tienen timeout de 10s
- Los mensajes son virtualizados para listas largas

### 4. Seguridad
- Nunca exponga datos sensibles en console.log
- Valida siempre en servidor, no solo en cliente
- CORS debe estar configurado correctamente en backend

---

## 📞 Soporte

Para problemas, consulta:
1. Console del navegador (F12)
2. Network tab para ver requests fallidos
3. Logs del servidor backend
4. Issues en el repositorio

---

**© 2026 Lealtix - Transformando Ventas en Relaciones** ☕
