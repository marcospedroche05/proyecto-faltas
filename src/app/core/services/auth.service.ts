import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UserProfileResponse } from '../../shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/api/Auth/Login`, credentials);
  }

  getProfileWithToken(token: string): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${environment.apiBaseUrl}/api/Usuarios/Perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
