import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthSessionService } from '../auth/auth-session.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authSession = inject(AuthSessionService);
    const router = inject(Router);
    const role = authSession.getRole();

    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return router.createUrlTree([authSession.redirectPathForRole(role)]);
  };
};
