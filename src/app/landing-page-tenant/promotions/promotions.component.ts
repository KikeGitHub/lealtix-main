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
  loading = true;
  error: string | null = null;

  constructor(private tenantService: TenantLandingPageService) {}

  ngOnInit(): void {
    if (this.tenantId) {
      this.loadPromotions();
    }
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
        if (response.code === 200 && response.object) {
          this.promotions = response.object;
        } else {
           // Handle empty or error responses gracefully
           // console.log("No promotions found");
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching promotions', err);
        // this.error = 'Error al cargar las promociones.';
        this.loading = false;
      }
    });
  }
}
