import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginResponse } from '../../shared/models/auth.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(credentials: { userName: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}${environment.authEndpoint}`, credentials);
  }
}
