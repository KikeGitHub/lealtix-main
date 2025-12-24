import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TenantCustomerService {
  private apiUrl = `${environment.apiUrl}/tenant-customers`;

  constructor(private http: HttpClient) { }

  createCustomer(customerData: any): Observable<any> {
    return this.http.post(this.apiUrl, customerData);
  }
}
