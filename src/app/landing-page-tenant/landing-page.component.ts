import { Component, HostListener, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { AboutComponent } from './about/about.component';
import { OfferComponent } from './offer/offer.component';
import { MenuComponent } from './menu/menu.component';
import { FooterComponent } from './footer/footer.component';
import { ActivatedRoute, Router } from '@angular/router';

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
  tenantLandingPageService: any;
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
    twiter: '#x',
    facebook: '#fb',
    linkedin: '#in',
    instagram: '#in',
    tiktok: '#tt',
    schelules: 'Lunes a Viernes de 8:00 a 20:00 Hrs.\nSabados y Domingos de 9:00 a 18:00 Hrs.'
  };

  constructor(private renderer: Renderer2,
              private route: ActivatedRoute,
              private router: Router
  ) {}
  // Para mostrar u ocultar el botón Back to Top
  showBackToTop = false;

  ngOnInit() {
    debugger;
    this.renderer.addClass(document.body, 'crema-bg');
    const slug = this.route.snapshot.queryParamMap.get('token');
    if (slug) {
      this.tenantLandingPageService.getDatosPorSlug(slug).subscribe( {
        next: (data: any) => {
          // Aquí asignas los datos recibidos a tus variables
          this.navBarData = {
            logoUrl: data.object?.tenant?.logoUrl || '../../../../assets/img/lealtix_logo_transp.png',
            bussinessName: data.bussinessName || 'Cafe con Amor',
            since: data.object?.tenant?.slogan || 'Desde 1990'
          };
          this.aboutData = {
            since: data.object?.tenant?.slogan || 'Desde 1990',
            story: data.object?.tenantConfig?.history || 'Nacimos con una idea sencilla: <br> crear un lugar donde cada taza de café contara una historia. Inspirados en la tradición del buen café artesanal, abrimos nuestra cafetería para ofrecer un espacio cálido, donde el aroma, el sabor y la compañía se disfrutan sin prisas.<br>Hoy, seguimos con la misma pasión: servir café de calidad y momentos que se vuelven recuerdos. ☕✨',
            vision: data.object?.tenantConfig?.vision || 'Ser la cafetería preferida de nuestra comunidad, reconocida por ofrecer experiencias únicas en cada visita. Queremos inspirar momentos de conexión auténtica, impulsados por el aroma de un buen café, un servicio cercano y un ambiente que invite a quedarse.'
          };
          this.footerData = {
            dir: data.object?.tenant?.direccion || 'Empedrado, Paseo Arboleda, San Mateo Otzacatipan Toluca Estado de Mexico',
            tel: data.object?.tenant?.telefono || '55 76655444',
            bussinesEmail: data.object?.user.email || 'caffe@example.com',
            twiter: data.object?.tenantConfig?.twitter || '#x',
            facebook: data.object?.tenantConfig?.facebook || '#fb',
            linkedin: data.object?.tenantConfig?.linkedin || '#in',
            instagram: data.object?.tenantConfig?.instagram || '#in',
            tiktok: data.object?.tenantConfig?.tiktok || '#tt',
            schelules: data.tenant?.schedules || 'Lunes a Viernes de 8:00 a 20:00 Hrs.<br>Sabados y Domingos de 9:00 a 18:00 Hrs.'
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

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'crema-bg');
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

