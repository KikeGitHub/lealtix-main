import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class NavBarComponent {

  // NavBar data
  @Input() logoUrl: string = '';
  private _bussinessName: string = '';
  @Input()
  set bussinessName(v: string) {
    this._bussinessName = v;
    console.log('[NavBar] bussinessName set ->', v);
  }
  get bussinessName(): string {
    return this._bussinessName;
  }
  @Input() since: string = '';
  @Input() hasPromotions: boolean = false;

  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  scrollToNavbar(event: Event) {
    event.preventDefault();
    const navbar = document.querySelector('.nav-bar');
    if (navbar) {
      navbar.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToAbout(event: Event) {
    event.preventDefault();
    const about = document.querySelector('.about-section');
    if (about) {
      about.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToMenu(event: Event) {
    event.preventDefault();
    const menu = document.querySelector('#menu');
    if (menu) {
      menu.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToOffer(event: Event) {
    event.preventDefault();
    const offer = document.querySelector('#offer');
    if (offer) {
      offer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToPromociones(event: Event) {
    event.preventDefault();
    if (!this.hasPromotions) return; // do nothing if there are no promotions
    const promociones = document.querySelector('#promociones');
    if (promociones) {
      promociones.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToFooter(event: Event) {
    event.preventDefault();
    const footer = document.querySelector('#footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Valida si la URL del logo es una cadena no vacía y parece una URL/ruta válida.
   * Acepta URLs absolutas (http(s)://), data: y rutas relativas como /assets/...
   */
  isValidLogo(url?: string): boolean {
    if (!url) return false;
    const v = url.trim();
    if (!v) return false;

    // Intenta construir URL absoluta
    try {
      // new URL() acepta URLs absolutas; si es relativa fallará y seguiremos con otras comprobaciones
      // eslint-disable-next-line no-new
      new URL(v);
      return true;
    } catch (e) {
      // not absolute, allow common relative patterns: /path, ./path, ../path, assets/... etc.
      if (/^(\/|\.\/|\.\.\/)/.test(v)) return true;
      if (/^[a-zA-Z0-9_\-]+\//.test(v)) return true;
      // allow data URI
      if (v.startsWith('data:')) return true;
      return false;
    }
  }
}
