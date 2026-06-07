import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { StudentApiService } from '../../../core/services/student-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AttendanceIncidentModel } from '../../../shared/models/attendance-incident.model';
import { CourseModel } from '../../../shared/models/course.model';
import { calcularPorcentajeAsistencia } from '../../../shared/utils/attendance.utils';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss'
})
export class StudentDashboardComponent implements OnInit {
  private readonly authSession = inject(AuthSessionService);
  private readonly studentApi = inject(StudentApiService);
  private readonly notify = inject(NotificationService);

  readonly userName = computed(() => this.authSession.getUserDisplayName());
  readonly userEmail = computed(() => this.authSession.getUser()?.email ?? '');

  readonly cursos = signal<CourseModel[]>([]);
  readonly incidencias = signal<AttendanceIncidentModel[]>([]);
  readonly loading = signal(true);

  readonly summary = computed(() => {
    const inc = this.incidencias();
    const faltas = inc.filter(i => i.tipoFalta === 'Falta').length;
    const retrasos = inc.filter(i => i.tipoFalta === 'Retraso').length;
    const salidas = inc.filter(i => i.tipoFalta === 'Salida de antes').length;
    const justificadas = inc.filter(i => i.esJustificada).length;
    const noJustificadas = inc.length - justificadas;
    const curso = this.cursos()[0];
    const asistencia = curso
      ? calcularPorcentajeAsistencia(inc, curso.fechaInicio, curso.fechaFin)
      : 100;
    return { total: inc.length, faltas, retrasos, salidas, justificadas, noJustificadas, asistencia };
  });

  readonly progressStyle = computed(() => ({
    background: `conic-gradient(#22d3ee ${this.summary().asistencia}%, rgba(148, 163, 184, 0.15) 0)`
  }));

  readonly cursoActual = computed(() => {
    const c = this.cursos();
    return c.length > 0 ? c[0].nombre : 'Sin curso asignado';
  });

  readonly chartData = computed(() => {
    const incidents = [...this.incidencias()].sort(
      (a, b) => new Date(a.fechaIncidencia).getTime() - new Date(b.fechaIncidencia).getTime()
    );
    if (!incidents.length) return null;

    // Agrupar por semana (lunes como inicio)
    const weekMap = new Map<string, number>();
    for (const inc of incidents) {
      const d = new Date(inc.fechaIncidencia);
      const day = d.getDay() || 7;
      const monday = new Date(d);
      monday.setDate(d.getDate() - day + 1);
      monday.setHours(0, 0, 0, 0);
      const key = monday.toISOString().slice(0, 10);
      weekMap.set(key, (weekMap.get(key) ?? 0) + 1);
    }

    const sorted = [...weekMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10);

    const counts = sorted.map(([, n]) => n);
    const labels = sorted.map(([key]) => {
      const d = new Date(key);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    const maxCount = Math.max(...counts, 1);
    const n = sorted.length;

    // SVG: viewBox "0 0 400 120", área útil x[24..380] y[10..85]
    const LEFT = 24, RIGHT = 380, TOP = 10, BOTTOM = 85;
    const xStep = n > 1 ? (RIGHT - LEFT) / (n - 1) : 0;

    const dotPoints = counts.map((count, i) => ({
      x: +(LEFT + i * xStep).toFixed(1),
      y: +(BOTTOM - (count / maxCount) * (BOTTOM - TOP)).toFixed(1)
    }));

    const linePoints = dotPoints.map(p => `${p.x},${p.y}`).join(' ');
    const areaPoints = [
      `${LEFT},${BOTTOM}`,
      ...dotPoints.map(p => `${p.x},${p.y}`),
      `${n > 1 ? RIGHT : LEFT},${BOTTOM}`
    ].join(' ');

    return { dotPoints, points: linePoints, areaPoints, labels, maxCount };
  });

  ngOnInit(): void {
    this.studentApi.getMisFaltasCompleto().subscribe({
      next: (data) => {
        this.incidencias.set(data.faltas);
        const u = data.usuario;
        this.cursos.set(u?.idCurso ? [{
          idCurso: u.idCurso,
          nombre: u.curso,
          fechaInicio: u.fechaInicioCurso,
          fechaFin: u.fechaFinCurso,
          activo: true
        }] : []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading student data', err);
        this.notify.error('Error al cargar los datos. Por favor, recarga la página.');
        this.loading.set(false);
      }
    });
  }

  trackByIncident = (_index: number, incident: AttendanceIncidentModel) => incident.id;
  trackByIndex = (index: number) => index;

  incidentTone(isJustified: boolean): string {
    return isJustified
      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100'
      : 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100';
  }

  typeTone(type: string): string {
    switch (type) {
      case 'Retraso': return 'text-amber-600 dark:text-amber-200';
      case 'Salida de antes': return 'text-cyan-600 dark:text-cyan-200';
      default: return 'text-rose-600 dark:text-rose-100';
    }
  }
}
