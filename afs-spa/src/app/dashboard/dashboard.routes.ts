import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';
import { UserType } from '../core/models/user.model';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'files',
        loadComponent: () => import('../pages/files/files.component')
          .then(m => m.FilesComponent),
        canActivate: [authGuard]
      },
      {
        path: 'shared',
        loadComponent: () => import('../pages/shared/shared.component')
          .then(m => m.SharedComponent),
        canActivate: [authGuard]
      },
      {
        path: 'groups',
        loadComponent: () => import('../pages/groups/groups.component')
          .then(m => m.GroupsComponent),
        canActivate: [authGuard, roleGuard([UserType.ADMIN])]
      },
      {
        path: 'users',
        loadComponent: () => import('../pages/users/users.component')
          .then(m => m.UsersComponent),
        canActivate: [authGuard, roleGuard([UserType.ADMIN])]
      },
      {
        path: 'sessions',
        loadComponent: () => import('../pages/sessions/sessions.component')
          .then(m => m.SessionsComponent),
        canActivate: [authGuard, roleGuard([UserType.ADMIN])]
      },
      {
        path: '',
        redirectTo: 'files',
        pathMatch: 'full'
      }
    ]
  }
];
