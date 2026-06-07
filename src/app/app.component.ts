import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthSessionService } from './core/auth/auth-session.service';
import { ThemeService } from './core/services/theme.service';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { ToastContainerComponent } from './shared/toast/toast-container.component';
import { environment } from '../environments/environment';

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

  readonly avatarImagenFailed = signal(false);

  readonly avatarImagen = computed(() => {
    const img = this.authSession.getUserImagen();
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return `${environment.apiBaseUrl}/${img}`;
  });

  readonly avatarInitials = computed(() => {
    const name = this.currentUserName();
    const parts = name.split(' ').filter(Boolean);
    const first = parts[0]?.charAt(0) ?? 'U';
    const second = parts[1]?.charAt(0) ?? parts[0]?.charAt(1) ?? '';
    return `${first}${second}`.toUpperCase();
  });

  onAvatarImageError(): void {
    this.avatarImagenFailed.set(true);
  }

  toggleTheme(): void { this.theme.toggle(); }

  logout(): void {
    this.authSession.clear();
    this.router.navigateByUrl('/login');
  }
}
