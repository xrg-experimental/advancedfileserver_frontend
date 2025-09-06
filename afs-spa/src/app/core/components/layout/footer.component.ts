import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SystemStatusService } from '../../services/system-status.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatToolbarModule],
  template: `
    <mat-toolbar class="footer">
      <span>
        System Status:
        <span
          [ngClass]="{
            'status-online': (systemStatus$ | async)?.status === 'Online',
            'status-offline': (systemStatus$ | async)?.status === 'Offline',
            'status-degraded': (systemStatus$ | async)?.status === 'Degraded'
          }"
        >
          {{ (systemStatus$ | async)?.status }}
        </span>
      </span>
      <span class="spacer"></span>
      <span>© 2024 Advanced File Server</span>
    </mat-toolbar>
  `,
  styles: [`
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 48px;
      background: #f5f5f5;
      color: rgba(0,0,0,0.87);
      font-size: 14px;
      z-index: 1000;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .status-online {
      color: green;
      font-weight: bold;
    }
    .status-offline {
      color: red;
      font-weight: bold;
    }
    .status-degraded {
      color: orange;
      font-weight: bold;
    }
  `]
})
export class FooterComponent {
  systemStatus$: Observable<any>;

  constructor(private systemStatusService: SystemStatusService) {
    this.systemStatus$ = this.systemStatusService.status$;
  }
}
