import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthSessionService } from '../auth/auth-session.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authSession = inject(AuthSessionService);
  const token = authSession.getToken();
  // Debug logging to verify header attachment in-browser
  try {
    // mask token for logs
    const masked = token ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : null;
    console.log('[authInterceptor] request to', request.url, 'hasAuthorization?', request.headers.has('Authorization'), 'tokenPresent?', !!token, 'tokenMask=', masked);
  } catch {}

  if (!token || request.headers.has('Authorization')) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};