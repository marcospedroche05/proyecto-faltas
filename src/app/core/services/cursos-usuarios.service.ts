import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CursosUsuariosService {
  private readonly http = inject(HttpClient);

  getCursosUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/api/CursosUsuarios`);
  }
}
