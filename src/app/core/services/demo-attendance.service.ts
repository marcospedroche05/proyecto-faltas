import { Injectable, computed, signal, inject, effect } from '@angular/core';
import { TajamarApiService } from './tajamar-api.service';
import { AuthSessionService } from '../auth/auth-session.service';
import { catchError, forkJoin, of } from 'rxjs';
import { AttendanceIncidentModel, AttendanceType as IncidentType } from '../../shared/models/attendance-incident.model';
import { environment } from '../../../environments/environment';

export type AttendanceMark = 'presente' | 'falta' | 'retraso' | 'salida';

export const attendanceMarkLabels: Record<AttendanceMark, string> = {
  presente: 'Presente',
  falta: 'Falta',
  retraso: 'Retraso',
  salida: 'Salida de antes'
};

export const attendanceTypeForMark: Record<Exclude<AttendanceMark, 'presente'>, IncidentType> = {
  falta: 'Falta',
  retraso: 'Retraso',
  salida: 'Salida de antes'
};

export interface StudentIncident {
  id: number;
  fecha: string;
  tipo: IncidentType;
  justificada: boolean;
  comentario: string;
  idAlumno?: number;
}

export interface StudentTrendPoint {
  label: string;
  value: number;
}

export interface StudentSummary {
  total: number;
  faltas: number;
  retrasos: number;
  salidas: number;
  justificadas: number;
  noJustificadas: number;
  asistencia: number;
}

export interface StudentDashboardData {
  nombre: string;
  email: string;
  imagen?: string | null;
  grupo: string;
  curso: string;
  tutor: string;
  avatar: string;
  rachaAsistencia: number;
  summary: StudentSummary;
  tendencia: StudentTrendPoint[];
  incidencias: StudentIncident[];
  insights: string[];
}

export interface TeacherRosterStudent {
  id: number;
  nombre: string;
  email: string;
  estado: AttendanceMark;
  comentario?: string;
}

export interface TeacherCourse {
  id: number;
  nombre: string;
  grupo: string;
  aula: string;
  horario: string;
  profesor: string;
  alumnos: TeacherRosterStudent[];
  historial: StudentIncident[];
}

export interface AdminSnapshot {
  totalEstudiantes: number;
  totalProfesores: number;
  totalCursos: number;
  justificacionesPendientes: number;
  ultimaSincronizacion: string;
}

@Injectable({ providedIn: 'root' })
export class DemoAttendanceService {
  private readonly api = inject(TajamarApiService);
  private readonly auth = inject(AuthSessionService);
  
  private nextIncidentId = 5000;
  readonly activeCourseId = signal<number>(3430);

  private readonly studentProfilesSignal = signal<Map<string, StudentDashboardData>>(new Map());
  private readonly teacherCoursesSignal = signal<TeacherCourse[]>([]);

  readonly teacherCourses = computed(() => this.teacherCoursesSignal());
  readonly activeTeacherCourse = computed(() => this.teacherCourses().find((course) => course.id === this.activeCourseId()) ?? this.teacherCourses()[0]);

  private readonly genericStudentProfile: StudentDashboardData = {
    nombre: 'Alumno Tajamar',
    email: 'alumno@tajamar365.com',
    imagen: null,
    grupo: 'Grupo Único',
    curso: 'Cargando...',
    tutor: 'Cargando...',
    avatar: 'AT',
    rachaAsistencia: 0,
    summary: { total: 0, faltas: 0, retrasos: 0, salidas: 0, justificadas: 0, noJustificadas: 0, asistencia: 100 },
    tendencia: [],
    incidencias: [],
    insights: []
  };

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.loadRealData();
      } else {
        this.studentProfilesSignal.set(new Map());
        this.teacherCoursesSignal.set([]);
      }
    });

    this.studentProfilesSignal.set(new Map());
  }

  private loadRealData() {
    const roleId = this.auth.getRoleId();

    if (roleId === 3) {
      this.loadAdminData();
    } else if (roleId === 1) {
      this.loadTeacherData();
    } else if (roleId === 2) {
      this.loadStudentData();
    } else {
      this.teacherCoursesSignal.set([]);
      this.studentProfilesSignal.set(new Map());
    }
  }

  private loadAdminData() {
    forkJoin({
      users: this.api.getUsers(),
      courses: this.api.getCourses(),
      cursosUsuarios: this.api.getCursosUsuarios()
    }).subscribe({
      next: ({ users, courses, cursosUsuarios }) => {
        const teacherCoursesList: TeacherCourse[] = [];
        const newStudentProfiles = new Map<string, StudentDashboardData>();

        for (const course of courses) {
          const mapping = cursosUsuarios.filter((cu: any) => cu.idCurso === course.idcurso);
          const studentIds = mapping.map((m: any) => m.idUsuario);
          const courseUsers = users.filter((u: any) => studentIds.includes(u.id));

          const teacher = courseUsers.find((u: any) => u.idrole === 1);
          const students = courseUsers.filter((u: any) => u.idrole === 2);

          const teacherCourse: TeacherCourse = {
            id: course.idcurso,
            nombre: course.nombre,
            grupo: 'Grupo Único',
            aula: `Aula ${course.idcurso}`,
            horario: 'Lunes a Viernes',
            profesor: teacher ? teacher.email : 'Sin asignar',
            alumnos: students.map((s: any) => ({
              id: s.id,
              nombre: `${s.nombre} ${s.apellidos}`,
              email: s.email,
              estado: 'presente'
            })),
            historial: []
          };
          teacherCoursesList.push(teacherCourse);

          for (const s of students) {
            const char1 = s.nombre ? s.nombre.charAt(0) : 'A';
            const char2 = s.apellidos ? s.apellidos.charAt(0) : 'T';
            const profile: StudentDashboardData = {
              nombre: `${s.nombre} ${s.apellidos}`,
              email: s.email,
              imagen: s.imagen ?? null,
              grupo: 'Grupo Único',
              curso: course.nombre,
              tutor: teacher ? `${teacher.nombre} ${teacher.apellidos}` : 'Sin asignar',
              avatar: (char1 + char2).toUpperCase(),
              rachaAsistencia: 0,
              summary: { total: 0, faltas: 0, retrasos: 0, salidas: 0, justificadas: 0, noJustificadas: 0, asistencia: 100 },
              tendencia: [],
              incidencias: [],
              insights: ['Asistencia perfecta.', 'Buen comienzo de curso.']
            };
            newStudentProfiles.set(s.email.trim().toLowerCase(), profile);
          }
        }

        this.teacherCoursesSignal.set(teacherCoursesList);
        this.studentProfilesSignal.set(newStudentProfiles);

        // set active default
        this.activeCourseId.set(courses.length > 0 ? courses[0].idcurso : 1);
        if (courses.some((c: any) => c.idcurso === 3430)) {
          this.activeCourseId.set(3430);
        }
      },
      error: (err) => console.error('Error loading API data', err)
    });
  }

  private loadTeacherData() {
    // Use the API that returns courses with their students for the authenticated professor
    console.log('[DemoAttendanceService] loadTeacherData: starting request, token=', this.auth.getToken());
    this.api.getProfesorAlumnosCursoActivoProfesor().subscribe({
      next: (items) => {
        console.log('[DemoAttendanceService] loadTeacherData: response items=', items);
        if (!items || !items.length) {
          this.teacherCoursesSignal.set([]);
          return;
        }

        const teacherCoursesList: TeacherCourse[] = items.map((item: any) => {
          const curso = item.curso ?? item.course ?? {};
          const alumnosRaw = item.alumnos ?? item.alumnos ?? [];
          const alumnos = (alumnosRaw || []).map((a: any) => {
            const usuario = a.alumno ?? a.usuario ?? a;
            const nombre = usuario.nombre ? `${usuario.nombre} ${usuario.apellidos ?? ''}`.trim() : (usuario.usuario || 'Alumno');
            return { id: usuario.idUsuario ?? usuario.id ?? usuario.idUsuario ?? 0, nombre, email: usuario.email ?? usuario.usuario ?? '', estado: 'presente' } as TeacherRosterStudent;
          });

          return {
            id: curso.idCurso ?? curso.idcurso ?? curso.id ?? 0,
            nombre: curso.nombre ?? 'Curso',
            grupo: curso.curso ?? 'Grupo Único',
            aula: `Aula ${curso.idCurso ?? curso.idcurso ?? curso.id ?? ''}`,
            horario: 'Lunes a Viernes',
            profesor: this.auth.session()?.userName ?? 'Profesor',
            alumnos,
            historial: []
          } as TeacherCourse;
        });

        // Build student profiles map so student view shows the correct tutor
        const newStudentProfiles = new Map<string, StudentDashboardData>();
        for (const courseEntry of teacherCoursesList) {
          const tutorName = courseEntry.profesor ?? 'Sin asignar';
          for (const s of courseEntry.alumnos) {
            const names = s.nombre.split(' ');
            const char1 = names[0] ? names[0].charAt(0) : 'A';
            const char2 = names[1] ? names[1].charAt(0) : 'T';
            const profile: StudentDashboardData = {
              nombre: s.nombre,
              email: s.email,
              imagen: usuario.imagen ?? null,
              grupo: courseEntry.grupo,
              curso: courseEntry.nombre,
              tutor: typeof tutorName === 'string' ? tutorName : 'Sin asignar',
              avatar: (char1 + char2).toUpperCase(),
              rachaAsistencia: 0,
              summary: { total: 0, faltas: 0, retrasos: 0, salidas: 0, justificadas: 0, noJustificadas: 0, asistencia: 100 },
              tendencia: [],
              incidencias: [],
              insights: []
            };
            newStudentProfiles.set((s.email ?? '').trim().toLowerCase(), profile);
          }
        }

        this.teacherCoursesSignal.set(teacherCoursesList);
        this.studentProfilesSignal.set(newStudentProfiles);
        this.activeCourseId.set(teacherCoursesList.length ? teacherCoursesList[0].id : this.activeCourseId());
      },
      error: (err) => {
        console.error('Error loading teacher courses', err);
        if (!environment.production) {
          const demoCourse: TeacherCourse = {
            id: 1,
            nombre: 'Curso Demo',
            grupo: 'Grupo Demo',
            aula: 'Aula 1',
            horario: 'Lunes a Viernes',
            profesor: 'Profesor Demo',
            alumnos: [
              { id: 101, nombre: 'Alumno Uno', email: 'alumno1@tajamar365.com', estado: 'presente' },
              { id: 102, nombre: 'Alumno Dos', email: 'alumno2@tajamar365.com', estado: 'presente' }
            ],
            historial: []
          };
          this.teacherCoursesSignal.set([demoCourse]);
          this.activeCourseId.set(demoCourse.id);
        } else {
          this.teacherCoursesSignal.set([]);
        }
      }
    });
  }

  private loadStudentData() {
    const normalizedUserName = (this.auth.session()?.userName ?? '').trim().toLowerCase();
    if (!normalizedUserName) {
      this.studentProfilesSignal.set(new Map());
      return;
    }

    forkJoin({
      users: this.api.getUsers(),
      courses: this.api.getCourses(),
      cursosUsuarios: this.api.getCursosUsuarios()
    }).subscribe({
      next: ({ users, courses, cursosUsuarios }) => {
        const currentUser = this.resolveCurrentUser(users, normalizedUserName);
        if (!currentUser) {
          this.studentProfilesSignal.set(new Map([[normalizedUserName, this.genericStudentProfile]]));
          return;
        }

        const relatedCourseIds = cursosUsuarios
          .filter((item: any) => item.idUsuario === currentUser.id)
          .map((item: any) => item.idCurso);

        const relatedCourses = courses.filter((course) => relatedCourseIds.includes(course.idcurso));
        if (!relatedCourses.length) {
          const fallbackProfile = this.buildStudentProfile(currentUser, null, null, []);
          this.studentProfilesSignal.set(new Map([[currentUser.email.trim().toLowerCase(), fallbackProfile]]));
          return;
        }

        forkJoin(
          relatedCourses.map((course) =>
            this.api.getIncidenciasByCurso(course.idcurso).pipe(catchError(() => of([])))
          )
        ).subscribe({
          next: (courseIncidences) => {
            const currentCourse = relatedCourses[0];
            const currentIncidences = this.extractStudentIncidences(currentUser.id, courseIncidences.flat());
            const teacher = this.resolveCourseTeacher(users, cursosUsuarios, currentCourse.idcurso);
            const profile = this.buildStudentProfile(currentUser, currentCourse, teacher, currentIncidences);

            this.studentProfilesSignal.set(new Map([[currentUser.email.trim().toLowerCase(), profile]]));
          },
          error: (err) => {
            console.error('Error loading student incidences', err);
            const fallbackProfile = this.buildStudentProfile(currentUser, relatedCourses[0] ?? null, null, []);
            this.studentProfilesSignal.set(new Map([[currentUser.email.trim().toLowerCase(), fallbackProfile]]));
          }
        });
      },
      error: (err) => {
        console.error('Error loading student data', err);
        this.studentProfilesSignal.set(new Map([[normalizedUserName, this.genericStudentProfile]]));
      }
    });
  }

  getStudentDashboard(userName?: string | null): StudentDashboardData {
    const normalizedUserName = (userName ?? '').trim().toLowerCase();
    const profile = this.studentProfilesSignal().get(normalizedUserName) ?? this.genericStudentProfile;
    return this.cloneStudentProfile(profile);
  }

  getAdminSnapshot(): AdminSnapshot {
    const allCourses = this.teacherCourses();
    const totalEstudiantes = allCourses.reduce((acc, course) => acc + course.alumnos.length, 0);
    const justPend = allCourses.reduce((acc, course) => {
      const coursePending = course.alumnos.filter((student) => student.estado !== 'presente').length;
      return acc + coursePending + course.historial.filter((inc) => !inc.justificada).length;
    }, 0);

    return {
      totalEstudiantes,
      totalProfesores: 4,
      totalCursos: allCourses.length,
      justificacionesPendientes: justPend,
      ultimaSincronizacion: new Date().toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      })
    };
  }

  getPendingJustifications() {
    return this.teacherCourses().flatMap((course) =>
      course.historial.filter((inc) => !inc.justificada).map((inc) => ({
          course: course.nombre,
          grupo: course.grupo,
          fecha: inc.fecha,
          tipo: inc.tipo,
          comentario: inc.comentario
        }))
    );
  }

  setActiveCourse(courseId: number): void {
    this.activeCourseId.set(courseId);
  }

  setStudentState(studentId: number, estado: AttendanceMark): void {
    this.teacherCoursesSignal.update((courses) =>
      courses.map((course) => ({
        ...course,
        alumnos: course.alumnos.map((student) =>
          student.id === studentId
            ? { ...student, estado, comentario: estado === 'presente' ? undefined : student.comentario ?? `Marcar como ${attendanceMarkLabels[estado].toLowerCase()}` }
            : student
        )
      }))
    );
  }

  setStudentComment(studentId: number, comentario?: string | null): void {
    this.teacherCoursesSignal.update((courses) =>
      courses.map((course) => ({
        ...course,
        alumnos: course.alumnos.map((student) =>
          student.id === studentId
            ? { ...student, comentario: comentario && comentario.trim() ? comentario : undefined }
            : student
        )
      }))
    );
  }

  setAllStudents(estado: AttendanceMark): void {
    const currentCourse = this.activeTeacherCourse();
    if (!currentCourse) return;

    this.teacherCoursesSignal.update((courses) =>
      courses.map((course) =>
        course.id === currentCourse.id
          ? {
              ...course,
              alumnos: course.alumnos.map((student) => ({
                ...student, estado, comentario: estado === 'presente' ? undefined : `Marcado en bloque como ${attendanceMarkLabels[estado].toLowerCase()}`
              }))
            }
          : course
      )
    );
  }

  commitActiveCourse(): number {
    const currentCourse = this.activeTeacherCourse();
    if (!currentCourse) return 0;

    const pendingStudents = currentCourse.alumnos.filter((student) => student.estado !== 'presente');
    if (!pendingStudents.length) return 0;

    const newIncidents = pendingStudents.map((student) => ({
      id: this.nextIncidentId++,
      fecha: new Date().toISOString(),
      tipo: attendanceTypeForMark[student.estado as Exclude<AttendanceMark, 'presente'>],
      justificada: false,
      comentario: student.comentario ?? 'Registro generado por pase de lista',
      idAlumno: student.id 
    } satisfies StudentIncident));

    this.teacherCoursesSignal.update((courses) =>
      courses.map((course) =>
        course.id === currentCourse.id
          ? {
              ...course,
              historial: [...newIncidents, ...course.historial],
              alumnos: course.alumnos.map((student) => ({
                ...student, estado: 'presente', comentario: undefined
              }))
            }
          : course
      )
    );
    
    // Update student profiles with new incidents
    const currentProfiles = new Map(this.studentProfilesSignal());
    pendingStudents.forEach(student => {
      const email = student.email.trim().toLowerCase();
      const profileInfo = currentProfiles.get(email);
      if (profileInfo) {
         const profile = this.cloneStudentProfile(profileInfo);
         const incident = newIncidents.find(i => i.idAlumno === student.id);
         if (incident) {
           profile.incidencias.push(incident);
           profile.summary.total++;
           profile.summary.asistencia = Math.max(0, profile.summary.asistencia - 1);
           if (incident.tipo === 'Falta') profile.summary.faltas++;
           else if (incident.tipo === 'Retraso') profile.summary.retrasos++;
           else if (incident.tipo === 'Salida de antes') profile.summary.salidas++;
           profile.summary.noJustificadas++;
           currentProfiles.set(email, profile);
         }
      }
    });
    this.studentProfilesSignal.set(currentProfiles);

    // If a token exists, attempt to persist incidents to backend
    const token = this.auth.getToken();
    if (token) {
      try {
        const payload = newIncidents.map((inc) => ({
          id: inc.id,
          idUsuario: inc.idAlumno ?? 0,
          idCurso: currentCourse.id,
          fechaIncidencia: inc.fecha,
          tipoFalta: (inc.tipo === 'Falta' ? 'Falta' : inc.tipo === 'Retraso' ? 'Retraso' : 'Salida de antes') as AttendanceIncidentModel['tipoFalta'],
          esJustificada: inc.justificada,
          comentario: inc.comentario ?? null
        }));

        this.api.postIncidents(payload).subscribe({
          next: () => console.log('Incidencias guardadas en backend'),
          error: (err) => console.error('Error guardando incidencias en backend', err)
        });
      } catch (err) {
        console.error('Error preparando incidencias para el backend', err);
      }
    }

    return newIncidents.length;
  }

  getActiveCourseStats() {
    const course = this.activeTeacherCourse();
    if (!course) {
      return { total: 0, presentes: 0, faltas: 0, retrasos: 0, salidas: 0 };
    }
    return {
      total: course.alumnos.length,
      presentes: course.alumnos.filter((s) => s.estado === 'presente').length,
      faltas: course.alumnos.filter((s) => s.estado === 'falta').length,
      retrasos: course.alumnos.filter((s) => s.estado === 'retraso').length,
      salidas: course.alumnos.filter((s) => s.estado === 'salida').length
    };
  }

  private cloneStudentProfile(profile: StudentDashboardData): StudentDashboardData {
    return {
      ...profile,
      summary: { ...profile.summary },
      tendencia: profile.tendencia.map((point) => ({ ...point })),
      incidencias: profile.incidencias.map((incident) => ({ ...incident })),
      insights: [...profile.insights]
    };
  }

  private resolveCurrentUser(users: any[], normalizedUserName: string): any | null {
    return users.find((user: any) => {
      const candidates = [user.email, user.usuario, `${user.nombre ?? ''} ${user.apellidos ?? ''}`.trim()];
      return candidates.some((candidate) => (candidate ?? '').trim().toLowerCase() === normalizedUserName);
    }) ?? null;
  }

  private resolveCourseTeacher(users: any[], cursosUsuarios: any[], courseId: number): any | null {
    return users.find((user: any) =>
      user.idrole === 1 && cursosUsuarios.some((item: any) => item.idCurso === courseId && item.idUsuario === user.id)
    ) ?? null;
  }

  private buildStudentProfile(user: any, course: any | null, teacher: any | null, incidencias: StudentIncident[]): StudentDashboardData {
    const fullName = `${user.nombre ?? ''} ${user.apellidos ?? ''}`.trim() || user.email || user.usuario || 'Alumno';
    const email = (user.email ?? user.usuario ?? '').trim();
    const courseName = course?.nombre ?? course?.curso ?? 'Sin curso asignado';
    const groupName = course?.curso ?? 'Grupo Único';
    const tutorName = teacher ? `${teacher.nombre ?? ''} ${teacher.apellidos ?? ''}`.trim() : 'Sin asignar';
    const image = user.imagen ?? null;
    const avatar = this.buildAvatar(fullName, email);
    const summary = this.buildSummary(incidencias);
    const tendencia = this.buildTrend(incidencias);
    const rachaAsistencia = this.calculateAttendanceStreak(incidencias, course?.fechaInicio ?? course?.fechaInicioCurso ?? null);

    return {
      nombre: fullName,
      email,
      imagen: image,
      grupo: groupName,
      curso: courseName,
      tutor: tutorName,
      avatar,
      rachaAsistencia,
      summary,
      tendencia,
      incidencias: incidencias.map((incident) => ({ ...incident })),
      insights: incidencias.length
        ? ['Revisa tu historial de incidencias y tu racha de asistencia.', 'Los comentarios y justificantes quedan reflejados en tu perfil.']
        : ['No hay incidencias registradas en este momento.', 'Tu perfil está al día.']
    };
  }

  private buildSummary(incidencias: StudentIncident[]): StudentSummary {
    const faltas = incidencias.filter((inc) => inc.tipo === 'Falta').length;
    const retrasos = incidencias.filter((inc) => inc.tipo === 'Retraso').length;
    const salidas = incidencias.filter((inc) => inc.tipo === 'Salida de antes').length;
    const justificadas = incidencias.filter((inc) => inc.justificada).length;
    const noJustificadas = incidencias.length - justificadas;
    const total = incidencias.length;
    const asistencia = Math.max(0, 100 - faltas * 3 - retrasos * 1 - salidas * 2);

    return { total, faltas, retrasos, salidas, justificadas, noJustificadas, asistencia };
  }

  private buildTrend(incidencias: StudentIncident[]): StudentTrendPoint[] {
    const labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
    const buckets = [0, 0, 0, 0];
    const sorted = [...incidencias].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    sorted.forEach((incident, index) => {
      const bucketIndex = Math.min(3, Math.floor((index / Math.max(sorted.length, 1)) * 4));
      buckets[bucketIndex] += incident.justificada ? 0 : 1;
    });

    return labels.map((label, index) => ({ label, value: buckets[index] }));
  }

  private calculateAttendanceStreak(incidencias: StudentIncident[], courseStart?: string | null): number {
    const startDate = courseStart ? new Date(courseStart) : new Date('2025-10-01T00:00:00');
    const absences = new Set(
      incidencias
        .filter((incident) => !incident.justificada)
        .map((incident) => this.dateKey(new Date(incident.fecha)))
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let cursor = new Date(today);
    let streak = 0;

    while (cursor >= startDate) {
      if (this.isWeekday(cursor) && absences.has(this.dateKey(cursor))) {
        break;
      }

      if (this.isWeekday(cursor)) {
        streak++;
      }

      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }

  private buildAvatar(fullName: string, email: string): string {
    const nameParts = fullName.split(' ').filter(Boolean);
    const first = nameParts[0]?.charAt(0) ?? email.charAt(0) ?? 'A';
    const second = nameParts[1]?.charAt(0) ?? nameParts[0]?.charAt(1) ?? 'T';
    return `${first}${second}`.toUpperCase();
  }

  private dateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private isWeekday(date: Date): boolean {
    const day = date.getDay();
    return day >= 1 && day <= 5;
  }

  private extractStudentIncidences(userId: number, incidenciasRaw: any[]): StudentIncident[] {
    return incidenciasRaw
      .filter((incident: any) => this.resolveIncidentUserId(incident) === userId)
      .map((incident: any, index: number) => ({
        id: Number(incident.id ?? incident.Id ?? `${userId}${index}`),
        fecha: incident.fechaIncidencia ?? incident.fecha ?? incident.date ?? new Date().toISOString(),
        tipo: incident.tipoFalta ?? incident.tipo ?? 'Falta',
        justificada: Boolean(incident.esJustificada ?? incident.EsJustificada ?? false),
        comentario: incident.comentario ?? incident.Comentario ?? '',
        idAlumno: userId
      }));
  }

  private resolveIncidentUserId(incident: any): number | null {
    const candidates = [incident.idUsuario, incident.IdUsuario, incident.alumno?.idUsuario, incident.alumno?.id, incident.usuario?.id];
    for (const candidate of candidates) {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return null;
  }
}