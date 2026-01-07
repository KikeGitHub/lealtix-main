/**
 * Constantes de configuración de Lealtix
 * Información centralizada para reutilizar en toda la aplicación
 */

export class LealtixConfig {
  // Información de contacto de Lealtix
  static readonly CONTACT_EMAIL = 'contacto@lealtix.com.mx';
  static readonly SUPPORT_EMAIL = 'soporte@lealtix.com.mx';
  static readonly COMPANY_NAME = 'Lealtix';

  // URLs públicas
  static readonly PRIVACY_URL = '/privacy';
  static readonly TERMS_URL = '/terms'; // Para futuro uso

  // Microcopys reutilizables
  static readonly PRIVACY_MICROCOPY = {
    REGISTRATION_CONSENT: 'Al registrarte aceptas recibir promociones del negocio. Tus datos están protegidos y no se comparten con terceros.',
    REGISTRATION_CONSENT_SHORT: 'Tus datos están protegidos y no se comparten con terceros.',
    DATA_PROTECTION: 'Lealtix no vende, renta ni comparte datos personales con terceros.',
    PRIVACY_LINK_TEXT: 'Ver Aviso de Privacidad completo',
    PRIVACY_AGREEMENT: 'Al continuar, aceptas nuestro Aviso de Privacidad y el uso de tus datos para programas de lealtad.',
    COUPON_USAGE_NOTICE: 'Al canjear este cupón, aceptas que se registre tu uso para mejorar las promociones futuras.',
  };

  // Textos legales
  static readonly LEGAL_TEXTS = {
    DATA_COLLECTED: 'Datos que recabamos: nombre, teléfono, email y uso de cupones.',
    DATA_PURPOSE: 'Finalidad: programas de lealtad, promociones y métricas.',
    ARCO_RIGHTS: 'Tienes derechos ARCO (Acceso, Rectificación, Cancelación y Oposición).',
    CONTACT_FOR_RIGHTS: `Para ejercer tus derechos, contacta: ${LealtixConfig.CONTACT_EMAIL}`,
  };

  // Configuración de privacidad
  static readonly PRIVACY_POLICY = {
    LAST_UPDATE: '6 de enero de 2026',
    VERSION: '1.0',
    LAW: 'LFPDPPP',
    COUNTRY: 'México',
  };
}

/**
 * Helper para generar mensajes de consentimiento personalizados
 */
export class PrivacyHelpers {
  /**
   * Genera un mensaje de consentimiento para formularios de registro
   * @param businessName Nombre del negocio afiliado
   * @param includePrivacyLink Si debe incluir el link al aviso completo
   */
  static getRegistrationConsent(businessName?: string, includePrivacyLink: boolean = false): string {
    const baseMessage = businessName
      ? `Al registrarte aceptas recibir promociones de ${businessName}. Tus datos están protegidos y no se comparten con terceros.`
      : LealtixConfig.PRIVACY_MICROCOPY.REGISTRATION_CONSENT;

    if (includePrivacyLink) {
      return `${baseMessage} <a href="${LealtixConfig.PRIVACY_URL}" target="_blank">${LealtixConfig.PRIVACY_MICROCOPY.PRIVACY_LINK_TEXT}</a>`;
    }

    return baseMessage;
  }

  /**
   * Genera el link HTML para el aviso de privacidad
   */
  static getPrivacyLink(className: string = 'privacy-link'): string {
    return `<a href="${LealtixConfig.PRIVACY_URL}" class="${className}" target="_blank">Aviso de Privacidad</a>`;
  }

  /**
   * Genera un footer de privacidad con todos los elementos
   */
  static getPrivacyFooter(): string {
    return `
      <div class="privacy-footer">
        <p>${LealtixConfig.PRIVACY_MICROCOPY.DATA_PROTECTION}</p>
        <p>${LealtixConfig.LEGAL_TEXTS.ARCO_RIGHTS}</p>
        <p>Contacto: <a href="mailto:${LealtixConfig.CONTACT_EMAIL}">${LealtixConfig.CONTACT_EMAIL}</a></p>
        <a href="${LealtixConfig.PRIVACY_URL}">Ver Aviso de Privacidad completo</a>
      </div>
    `;
  }
}
