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

  selectedCategory: string = 'Todos';

  // Retorna los productos para una columna específica
  productosPorColumna(categoriaIdx: number, columnIdx: number): any[] {
    const filteredCategories = this.getFilteredCategories();
    if (!filteredCategories[categoriaIdx]) return [];
    const productos = filteredCategories[categoriaIdx].productos || [];
    const itemsPerCol = Math.ceil(productos.length / 2);
    const start = columnIdx * itemsPerCol;
    return productos.slice(start, start + itemsPerCol);
  }

  getFilteredCategories(): any[] {
    if (this.selectedCategory === 'Todos') {
      return this.menuCategorias;
    }
    return this.menuCategorias.filter(cat => cat.nombre === this.selectedCategory);
  }

  selectCategory(categoryName: string): void {
    this.selectedCategory = categoryName;
  }

  getCategoryNames(): string[] {
    // Get unique category names to avoid duplicates
    const uniqueNames = [...new Set(this.menuCategorias.map(cat => cat.nombre))];
    return ['Todos', ...uniqueNames];
  }
}
