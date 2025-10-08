import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/preregistro`;

  constructor(private http: HttpClient) {}

  preSubscribe(data: { nombre: string; email: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
