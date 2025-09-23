import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  imports: [CommonModule]
})
export class AboutComponent {
  since: string = 'Atendiendo desde 1990';
  story: string = `Nacimos con una idea sencilla: <br> crear un lugar donde cada taza de café contara una historia. Inspirados en la tradición del buen café artesanal, abrimos nuestra cafetería para ofrecer un espacio cálido, donde el aroma, el sabor y la compañía se disfrutan sin prisas.<br>Hoy, seguimos con la misma pasión: servir café de calidad y momentos que se vuelven recuerdos. ☕✨`;
  vision: string = 'Ser la cafetería preferida de nuestra comunidad, reconocida por ofrecer experiencias únicas en cada visita. Queremos inspirar momentos de conexión auténtica, impulsados por el aroma de un buen café, un servicio cercano y un ambiente que invite a quedarse.';
  listVision: string[] = [
    'Calidad en cada taza',
    'Conexión con la comunidad',
    'Experiencia memorable'
  ];
}
