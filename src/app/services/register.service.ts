import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RegisterModel } from '../models/RegisterModel';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private apiUrl = `${environment.apiUrl}/registro/register`;

  constructor(private http: HttpClient) {}

  register(data: RegisterModel): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
