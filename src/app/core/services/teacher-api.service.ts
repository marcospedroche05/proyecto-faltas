import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseModel } from '../../shared/models/course.model';
import { AlumnoFaltasModel, AttendanceIncidentModel, CursosProfesorAlumnosModel, VistaUsuarioCursoModel } from '../../shared/models/attendance-incident.model';

export interface CreateFaltaRequest {
  idCursosUsuarios: number;
  idCurso: number;
  fechaIncidencia: string;
  tipoFalta: string;
  comentario?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TeacherApiService {
  private readonly http = inject(HttpClient);

  getCursosConAlumnos(): Observable<CursosProfesorAlumnosModel[]> {
    return this.http.get<CursosProfesorAlumnosModel[]>(`${environment.apiBaseUrl}/api/Profesor/AlumnosCursoActivoProfesor`);
  }

  getAlumnosCursoRandom(): Observable<VistaUsuarioCursoModel[]> {
    return this.http.get<VistaUsuarioCursoModel[]>(`${environment.apiBaseUrl}/api/Profesor/AlumnosCursoActivoProfesorRandom`);
  }

  getMisCursos(): Observable<CourseModel[]> {
    return this.getCursosConAlumnos().pipe(map(cs => cs.map(c => c.curso)));
  }

  getFaltasDeCurso(idCurso: number): Observable<AttendanceIncidentModel[]> {
    return this.http.get<AlumnoFaltasModel[] | null>(`${environment.apiBaseUrl}/api/FaltasAlumno/FaltasCurso`).pipe(
      map(r => r?.flatMap(af => af.faltas.map(f => ({
        ...f,
        nombreAlumno: af.usuario?.nombre ?? af.usuario?.usuario,
        apellidosAlumno: af.usuario?.apellidos
      }))) ?? [])
    );
  }

  crearFalta(request: CreateFaltaRequest): Observable<void> {
    const body = {
      id: 0,
      esJustificada: false,
      idUsuario: request.idCursosUsuarios,
      idCurso: request.idCurso,
      fechaIncidencia: request.fechaIncidencia,
      tipoFalta: request.tipoFalta,
      comentario: request.comentario ?? null
    };
    return this.http.post<void>(`${environment.apiBaseUrl}/api/FaltasAlumno/CreateFaltaAlumno`, body);
  }

  eliminarFalta(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/api/FaltasAlumno/DeleteFaltaAlumno`, {
      params: { idfalta: id }
    });
  }
}
