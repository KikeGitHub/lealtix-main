import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  imports: [CommonModule]
})
export class FooterComponent {
  dir: string = 'Empedrado, Paseo Arboleda, San Mateo Otzacatipan Toluca Estado de Mexico';
  tel: string = '55 76655444';
  bussinesEmail: string = 'caffe@example.com';
  twiter: string = '#x';
  facebook: string = '#fb';
  linkedin: string = 'dirlinkedin';
  instagram: string = 'instagram';
  schelules: { day: string, hours: string }[] = [
    { day: 'Lunes - viernes', hours: '8.00 AM - 8.00 PM' },
    { day: 'Sabados - Domingos', hours: '2.00 PM - 8.00 PM' }
  ];
}
