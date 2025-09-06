import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_SNACK_BAR_DATA, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  template: `
    <div class="toast-container" [ngClass]="data.type">
      <span class="message">{{ data.message }}</span>
    </div>
  `,
  styles: [`
    .toast-container {
      display: flex;
      align-items: center;
      padding: 14px 16px;
      border-radius: 4px;
      color: white;
    }
    .success {
      background-color: #4caf50;
    }
    .error {
      background-color: #f44336;
    }
    .warning {
      background-color: #ff9800;
    }
    .info {
      background-color: #2196f3;
    }
    .message {
      margin-left: 8px;
    }
  `]
})
export class ToastComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { 
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }) {}
}