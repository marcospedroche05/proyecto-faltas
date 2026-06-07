import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlumnoFaltasModel, AttendanceIncidentModel } from '../../shared/models/attendance-incident.model';
import { CourseModel } from '../../shared/models/course.model';

@Injectable({ providedIn: 'root' })
export class StudentApiService {
  private readonly http = inject(HttpClient);

  getMisFaltasCompleto(): Observable<AlumnoFaltasModel> {
    return this.http.get<AlumnoFaltasModel>(`${environment.apiBaseUrl}/api/FaltasAlumno/FaltasAlumno`);
  }

  getMisFaltas(): Observable<AttendanceIncidentModel[]> {
    return this.getMisFaltasCompleto().pipe(map(r => r.faltas));
  }

  getMisCursos(): Observable<CourseModel[]> {
    return this.getMisFaltasCompleto().pipe(
      map(r => {
        const u = r.usuario;
        if (!u?.idCurso) return [];
        return [{
          idCurso: u.idCurso,
          nombre: u.curso,
          fechaInicio: u.fechaInicioCurso,
          fechaFin: u.fechaFinCurso,
          activo: true
        }];
      })
    );
  }

}
