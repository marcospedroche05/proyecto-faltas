import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AttendanceIncidentModel, AttendanceSummaryModel } from '../../shared/models/attendance-incident.model';
import { CourseModel } from '../../shared/models/course.model';

@Injectable({ providedIn: 'root' })
export class StudentApiService {
  private readonly http = inject(HttpClient);

  getMisFaltas(): Observable<AttendanceIncidentModel[]> {
    return this.http.get<AttendanceIncidentModel[]>(`${environment.apiBaseUrl}/api/faltas/mis-faltas`);
  }

  getMisCursos(): Observable<CourseModel[]> {
    return this.http.get<CourseModel[]>(`${environment.apiBaseUrl}/api/faltas/mis-cursos`);
  }

  getResumenAsistencia(): Observable<AttendanceSummaryModel[]> {
    return this.http.get<AttendanceSummaryModel[]>(`${environment.apiBaseUrl}/api/faltas/resumen-asistencia`);
  }
}
