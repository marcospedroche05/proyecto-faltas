import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoleModel } from '../../shared/models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http = inject(HttpClient);

  getRoles(): Observable<RoleModel[]> {
    return this.http.get<RoleModel[]>(`${environment.apiBaseUrl}/api/Roles`);
  }
}
