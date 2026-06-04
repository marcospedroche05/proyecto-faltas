import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseModel } from '../../shared/models/course.model';
import { AlumnoModel, AttendanceIncidentModel } from '../../shared/models/attendance-incident.model';

export interface CreateFaltaRequest {
  idUsuario: number;
  idCurso: number;
  fechaIncidencia: string;
  tipoFalta: string;
  comentario?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TeacherApiService {
  private readonly http = inject(HttpClient);

  getMisCursos(): Observable<CourseModel[]> {
    return this.http.get<CourseModel[]>(`${environment.apiBaseUrl}/api/profesor/cursos`);
  }

  getAlumnosDeCurso(idCurso: number): Observable<AlumnoModel[]> {
    return this.http.get<AlumnoModel[]>(`${environment.apiBaseUrl}/api/profesor/cursos/${idCurso}/alumnos`);
  }

  getFaltasDeCurso(idCurso: number): Observable<AttendanceIncidentModel[]> {
    return this.http.get<AttendanceIncidentModel[]>(`${environment.apiBaseUrl}/api/profesor/cursos/${idCurso}/faltas`);
  }

  crearFalta(request: CreateFaltaRequest): Observable<AttendanceIncidentModel> {
    return this.http.post<AttendanceIncidentModel>(`${environment.apiBaseUrl}/api/profesor/faltas`, request);
  }

  eliminarFalta(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/api/profesor/faltas/${id}`);
  }
}
