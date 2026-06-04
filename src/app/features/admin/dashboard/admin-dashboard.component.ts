import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AdminApiService } from '../../../core/services/admin-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { CourseModel } from '../../../shared/models/course.model';
import { AdminFaltaModel } from '../../../shared/models/attendance-incident.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly notify = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly courses = signal<CourseModel[]>([]);
  readonly allFaltas = signal<AdminFaltaModel[]>([]);
  readonly selectedCourseId = signal<number | null>(null);
  readonly courseFaltas = signal<AdminFaltaModel[]>([]);
  readonly loading = signal(false);

  readonly snapshot = computed(() => {
    const faltas = this.allFaltas();
    return {
      totalCursos: this.courses().length,
      totalFaltas: faltas.length,
      justificadas: faltas.filter(f => f.esJustificada).length,
      pendientes: faltas.filter(f => !f.esJustificada).length
    };
  });

  readonly pendingJustifications = computed(() =>
    this.allFaltas().filter(f => !f.esJustificada).slice(0, 6)
  );

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({ cursos: this.adminApi.getCursos(), faltas: this.adminApi.getAllFaltas() }).subscribe({
      next: ({ cursos, faltas }) => {
        this.courses.set(cursos);
        this.allFaltas.set(faltas);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  selectCourse(courseId: number | null): void {
    this.selectedCourseId.set(courseId);
    this.courseFaltas.set([]);
    if (!courseId) return;

    this.adminApi.getFaltasDeCurso(courseId).subscribe({
      next: (items) => this.courseFaltas.set(items),
      error: () => this.courseFaltas.set([])
    });
  }

  toggleJustificada(falta: AdminFaltaModel): void {
    const newVal = !falta.esJustificada;
    this.adminApi.updateJustificacion(falta.id, newVal).subscribe({
      next: () => {
        this.courseFaltas.update(list => list.map(f => f.id === falta.id ? { ...f, esJustificada: newVal } : f));
        this.allFaltas.update(list => list.map(f => f.id === falta.id ? { ...f, esJustificada: newVal } : f));
        this.notify.success(`Falta #${falta.id} ${newVal ? 'justificada' : 'marcada como no justificada'}.`);
      },
      error: () => this.notify.error('Error al actualizar la justificacion.')
    });
  }

  requestDeleteFalta(id: number): void {
    this.confirmDialog.open(
      '¿Eliminar esta incidencia? La acción no se puede deshacer.',
      () => this.deleteFalta(id)
    );
  }

  deleteFalta(id: number): void {
    this.adminApi.eliminarFalta(id).subscribe({
      next: () => {
        this.courseFaltas.update(list => list.filter(f => f.id !== id));
        this.allFaltas.update(list => list.filter(f => f.id !== id));
        this.notify.success('Incidencia eliminada.');
      },
      error: () => this.notify.error('Error al eliminar la incidencia.')
    });
  }

  trackByFalta = (_: number, falta: AdminFaltaModel) => falta.id;
  trackByCourse = (_: number, course: CourseModel) => course.idCurso;
}
