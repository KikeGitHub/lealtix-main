import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OfferWidgetService {
  constructor(private http: HttpClient) {}

  submit(data: any, apiBaseUrl: string, token?: string): Observable<any> {
    const base = (apiBaseUrl || '').replace(/\/$/, '');
    const url = base ? `${base}/widget/register` : `/widget/register`;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post(url, data, { headers });
  }
}
