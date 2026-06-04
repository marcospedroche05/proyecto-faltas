import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseModel } from '../../shared/models/course.model';
import { AdminFaltaModel, AlumnoModel } from '../../shared/models/attendance-incident.model';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);

  getCursos(): Observable<CourseModel[]> {
    return this.http.get<CourseModel[]>(`${environment.apiBaseUrl}/api/admin/cursos`);
  }

  getAlumnosDeCurso(idCurso: number): Observable<AlumnoModel[]> {
    return this.http.get<AlumnoModel[]>(`${environment.apiBaseUrl}/api/admin/cursos/${idCurso}/alumnos`);
  }

  getFaltasDeCurso(idCurso: number): Observable<AdminFaltaModel[]> {
    return this.http.get<AdminFaltaModel[]>(`${environment.apiBaseUrl}/api/admin/cursos/${idCurso}/faltas`);
  }

  getAllFaltas(): Observable<AdminFaltaModel[]> {
    return this.http.get<AdminFaltaModel[]>(`${environment.apiBaseUrl}/api/admin/faltas`);
  }

  updateJustificacion(id: number, esJustificada: boolean): Observable<void> {
    return this.http.patch<void>(`${environment.apiBaseUrl}/api/admin/faltas/${id}/justificacion`, { esJustificada });
  }

  eliminarFalta(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/api/admin/faltas/${id}`);
  }
}
