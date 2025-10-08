import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  imports: [CommonModule]
})
export class MenuComponent {
  defaultImg = '../../../assets/img/lealtix_logo_transp.png';
  menuCategorias = [
    {
      nombre: 'Bebidas',
      productos: [
        {
          precio: '$45',
          img: '',
          prod: 'Capuchino',
          descProd: 'Café cremoso con espuma de leche, ideal para empezar el día.'
        },
        {
          precio: '$40',
          img: '',
          prod: 'Chocolate caliente',
          descProd: 'Tradicional chocolate mexicano espumoso, preparado al momento.'
        },
        {
          precio: '$35',
          img: '',
          prod: 'Jugo de Naranja',
          descProd: 'Jugo natural recién exprimido, lleno de energía y frescura.'
        }
      ]
    },
    {
      nombre: 'Desayunos',
      productos: [
        {
          precio: '$95',
          img: '',
          prod: 'Chilaquiles verdes',
          descProd: 'Totopos bañados en salsa verde, servidos con crema, queso y cebolla.'
        },
        {
          precio: '$110',
          img: '',
          prod: 'Enchiladas rojas',
          descProd: 'Tortillas rellenas de pollo bañadas en salsa roja, acompañadas de arroz.'
        },
        {
          precio: '$85',
          img: '',
          prod: 'Huevos al gusto',
          descProd: 'Acompañados con frijoles refritos y pan artesanal.'
        }
      ]
    }
    ,
    {
      nombre: 'Postres',
      productos: [
        {
          precio: '$55',
          img: '',
          prod: 'Pastel de chocolate',
          descProd: 'Pastel húmedo de chocolate con cobertura de ganache.'
        },
        {
          precio: '$40',
          img: '',
          prod: 'Flan napolitano',
          descProd: 'Flan cremoso con caramelo y toque de vainilla.'
        },
        {
          precio: '$35',
          img: '',
          prod: 'Gelatina de mosaico',
          descProd: 'Colorida gelatina de sabores surtidos en cubos.'
        },
        {
          precio: '$60',
          img: '',
          prod: 'Cheesecake',
          descProd: 'Tarta de queso con base de galleta y mermelada de frutos rojos.'
        },
        {
          precio: '$30',
          img: '',
          prod: 'Arroz con leche',
          descProd: 'Postre tradicional con canela y leche condensada.'
        }
      ]
    }
    ,
    {
      nombre: 'Cervezas',
      productos: [
        {
          precio: '$50',
          img: '',
          prod: 'Corona',
          descProd: 'Cerveza clara mexicana, refrescante y ligera.'
        },
        {
          precio: '$55',
          img: '',
          prod: 'Modelo Especial',
          descProd: 'Cerveza tipo pilsner, suave y con buen cuerpo.'
        },
        {
          precio: '$60',
          img: '',
          prod: 'Negra Modelo',
          descProd: 'Cerveza oscura con notas a caramelo y malta.'
        }
      ]
    }
  ];
}
