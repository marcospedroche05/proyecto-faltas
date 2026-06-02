import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseModel } from '../../shared/models/course.model';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly http = inject(HttpClient);

  getCourses(): Observable<CourseModel[]> {
    return this.http.get<CourseModel[]>(`${environment.apiBaseUrl}${environment.coursesEndpoint}`);
  }

  getCourseStudents(courseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/api/Usuarios/UsuariosCurso/${courseId}`);
  }
}
