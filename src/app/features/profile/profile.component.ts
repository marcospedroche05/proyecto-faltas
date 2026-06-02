import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

import { AuthSessionService } from '../../core/auth/auth-session.service';
import { DemoAttendanceService, StudentDashboardData } from '../../core/services/demo-attendance.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly demoAttendance = inject(DemoAttendanceService);

  readonly currentRoleId = computed(() => this.authSession.getRoleId());
  readonly currentRoleLabel = computed(() => {
    switch (this.currentRoleId()) {
      case 1:
        return 'Profesor';
      case 2:
        return 'Alumno';
      case 3:
        return 'Administrador';
      default:
        return 'Visitante';
    }
  });

  readonly profile = computed<StudentDashboardData>(() => {
    const sessionUserName = this.authSession.session()?.userName ?? null;
    return this.demoAttendance.getStudentDashboard(sessionUserName);
  });

  readonly latestIncident = computed(() => {
    const incidents = [...this.profile().incidencias].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    return incidents[0] ?? null;
  });

  readonly lastJustified = computed(() => this.profile().incidencias.filter((incident) => incident.justificada).length);
  readonly lastUnjustified = computed(() => this.profile().incidencias.filter((incident) => !incident.justificada).length);

  trackByIncident = (_index: number, incident: { id: number }) => incident.id;

  imageFallback(): string {
    return this.profile().avatar;
  }

  isStudent(): boolean {
    return this.currentRoleId() === 2;
  }
}
