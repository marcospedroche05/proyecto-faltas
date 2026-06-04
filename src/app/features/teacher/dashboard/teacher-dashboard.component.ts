import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { TeacherApiService, CreateFaltaRequest } from '../../../core/services/teacher-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { CourseModel } from '../../../shared/models/course.model';
import { AlumnoModel, AttendanceIncidentModel, AttendanceType } from '../../../shared/models/attendance-incident.model';

export type AttendanceMark = 'presente' | 'falta' | 'retraso' | 'salida';

export const attendanceMarkLabels: Record<AttendanceMark, string> = {
  presente: 'Presente',
  falta: 'Falta',
  retraso: 'Retraso',
  salida: 'Salida de antes'
};

export const attendanceTypeForMark: Record<Exclude<AttendanceMark, 'presente'>, AttendanceType> = {
  falta: 'Falta',
  retraso: 'Retraso',
  salida: 'Salida de antes'
};

export interface RosterStudent {
  id: number;
  nombre: string;
  email: string;
  estado: AttendanceMark;
  comentario?: string;
}

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.scss'
})
export class TeacherDashboardComponent implements OnInit {
  private readonly teacherApi = inject(TeacherApiService);
  private readonly notify = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly courses = signal<CourseModel[]>([]);
  readonly activeCourseId = signal<number | null>(null);
  readonly students = signal<RosterStudent[]>([]);
  readonly historial = signal<AttendanceIncidentModel[]>([]);
  readonly loading = signal(true);

  readonly activeCourse = computed(() => this.courses().find(c => c.idCurso === this.activeCourseId()) ?? null);
  readonly attendanceMarks: AttendanceMark[] = ['presente', 'falta', 'retraso', 'salida'];
  readonly markLabels = attendanceMarkLabels;

  readonly activeStats = computed(() => {
    const s = this.students();
    return {
      total: s.length,
      presentes: s.filter(st => st.estado === 'presente').length,
      faltas: s.filter(st => st.estado === 'falta').length,
      retrasos: s.filter(st => st.estado === 'retraso').length,
      salidas: s.filter(st => st.estado === 'salida').length
    };
  });

  readonly currentHistory = computed(() => this.historial().slice(0, 6));

  ngOnInit(): void {
    this.teacherApi.getMisCursos().subscribe({
      next: (courses) => {
        this.courses.set(courses);
        if (courses.length > 0) {
          this.selectCourse(courses[0].idCurso);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading teacher courses', err);
        this.loading.set(false);
      }
    });
  }

  selectCourse(courseId: number): void {
    this.activeCourseId.set(courseId);

    this.teacherApi.getAlumnosDeCurso(courseId).subscribe({
      next: (alumnos) => {
        this.students.set(alumnos.map(a => ({
          id: a.idUsuario,
          nombre: `${a.nombre} ${a.apellidos}`.trim(),
          email: a.email,
          estado: 'presente' as AttendanceMark
        })));
      },
      error: () => this.students.set([])
    });

    this.teacherApi.getFaltasDeCurso(courseId).subscribe({
      next: (faltas) => this.historial.set(faltas),
      error: () => this.historial.set([])
    });
  }

  markStudent(studentId: number, state: AttendanceMark): void {
    this.students.update(list => list.map(s => s.id === studentId ? { ...s, estado: state } : s));
  }

  markAll(state: AttendanceMark): void {
    this.students.update(list => list.map(s => ({ ...s, estado: state })));
    this.notify.info(`Se ha marcado a todo el grupo como ${attendanceMarkLabels[state].toLowerCase()}.`);
  }

  setComment(studentId: number, comentario: string | null | undefined): void {
    this.students.update(list => list.map(s =>
      s.id === studentId ? { ...s, comentario: comentario?.trim() || undefined } : s
    ));
  }

  saveAttendance(): void {
    const courseId = this.activeCourseId();
    if (!courseId) return;

    const pending = this.students().filter(s => s.estado !== 'presente');
    if (!pending.length) {
      this.notify.info('No había incidencias pendientes para registrar.');
      return;
    }

    let saved = 0;
    let errors = 0;

    pending.forEach(student => {
      const request: CreateFaltaRequest = {
        idUsuario: student.id,
        idCurso: courseId,
        fechaIncidencia: new Date().toISOString(),
        tipoFalta: attendanceTypeForMark[student.estado as Exclude<AttendanceMark, 'presente'>],
        comentario: student.comentario || null
      };

      this.teacherApi.crearFalta(request).subscribe({
        next: () => {
          saved++;
          if (saved + errors === pending.length) {
            this.notify.success(`Se han registrado ${saved} incidencias.${errors > 0 ? ` ${errors} fallaron.` : ''}`);
            this.selectCourse(courseId);
          }
        },
        error: () => {
          errors++;
          if (saved + errors === pending.length) {
            this.notify.error(`Se han registrado ${saved} incidencias. ${errors} fallaron.`);
          }
        }
      });
    });
  }

  requestDeleteFalta(id: number): void {
    this.confirmDialog.open(
      '¿Eliminar esta incidencia? La acción no se puede deshacer.',
      () => this.deleteFalta(id)
    );
  }

  deleteFalta(id: number): void {
    this.teacherApi.eliminarFalta(id).subscribe({
      next: () => {
        this.historial.update(list => list.filter(f => f.id !== id));
        this.notify.success('Incidencia eliminada.');
      },
      error: () => this.notify.error('Error al eliminar la incidencia.')
    });
  }

  trackByCourse = (_index: number, course: CourseModel) => course.idCurso;
  trackByStudent = (_index: number, student: RosterStudent) => student.id;
  trackByHistory = (_index: number, incident: AttendanceIncidentModel) => incident.id;

  markTone(state: AttendanceMark): string {
    switch (state) {
      case 'falta': return 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100';
      case 'retraso': return 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100';
      case 'salida': return 'border-cyan-300 bg-cyan-50 text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-100';
      default: return 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100';
    }
  }
}
