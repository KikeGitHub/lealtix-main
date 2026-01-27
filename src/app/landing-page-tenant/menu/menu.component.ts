import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  imports: [CommonModule]
})
export class MenuComponent {
  @Input() defaultImg = '';
  @Input() menuCategorias: any[] = [];
  // Calcula el número de columnas según la cantidad de productos
  getColumnCount(productos: any[]): number {
    const count = productos.length;
    if (count > 10) return 3;
    if (count > 5) return 2;
    return 1;
  }

  // Divide los productos en subgrupos para cada columna
  splitProductos(productos: any[]): any[][] {
    const cols = this.getColumnCount(productos);
    const perCol = Math.ceil(productos.length / cols);
    const result = [];
    for (let i = 0; i < cols; i++) {
      result.push(productos.slice(i * perCol, (i + 1) * perCol));
    }
    return result;
  }

  // Devuelve la clase de columna bootstrap según la cantidad de columnas
  getColClass(productos: any[]): string {
    const cols = this.getColumnCount(productos);
    if (cols === 1) return 'col-12';
    if (cols === 2) return 'col-12 col-md-6';
    // 3 columns: full width on xs, two on md, three on lg
    return 'col-12 col-md-6 col-lg-4';
  }
}
