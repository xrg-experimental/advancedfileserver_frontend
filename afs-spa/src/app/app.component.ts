import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavBarComponent } from './core/components/layout/nav-bar.component';
import { SideNavComponent } from './core/components/layout/side-nav.component';
import { FooterComponent } from './core/components/layout/footer.component';
import { AuthService } from './core/services/auth.service';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    NavBarComponent,
    SideNavComponent,
    FooterComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
