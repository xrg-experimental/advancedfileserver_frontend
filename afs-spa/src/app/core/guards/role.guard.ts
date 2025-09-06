import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';
import { UserType } from '../models/user.model';

export const roleGuard = (allowedTypes: UserType[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user && allowedTypes.includes(user.userType)) {
          return true;
        }
        return router.createUrlTree(['/dashboard']);
      })
    );
  };
};
