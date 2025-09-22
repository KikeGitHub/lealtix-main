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

  @Input() imageUrl: string = '../../../../public/assets/img/carousel-2.jpg';
  @Input() title: string = 'Café Mexicano';
  @Input() subtitle: string = 'Estamos para servir';
  @Input() since: string = '* Desde 1990 *';

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

  scrollToFooter(event: Event) {
    event.preventDefault();
    const footer = document.querySelector('#footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
