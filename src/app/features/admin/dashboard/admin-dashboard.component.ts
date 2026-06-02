import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DemoAttendanceService } from '../../../core/services/demo-attendance.service';
import { TajamarApiService } from '../../../core/services/tajamar-api.service';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  private readonly demoAttendance = inject(DemoAttendanceService);
  private readonly api = inject(TajamarApiService);

  readonly snapshot = computed(() => this.demoAttendance.getAdminSnapshot());
  readonly pendingJustifications = computed(() => this.demoAttendance.getPendingJustifications().slice(0, 6));

  readonly courses = signal<any[]>([]);
  readonly selectedCourseId = signal<number | null>(null);
  readonly incidencias = signal<any[]>([]);

  constructor() {
    // load available courses for admin
    this.api.getCourses().subscribe({ next: (cs) => this.courses.set(cs || []) , error: () => this.courses.set([]) });
  }

  selectCourse(courseId: number | null) {
    this.selectedCourseId.set(courseId);
    this.incidencias.set([]);
    if (!courseId) return;
    this.api.getIncidenciasByCurso(courseId).subscribe({
      next: (items) => this.incidencias.set(items || []),
      error: (err) => {
        console.error('Error loading incidencias for course', err);
        this.incidencias.set([]);
      }
    });
  }

  toggleJustificada(inc: any) {
    const newVal = !inc.esJustificada && inc.esJustificada !== true ? true : !inc.esJustificada;
    this.api.updateIncidencia(inc.id, { EsJustificada: newVal }).subscribe({
      next: () => {
        // update local view
        this.incidencias.update((list) => list.map(i => i.id === inc.id ? { ...i, esJustificada: newVal } : i));
      },
      error: (err) => console.error('Error updating incidencia', err)
    });
  }

  trackByIncidente = (_: number, inc: any) => inc.id;
}