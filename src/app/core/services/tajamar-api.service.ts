import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { LoginResponse } from '../../shared/models/auth.model';
import { CourseModel } from '../../shared/models/course.model';
import { UserModel } from '../../shared/models/user.model';
import { catchError, of, throwError } from 'rxjs';
import { AttendanceIncidentModel } from '../../shared/models/attendance-incident.model';


@Injectable({ providedIn: 'root' })
export class TajamarApiService {
  private readonly http = inject(HttpClient);

  login(credentials: { userName: string; password: string }) {
    // Use backend response directly. Demo fallback removed to force real API usage.
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}${environment.authEndpoint}`, credentials);
  }

  postIncidents(incidents: AttendanceIncidentModel[]) {
    const url = `${environment.apiBaseUrl}/api/Incidencias`;
    return this.http.post(url, incidents).pipe(
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  getUsers() {
    return this.http.get<UserModel[]>(`${environment.apiBaseUrl}${environment.usersEndpoint}`);
  }

  getCourses() {
    return this.http.get<CourseModel[]>(`${environment.apiBaseUrl}${environment.coursesEndpoint}`);
  }

  getCourseStudents(courseId: number) {
    return this.http.get<UserModel[]>(`${environment.apiBaseUrl}/api/Usuarios/UsuariosCurso/${courseId}`);
  }

  getTeacherCourses() {
    return this.http.get<CourseModel[]>(`${environment.apiBaseUrl}/api/Profesor/CursosActivosProfesor`);
  }

  /** Returns courses with their enrolled students for the authenticated professor */
  getProfesorAlumnosCursoActivoProfesor() {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/api/Profesor/AlumnosCursoActivoProfesor`);
  }

  getCursosUsuarios() {
    return this.http.get<{ id: number; idUsuario: number; idCurso: number }[]>(`${environment.apiBaseUrl}/api/CursosUsuarios`);
  }

  /** Get incidences for a course */
  getIncidenciasByCurso(courseId: number) {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/api/Incidencias/Curso/${courseId}`);
  }

  /** Update an incidencia (patch) */
  updateIncidencia(incidenciaId: number, payload: any) {
    return this.http.put(`${environment.apiBaseUrl}/api/Incidencias/${incidenciaId}`, payload).pipe(
      catchError((err) => throwError(() => err))
    );
  }
}
