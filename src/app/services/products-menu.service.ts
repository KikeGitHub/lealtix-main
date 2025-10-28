import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class ProductsMenuService {
  private apiUrlProductsByTenant = `${environment.apiUrl}/tenant-menu-products/tenant`;

  constructor(private http: HttpClient) {}

  getProductsByTenantId(tenantId: number) {
    return this.http.get<any>(`${this.apiUrlProductsByTenant}/${tenantId}`);
  }
}
