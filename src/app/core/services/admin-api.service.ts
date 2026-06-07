import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseModel } from '../../shared/models/course.model';
import { AdminFaltaModel, AlumnoFaltasModel, AlumnoModel, VistaUsuarioCursoModel } from '../../shared/models/attendance-incident.model';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);

  getCursos(): Observable<CourseModel[]> {
    return this.http.get<CourseModel[]>(`${environment.apiBaseUrl}/api/Cursos`);
  }

  getAlumnosDeCurso(idCurso: number): Observable<AlumnoModel[]> {
    return this.http.get<VistaUsuarioCursoModel[]>(`${environment.apiBaseUrl}/api/Admin/UsuariosActivos`).pipe(
      map(usuarios => usuarios
        .filter(u => u.idCurso === idCurso && u.idRole === 2)
        .map(u => ({
          idUsuario: u.idUsuario,
          nombre: u.usuario,
          apellidos: '',
          email: u.email
        }))
      )
    );
  }

  getFaltasDeCurso(idCurso: number): Observable<AdminFaltaModel[]> {
    return this.http.get<AlumnoFaltasModel[] | null>(`${environment.apiBaseUrl}/api/FaltasAlumno/FaltasCurso`).pipe(
      map(r => this.mapToAdminFaltaModels(r))
    );
  }

  getAllFaltas(): Observable<AdminFaltaModel[]> {
    return this.http.get<AlumnoFaltasModel[] | null>(`${environment.apiBaseUrl}/api/FaltasAlumno/FaltasCurso`).pipe(
      map(r => this.mapToAdminFaltaModels(r))
    );
  }

  updateJustificacion(id: number, esJustificada: boolean): Observable<void> {
    return this.http.put<void>(
      `${environment.apiBaseUrl}/api/FaltasAlumno/UpdateJustificacionFalta`,
      null,
      { params: { idfalta: id, esjustificada: esJustificada } }
    );
  }

  eliminarFalta(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/api/FaltasAlumno/DeleteFaltaAlumno`, {
      params: { idfalta: id }
    });
  }

  private mapToAdminFaltaModels(r: AlumnoFaltasModel[] | null): AdminFaltaModel[] {
    if (!r) return [];
    return r.flatMap(af =>
      af.faltas.map(f => ({
        id: f.id,
        idAlumno: af.usuario?.idUsuario ?? f.idUsuario,
        nombreAlumno: af.usuario
          ? `${af.usuario.nombre ?? ''} ${af.usuario.apellidos ?? ''}`.trim() || af.usuario.usuario
          : '',
        imagenAlumno: af.usuario?.imagen,
        idCurso: f.idCurso,
        nombreCurso: af.usuario?.curso ?? '',
        fecha: f.fechaIncidencia,
        tipo: f.tipoFalta,
        esJustificada: f.esJustificada,
        observaciones: f.comentario
      }))
    );
  }
}
