import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantLandingPageService } from '../../services/tenant-landing-page.service';
import { Campaign } from '../../models/campaign.model';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.css']
})
export class PromotionsComponent implements OnInit {
  @Input() tenantId: number = 0;
  promotions: Campaign[] = [];
  slides: any[] = [];
  loading = true;
  error: string | null = null;
  activePromoIndex = 0;

  constructor(private tenantService: TenantLandingPageService) {}

  ngOnInit(): void {
    if (this.tenantId) {
      this.loadPromotions();
    }
  }

  nextPromo(): void {
    if (this.slides.length === 0) return;
    this.activePromoIndex = (this.activePromoIndex + 1) % this.slides.length;
  }

  prevPromo(): void {
    if (this.slides.length === 0) return;
    this.activePromoIndex =
      (this.activePromoIndex - 1 + this.slides.length) % this.slides.length;
  }

  setPromo(index: number): void {
    this.activePromoIndex = index;
  }

  get currentSlide(): any {
    return this.slides[this.activePromoIndex] || null;
  }

  // Construye los slides del carrusel desde las promociones reales
  private buildSlides(): void {
    this.slides = this.promotions.map((promo, i) => ({
      title: promo.title || '¡Bienvenido(a)!',
      description: promo.promotionReward?.description || promo.description || '',
      validity: `Válido: ${this.formatDate(promo.startDate)} - ${this.formatDate(promo.endDate)}`,
      badge: i === 0 ? 'Temporada' : i === 1 ? 'Exclusiva' : 'Nuevo',
      image: promo.imageUrl || '',
      buttonText: 'Usar Descuento',
      code: 'BIENVENIDA10'
    }));

    // Vista previa: si solo hay 1 promoción real, agrega una de cumpleaños
    // reutilizando la misma imagen para probar el carrusel con 2 slides.
    if (this.slides.length === 1) {
      const img = this.slides[0].image;
      this.slides.push({
        title: '¡Feliz Cumpleaños!',
        description:
          'Beneficio especial en tu cumpleaños: un postre de cortesía con tu café favorito.',
        validity: 'Válido: Todo el año',
        badge: 'Cumpleaños',
        image: img || '',
        buttonText: 'Usar Descuento',
        code: 'CUMPLE10'
      });
    }

    this.activePromoIndex = 0;
  }

  // Detect changes if tenantId changes later (unlikely but good practice)
  ngOnChanges(): void {
    if (this.tenantId && this.promotions.length === 0) {
        this.loadPromotions();
    }
  }

  loadPromotions(): void {
    this.loading = true;
    this.tenantService.getActivePromotions(this.tenantId).subscribe({
      next: (response) => {
        // Handle responses that may be either an array or an object with `object` array
        if (!response) {
          this.promotions = [];
        } else if (Array.isArray(response)) {
          this.promotions = response;
        } else if (response.object && Array.isArray(response.object)) {
          this.promotions = response.object;
        } else if (response.code === 200 && response.object) {
          this.promotions = response.object;
        } else {
          console.log('No promotions found', response);
          this.promotions = [];
        }

        // Ensure promotionReward.usageLimit defaults to 1 when not provided
        this.promotions = this.promotions.map(p => {
          try {
            if (p && p.promotionReward) {
              if (p.promotionReward.usageLimit == null) {
                p.promotionReward.usageLimit = 1;
              }
            }
          } catch (e) {
            // defensive: if shape is unexpected, skip
          }
          return p;
        });

        this.buildSlides();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching promotions', err);
        this.error = 'Error al cargar las promociones.';
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  }
}
