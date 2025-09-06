import { Component, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserType } from '../../models/user.model';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar color="primary" *ngIf="auth.isAuthenticated$ | async">
      <button mat-icon-button (click)="toggleSidenav.emit()">
        <mat-icon>menu</mat-icon>
      </button>
      <span>Advanced File Server</span>
      <span class="spacer"></span>
      <button mat-icon-button [matMenuTriggerFor]="profileMenu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #profileMenu="matMenu">
        <button mat-menu-item disabled>
          {{ (auth.currentUser$ | async)?.username }}
        </button>
        <button mat-menu-item (click)="logout()">
          <mat-icon>exit_to_app</mat-icon>
          <span>Logout</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    mat-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
  `]
})
export class NavBarComponent {
  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  toggleSidenav = new EventEmitter<void>();

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  protected readonly UserType = UserType;
}
