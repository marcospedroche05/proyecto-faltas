import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseModel } from '../../shared/models/course.model';

@Injectable({ providedIn: 'root' })
export class ProfessorService {
  private readonly http = inject(HttpClient);

  /**
   * Returns the active courses for the currently authenticated professor
   */
  getTeacherCourses(): Observable<CourseModel[]> {
    return this.http.get<CourseModel[]>(`${environment.apiBaseUrl}/api/Profesor/CursosActivosProfesor`);
  }

  // Add other professor-related endpoints as needed
}
