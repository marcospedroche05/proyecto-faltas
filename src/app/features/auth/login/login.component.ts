import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap, map } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { LoginUserDto } from '../../../shared/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly authSession: AuthSessionService,
    private readonly router: Router
  ) {}

  submit(): void {
    this.errorMessage = '';
    this.authService.login({ userName: this.email, password: this.password }).pipe(
      switchMap(loginResp =>
        this.authService.getProfileWithToken(loginResp.response).pipe(
          map(profile => ({ token: loginResp.response, profile }))
        )
      )
    ).subscribe({
      next: ({ token, profile }) => {
        const dto = profile.usuario;
        const user: LoginUserDto = {
          id: dto.idUsuario,
          nombre: dto.nombre,
          apellidos: dto.apellidos,
          email: dto.email,
          role: this.normalizeRole(dto.role),
          imagen: dto.imagen
        };
        this.authSession.setSession(token, user);
        this.router.navigateByUrl(this.authSession.redirectPathForRole(user.role));
      },
      error: () => {
        this.errorMessage = 'Credenciales incorrectas o usuario inactivo.';
      }
    });
  }

  private normalizeRole(role: string): string {
    const roles: Record<string, string> = {
      ADMINISTRADOR: 'Administrador',
      PROFESOR: 'Profesor',
      ALUMNO: 'Alumno'
    };
    return roles[role] ?? role;
  }
}
