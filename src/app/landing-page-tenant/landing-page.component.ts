import { Component, HostListener, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { AboutComponent } from './about/about.component';
import { OfferComponent } from './offer/offer.component';
import { MenuComponent } from './menu/menu.component';
import { FooterComponent } from './footer/footer.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantLandingPageService } from '../services/tenant-landing-page.service';
import { ProductsMenuService } from '../services/products-menu.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    NavBarComponent,
    AboutComponent,
    OfferComponent,
    MenuComponent,
    FooterComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageTenantComponent implements OnInit, OnDestroy {
  navBarData = {
    logoUrl: '../../../../assets/img/lealtix_logo_transp.png',
    bussinessName: 'Cafe con Amor',
    since: 'Desde 1990'
  };
  aboutData = {
    since: 'Desde 1990',
    story: 'Nacimos con una idea sencilla: <br> crear un lugar donde cada taza de café contara una historia. Inspirados en la tradición del buen café artesanal, abrimos nuestra cafetería para ofrecer un espacio cálido, donde el aroma, el sabor y la compañía se disfrutan sin prisas.<br>Hoy, seguimos con la misma pasión: servir café de calidad y momentos que se vuelven recuerdos. ☕✨',
    vision: 'Ser la cafetería preferida de nuestra comunidad, reconocida por ofrecer experiencias únicas en cada visita. Queremos inspirar momentos de conexión auténtica, impulsados por el aroma de un buen café, un servicio cercano y un ambiente que invite a quedarse.'
  };
  footerData = {
    dir: 'Empedrado, Paseo Arboleda, San Mateo Otzacatipan Toluca Estado de Mexico',
    tel: '55 76655444',
    bussinesEmail: 'caffe@example.com',
    twiter: '#',
    facebook: '#',
    linkedin: '#',
    instagram: '#',
    tiktok: '#',
    schelules: 'Lunes a Viernes de 8:00 a 20:00 Hrs.\nSabados y Domingos de 9:00 a 18:00 Hrs.'
  };
  menuCategorias = [
    {
      nombre: 'Bebidas',
      productos: [
        {
          precio: '$45',
          img: '',
          prod: 'Capuchino',
          descProd: 'Café cremoso con espuma de leche, ideal para empezar el día.'
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
        }
      ]
    }
  ];
  tenantId: number = 0;

  constructor(private renderer: Renderer2,
              private route: ActivatedRoute,
              private router: Router,
              private tenantLandingPageService: TenantLandingPageService,
              private productsMenuService: ProductsMenuService,
              private titleService: Title
  ) {}
  // Para mostrar u ocultar el botón Back to Top
  showBackToTop = false;

  ngOnInit() {
    this.renderer.addClass(document.body, 'crema-bg');
    const slug = this.route.snapshot.queryParamMap.get('token');
    if (slug) {
      this.tenantLandingPageService.getDatosPorSlug(slug).subscribe( {
        next: (data: any) => {
          debugger
          this.tenantId = data.object?.tenant?.id
          this.navBarData = {
            logoUrl: data.object?.tenant?.logoUrl || '../../../../assets/img/lealtix_logo_transp.png',
            bussinessName: data.object?.tenant?.nombreNegocio ||  '',
            since: data.object?.tenant?.slogan || ''
          };
          this.aboutData = {
            since: data.object?.tenant?.slogan || '',
            story: data.object?.tenantConfig?.history || '',
            vision: data.object?.tenantConfig?.vision || ''
          };
          this.footerData = {
            dir: data.object?.tenant?.direccion || '',
            tel: data.object?.tenant?.telefono || '',
            bussinesEmail: data.object?.user.email || '',
            twiter: data.object?.tenantConfig?.twitter || '#',
            facebook: data.object?.tenantConfig?.facebook || '#',
            linkedin: data.object?.tenantConfig?.linkedin || '#',
            instagram: data.object?.tenantConfig?.instagram || '#',
            tiktok: data.object?.tenantConfig?.tiktok || '#',
            schelules: data.object?.tenant?.schedules || ''
          }

          // Actualizar el title y favicon de la página
          this.updatePageTitleAndFavicon();

          // Cargar menú de productos para el tenant obtenido
          if (this.tenantId && this.tenantId > 0) {
            this.getProductsMenuByTenantId();
          }
        },
        error: (err: any) => {
          // Si hay un error (por ejemplo, slug no válido), redirige a la página de error
          console.error('Error al cargar los datos del tenant:', err);
          this.router.navigate(['/error']);
        }
      });
    }
  }

  getProductsMenuByTenantId() {
    this.productsMenuService.getProductsByTenantId(this.tenantId).subscribe({
      next: (data: any) => {
        console.log('Datos del menú de productos:', data);
        this.menuCategorias = this.mapProductsToMenuCategorias(data.object || []);
      },
      error: (err: any) => {
        console.error('Error al cargar el menú de productos:', err);
      }
    });
  }

  private mapProductsToMenuCategorias(products: any[]) {
    if (!Array.isArray(products)) return [];

    const categoriasMap: { [key: string]: any } = {};

    products.forEach(p => {
      if (p && p.isActive === false) {
        return;
      }

      if (p && p.categoryIsActive === false) {
        return;
      }

      const catName = p.categoryName || 'Sin categoría';
      if (!categoriasMap[catName]) {
        categoriasMap[catName] = {
          nombre: catName,
          productos: [] as any[]
        };
      }

      categoriasMap[catName].productos.push({
        precio: p.price != null ? `$${p.price}` : '$0',
        img: this.getOptimizedImage(p.imageUrl) || '',
        prod: p.name || '',
        descProd: p.description || ''
      });
    });

    // Convertir map a array y filtrar categorías sin productos (por si todos los productos fueron omitidos)
    return Object.keys(categoriasMap)
      .map(k => categoriasMap[k])
      .filter((cat: any) => Array.isArray(cat.productos) && cat.productos.length > 0);
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'crema-bg');
  }

  getOptimizedImage(url: string): string {
    if (!url) return '';
    return url.replace('/upload/', '/upload/w_266,h_110,c_limit,f_auto,q_auto/');
  }

  /**
   * Convierte la URL del logo de Cloudinary en una URL de favicon (32x32, PNG)
   */
  convertLogoToFavicon(logoUrl: string): string {
    if (!logoUrl || !logoUrl.includes('cloudinary.com')) {
      return logoUrl;
    }
    // Reemplazar /upload/ por /upload/w_32,h_32,c_fill,f_png/
    // Si el logo tiene fondo blanco puedes usar c_pad,b_white en lugar de c_fill
    return logoUrl.replace('/upload/', '/upload/w_32,h_32,c_fill,f_png/');
  }

  /**
   * Actualiza el título de la página y el favicon dinámicamente
   */
  updatePageTitleAndFavicon() {
    const businessName = this.navBarData.bussinessName || 'Lealtix';
    const logoUrl = this.navBarData.logoUrl;

    console.log('Actualizando title con:', businessName);
    console.log('Actualizando favicon con:', logoUrl);

    // Actualizar el título de la página
    this.titleService.setTitle(businessName);

    // Actualizar el favicon
    if (logoUrl) {
      const faviconUrl = this.convertLogoToFavicon(logoUrl);
      console.log('Favicon URL generada:', faviconUrl);
      const linkId = 'appFavicon';
      let link = document.getElementById(linkId) as HTMLLinkElement;

      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'icon';
        document.head.appendChild(link);
      }

      link.href = faviconUrl;
    }
  }


  // Detecta scroll
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showBackToTop = window.scrollY > 300;
  }

  // Scroll hacia arriba
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

