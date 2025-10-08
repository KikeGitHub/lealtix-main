import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TokenValidationService {
  private apiUrlValidateToken = `${environment.apiUrl}/invitations/validate-token`;

  constructor(private http: HttpClient) {}

  validateToken(token: string): Observable<any> {
    return this.http.get<any>(this.apiUrlValidateToken, { params: { token } });
  }
}
