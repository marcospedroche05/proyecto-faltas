import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthSessionService } from './core/auth/auth-session.service';
import { ThemeService } from './core/services/theme.service';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { ToastContainerComponent } from './shared/toast/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ToastContainerComponent, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'proyecto-faltas';

  private readonly authSession = inject(AuthSessionService);
  private readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  readonly isDark = this.theme.isDark;
  readonly session = this.authSession.session;
  readonly isAuthenticated = this.authSession.isAuthenticated;
  readonly currentUserName = computed(() => this.authSession.getUserDisplayName());
  readonly currentRoleLabel = computed(() => this.authSession.getRole() ?? 'Visitante');
  readonly dashboardPath = computed(() => this.authSession.redirectPathForRole(this.authSession.getRole()));

  toggleTheme(): void { this.theme.toggle(); }

  logout(): void {
    this.authSession.clear();
    this.router.navigateByUrl('/login');
  }
}
