import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, UserType } from '../../models/user.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  visibleFor: UserType[];
}

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <mat-nav-list>
      <ng-container *ngFor="let item of visibleNavItems">
        <a mat-list-item [routerLink]="item.route">
          <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
          <span matListItemTitle>{{ item.label }}</span>
        </a>
      </ng-container>
    </mat-nav-list>
  `,
  styles: [`
    mat-nav-list {
      padding-top: 0;
    }
  `]
})
export class SideNavComponent {
  navItems: NavItem[] = [
    {
      label: 'Files',
      icon: 'folder',
      route: '/dashboard/files',
      visibleFor: [UserType.INTERNAL, UserType.EXTERNAL, UserType.ADMIN]
    },
    {
      label: 'Shared',
      icon: 'share',
      route: '/dashboard/shared',
      visibleFor: [UserType.INTERNAL, UserType.EXTERNAL, UserType.ADMIN]
    },
    {
      label: 'Groups',
      icon: 'group',
      route: '/dashboard/groups',
      visibleFor: [UserType.ADMIN]
    },
    {
      label: 'Users',
      icon: 'people',
      route: '/dashboard/users',
      visibleFor: [UserType.ADMIN]
    },
    {
      label: 'Sessions',
      icon: 'settings_applications',
      route: '/dashboard/sessions',
      visibleFor: [UserType.ADMIN]
    }
  ];

  visibleNavItems: NavItem[] = [];

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe((user: User) => {
      if (user) {
        this.visibleNavItems = this.navItems.filter(item =>
          item.visibleFor.includes(user.userType)
        );
      }
    });
  }
}
