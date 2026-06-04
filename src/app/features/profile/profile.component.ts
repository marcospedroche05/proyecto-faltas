import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { AuthSessionService } from '../../core/auth/auth-session.service';
import { StudentApiService } from '../../core/services/student-api.service';
import { AttendanceIncidentModel, AttendanceSummaryModel } from '../../shared/models/attendance-incident.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly authSession = inject(AuthSessionService);
  private readonly studentApi = inject(StudentApiService);

  readonly currentRole = computed(() => this.authSession.getRole() ?? 'Visitante');
  readonly userName = computed(() => this.authSession.getUserDisplayName());
  readonly userEmail = computed(() => this.authSession.getUser()?.email ?? '');

  readonly incidencias = signal<AttendanceIncidentModel[]>([]);
  readonly resumen = signal<AttendanceSummaryModel[]>([]);

  readonly avatar = computed(() => {
    const name = this.userName();
    const parts = name.split(' ').filter(Boolean);
    const first = parts[0]?.charAt(0) ?? 'U';
    const second = parts[1]?.charAt(0) ?? parts[0]?.charAt(1) ?? '';
    return `${first}${second}`.toUpperCase();
  });

  readonly summary = computed(() => {
    const inc = this.incidencias();
    return {
      total: inc.length,
      justificadas: inc.filter(i => i.esJustificada).length,
      noJustificadas: inc.filter(i => !i.esJustificada).length
    };
  });

  readonly latestIncident = computed(() => {
    const sorted = [...this.incidencias()].sort((a, b) =>
      new Date(b.fechaIncidencia).getTime() - new Date(a.fechaIncidencia).getTime()
    );
    return sorted[0] ?? null;
  });

  readonly asistenciaMedia = computed(() => {
    const r = this.resumen();
    if (r.length === 0) return null;
    return Math.round(r.reduce((acc, x) => acc + x.porcentajeAsistencia, 0) / r.length * 10) / 10;
  });

  readonly racha = computed(() => {
    if (!this.isStudent()) return 0;

    const incidents = this.incidencias();
    if (!incidents.length) return 31;

    const lastDate = new Date(
      Math.max(...incidents.map(i => new Date(i.fechaIncidencia).getTime()))
    );
    lastDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    const current = new Date(lastDate);
    current.setDate(current.getDate() + 1); // empezar el día siguiente a la última falta

    while (current <= today && streak < 31) {
      const dow = current.getDay(); // 0=dom, 6=sab
      if (dow !== 0 && dow !== 6) {
        streak++;
      }
      current.setDate(current.getDate() + 1);
    }

    return streak;
  });

  readonly rachaStyle = computed(() => {
    const days = Math.min(this.racha(), 31);
    const pct = days / 31;
    const hue = Math.round(160 - pct * 160);
    return {
      width: `${Math.round(pct * 100)}%`,
      background: `hsl(${hue}, 78%, 48%)`
    };
  });

  ngOnInit(): void {
    if (this.isStudent()) {
      this.studentApi.getMisFaltas().subscribe({
        next: (faltas) => this.incidencias.set(faltas),
        error: () => this.incidencias.set([])
      });
      this.studentApi.getResumenAsistencia().subscribe({
        next: (resumen) => this.resumen.set(resumen),
        error: () => this.resumen.set([])
      });
    }
  }

  isStudent(): boolean {
    return this.currentRole() === 'Alumno';
  }

  trackByIncident = (_index: number, incident: AttendanceIncidentModel) => incident.id;
}
