import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class TenantLandingPageService {

  private apiUrl = `${environment.apiUrl}/tenant/slug/`;

  constructor(private http: HttpClient) {}

  getDatosPorSlug(slug: string): Observable<any> {
    return this.http.get(`${this.apiUrl}${slug}`);
  }
}
