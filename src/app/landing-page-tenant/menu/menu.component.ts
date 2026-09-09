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

  // Aplana los productos de las categorías filtradas para el grid de tarjetas
  getFilteredProducts(): any[] {
    const products: any[] = [];
    this.getFilteredCategories().forEach(cat => {
      (cat.productos || []).forEach((p: any) => products.push(p));
    });
    return products;
  }

  // Imagen local para productos específicos; el resto usa la del backend
  productImage(product: any): string {
    const name = product?.prod ? String(product.prod).toLowerCase() : '';
    if (name.includes('chila')) {
      return '/assets/img/chilaquiles.png';
    }
    if (name.includes('huevos')) {
      return '/assets/img/huevos.png';
    }
    if (name.includes('molletes')) {
      return '/assets/img/molletes.png';
    }
    if (name.includes('arroz')) {
      return '/assets/img/arroz-con-leche.png';
    }
    if (name.includes('cheese') || name.includes('pay de queso')) {
      return '/assets/img/pay-queso.png';
    }
    return product?.img || '';
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
