import { Routes } from '@angular/router';
import { LoginComponent } from './core/components/login/login.component';
import { OtpComponent } from './core/components/otp/otp.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'auth/otp', 
    component: OtpComponent 
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes')
      .then(m => m.DASHBOARD_ROUTES),
    canActivate: [authGuard]
  },
  { 
    path: '**', 
    redirectTo: 'dashboard' 
  }
];
