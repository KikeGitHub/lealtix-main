import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tenantModel } from '../models/tenant-model';
import { environment } from '../../environments/environment';
import { tenantConfigModel } from '../models/tenant-config.model';

@Injectable({ providedIn: 'root' })
export class tenantService {

  private apiUrl = `${environment.apiUrl}/tenant`;
  private apiUrlCreate = `${environment.apiUrl}/tenant`;
  private apiUrlCreateConfig = `${environment.apiUrl}/tenant-config`;

  constructor(private http: HttpClient) {}

  updateTenant(id: number, tenant: tenantModel): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, tenant);
  }

  createTenant(tenant: tenantModel): Observable<any> {
    return this.http.post<any>(this.apiUrlCreate, tenant);
  }

  createTenantConfig(tenant: tenantConfigModel): Observable<any> {
    return this.http.post<any>(this.apiUrlCreateConfig, tenant);
  }
}
