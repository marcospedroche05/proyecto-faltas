import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';

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
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.authSession.setSession(response.accessToken, response.user);
        this.router.navigateByUrl(this.authSession.redirectPathForRole(response.user.role));
      },
      error: () => {
        this.errorMessage = 'Credenciales incorrectas o usuario inactivo.';
      }
    });
  }
}
