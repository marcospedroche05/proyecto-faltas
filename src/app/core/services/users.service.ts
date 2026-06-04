import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserModel } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  getUserById(id: number): Observable<UserModel> {
    return this.http.get<UserModel>(`${environment.apiBaseUrl}/api/usuarios/${id}`);
  }
}
