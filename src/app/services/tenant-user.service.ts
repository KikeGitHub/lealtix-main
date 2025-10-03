import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AppUserModel } from '../models/AppUserModel';

@Injectable({
  providedIn: 'root'
})
export class TenantUserService {

  private apiUrlAppUsers = `${environment.apiUrl}/appusers`;

  private apiUrlValidateWizardToken = `${environment.apiUrl}/appusers/validate/{token}`;

  constructor(private http: HttpClient) {}

  /**
   * Actualiza un usuario de la app por ID
   * @param id ID del usuario a actualizar
   * @param data Datos del usuario (AppUserModel)
   */
  updateAppUser(id: number, data: AppUserModel) {
    const url = `${this.apiUrlAppUsers}/${id}`;
    return this.http.put<any>(url, data);
  }

  validateWizardToken(token: string) {
    const url = this.apiUrlValidateWizardToken.replace('{token}', token);
    return this.http.get<any>(url);
  }

}
