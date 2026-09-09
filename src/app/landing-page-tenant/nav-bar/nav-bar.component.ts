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

  @Input() logoUrl: string = '';
  @Input() bussinessName: string = '';
  @Input() since: string = '';
  @Input() story: string = '';
  @Input() vision: string = '';
  @Input() hasPromotions: boolean = false;

  scrollToMenu(event: Event) {
    event.preventDefault();
    const menu = document.querySelector('#menu');
    if (menu) {
      menu.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToOffer(event: Event) {
    event.preventDefault();
    const offer = document.querySelector('#rewards');
    if (offer) {
      offer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToPromociones(event: Event) {
    event.preventDefault();
    if (!this.hasPromotions) return;
    const promociones = document.querySelector('#promotions');
    if (promociones) {
      promociones.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToSection(id: string, event: Event) {
    event.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToFooter(event: Event) {
    event.preventDefault();
    const footer = document.querySelector('app-footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
