import { Injectable, computed, signal } from '@angular/core';

import { AuthSession, LoginUserDto } from '../../shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly tokenKey = 'tajamar.jwt';
  private readonly userKey = 'tajamar.user';
  private readonly sessionSignal = signal<AuthSession | null>(this.restoreSession());

  readonly session = computed(() => this.sessionSignal());
  readonly isAuthenticated = computed(() => Boolean(this.sessionSignal()));

  setSession(token: string, user: LoginUserDto): void {
    const session: AuthSession = { token, user };
    this.sessionSignal.set(session);
    sessionStorage.setItem(this.tokenKey, token);
    sessionStorage.setItem(this.userKey, JSON.stringify(user));
  }

  clear(): void {
    this.sessionSignal.set(null);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return this.sessionSignal()?.token ?? sessionStorage.getItem(this.tokenKey);
  }

  getUser(): LoginUserDto | null {
    return this.sessionSignal()?.user ?? this.restoreUser();
  }

  getRole(): string | null {
    return this.getUser()?.role ?? null;
  }

  getUserId(): number | null {
    return this.getUser()?.id ?? null;
  }

  getUserDisplayName(): string {
    const user = this.getUser();
    if (!user) return 'Invitado';
    return `${user.nombre} ${user.apellidos}`.trim() || user.email;
  }

  getUserImagen(): string | null {
    return this.getUser()?.imagen ?? null;
  }

  redirectPathForRole(role: string | null): string {
    switch (role) {
      case 'Profesor':
        return '/teacher';
      case 'Alumno':
        return '/student';
      case 'Administrador':
        return '/admin';
      default:
        return '/login';
    }
  }

  private restoreSession(): AuthSession | null {
    const token = sessionStorage.getItem(this.tokenKey);
    const user = this.restoreUser();
    if (!token || !user) return null;
    return { token, user };
  }

  private restoreUser(): LoginUserDto | null {
    const raw = sessionStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LoginUserDto;
    } catch {
      return null;
    }
  }
}
