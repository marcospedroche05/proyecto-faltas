import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthSessionService } from '../auth/auth-session.service';
import { NotificationService } from '../../core/services/notification.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const notify = inject(NotificationService);
  const token = authSession.getToken();

  const outgoing = (!token || request.headers.has('Authorization'))
    ? request
    : request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(outgoing).pipe(
    catchError(error => {
      if (error.status === 401) {
        authSession.clear();
        router.navigateByUrl('/login');
      } else if (error.status >= 500) {
        notify.error('Error del servidor. Por favor, inténtalo de nuevo.');
      }
      return throwError(() => error);
    })
  );
};
