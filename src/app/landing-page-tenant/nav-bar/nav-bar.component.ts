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
}
