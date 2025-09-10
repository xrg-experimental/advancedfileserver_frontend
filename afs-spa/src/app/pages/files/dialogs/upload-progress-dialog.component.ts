import {Component, Inject, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { Observable, Subscription } from 'rxjs';
import { OperationProgress } from '../../../core/models/file.model';

export interface UploadProgressDialogData {
  uploadProgress$: Observable<OperationProgress[]>;
  onCancel?: (operationId: string) => void;
}

@Component({
  selector: 'app-upload-progress-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatListModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>cloud_upload</mat-icon>
      File Upload Progress
    </h2>

    <mat-dialog-content>
      <div class="upload-progress-container">
        <!-- Overall progress summary -->
        <div class="overall-progress" *ngIf="uploadProgresses.length > 1">
          <h3>Overall Progress: {{ completedCount }} of {{ uploadProgresses.length }} files</h3>
          <mat-progress-bar
            mode="determinate"
            [value]="overallProgress"
            color="primary">
          </mat-progress-bar>
          <p class="progress-text">{{ overallProgress }}% complete</p>
        </div>

        <!-- Individual file progress -->
        <div class="file-progress-list">
          <mat-list>
            <mat-list-item *ngFor="let progress of uploadProgresses; trackBy: trackByOperationId">
              <mat-icon matListItemIcon [class]="getStatusIconClass(progress.status)">
                {{ getStatusIcon(progress.status) }}
              </mat-icon>

              <div matListItemTitle>{{ progress.fileName }}</div>

              <div matListItemLine class="progress-details">
                <div class="progress-info">
                  <span class="status-text">{{ getStatusText(progress) }}</span>
                  <span class="size-info" *ngIf="progress.totalBytes">
                    {{ formatFileSize(progress.bytesTransferred || 0) }} /
                    {{ formatFileSize(progress.totalBytes) }}
                  </span>
                </div>

                <mat-progress-bar
                  *ngIf="progress.status === 'in-progress' || progress.status === 'pending'"
                  mode="determinate"
                  [value]="progress.progress"
                  [color]="getProgressBarColor(progress.status)">
                </mat-progress-bar>

                <div class="time-estimate" *ngIf="progress.estimatedTimeRemaining && progress.status === 'in-progress'">
                  Estimated time remaining: {{ formatTime(progress.estimatedTimeRemaining) }}
                </div>

                <div class="error-message" *ngIf="progress.status === 'error' && progress.error">
                  {{ progress.error }}
                </div>
              </div>

              <button
                mat-icon-button
                matListItemMeta
                *ngIf="canCancelOperation(progress)"
                (click)="cancelUpload(progress.id)"
                aria-label="Cancel upload"
                color="warn"
              >
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-list-item>
          </mat-list>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button
        mat-button
        *ngIf="hasActiveUploads"
        (click)="cancelAllUploads()"
        color="warn"
      >
        Cancel All
      </button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="hasActiveUploads"
        (click)="onClose()"
      >
        {{ hasActiveUploads ? 'Uploading...' : 'Close' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .upload-progress-container {
      min-width: 500px;
      max-width: 700px;
      max-height: 400px;
      overflow-y: auto;
    }

    .overall-progress {
      margin-bottom: 24px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .overall-progress h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 500;
    }

    .progress-text {
      margin: 8px 0 0 0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }

    .file-progress-list {
      margin-top: 16px;
    }

    .progress-details {
      width: 100%;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .status-text {
      font-weight: 500;
      font-size: 12px;
    }

    .size-info {
      font-size: 11px;
      color: #666;
    }

    .time-estimate {
      font-size: 11px;
      color: #666;
      margin-top: 4px;
    }

    .error-message {
      color: #c62828;
      font-size: 11px;
      margin-top: 4px;
      font-weight: 500;
    }

    .status-icon-pending {
      color: #ff9800;
    }

    .status-icon-in-progress {
      color: #2196f3;
    }

    .status-icon-completed {
      color: #4caf50;
    }

    .status-icon-error {
      color: #f44336;
    }

    .status-icon-cancelled {
      color: #9e9e9e;
    }

    mat-list-item {
      border-bottom: 1px solid #eee;
      min-height: 80px;
    }

    mat-list-item:last-child {
      border-bottom: none;
    }

    mat-progress-bar {
      margin: 4px 0;
    }
  `]
})
export class UploadProgressDialogComponent implements OnInit, OnDestroy {
  uploadProgresses: OperationProgress[] = [];
  private subscription?: Subscription;

  constructor(
    public dialogRef: MatDialogRef<UploadProgressDialogComponent>,
    private cdr: ChangeDetectorRef,
  @Inject(MAT_DIALOG_DATA) public data: UploadProgressDialogData
  ) {}

  ngOnInit(): void {
    if (!this.data.uploadProgress$) {
      return;
    }
    this.subscription = this.data.uploadProgress$.subscribe(progresses => {
      this.uploadProgresses = progresses;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get completedCount(): number {
    return this.uploadProgresses.filter(p =>
      p.status === 'completed' || p.status === 'error' || p.status === 'cancelled'
    ).length;
  }

  get overallProgress(): number {
    if (this.uploadProgresses.length === 0) return 0;

    const totalProgress = this.uploadProgresses.reduce((sum, progress) => sum + progress.progress, 0);
    return Math.round(totalProgress / this.uploadProgresses.length);
  }

  get hasActiveUploads(): boolean {
    return this.uploadProgresses.some(p =>
      p.status === 'pending' || p.status === 'in-progress'
    );
  }

  trackByOperationId(_: number, progress: OperationProgress): string {
    return progress.id;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return 'schedule';
      case 'in-progress': return 'cloud_upload';
      case 'completed': return 'check_circle';
      case 'error': return 'error';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  }

  getStatusIconClass(status: string): string {
    return `status-icon-${status}`;
  }

  getStatusText(progress: OperationProgress): string {
    switch (progress.status) {
      case 'pending': return 'Waiting...';
      case 'in-progress': return `Uploading... ${progress.progress}%`;
      case 'completed': return 'Completed';
      case 'error': return 'Failed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  }

  getProgressBarColor(status: string): string {
    switch (status) {
      case 'in-progress': return 'primary';
      case 'pending': return 'accent';
      default: return 'primary';
    }
  }

  canCancelOperation(progress: OperationProgress): boolean {
    return progress.status === 'pending' || progress.status === 'in-progress';
  }

  cancelUpload(operationId: string): void {
    if (this.data.onCancel) {
      this.data.onCancel(operationId);
    }
  }

  cancelAllUploads(): void {
    if (this.data.onCancel) {
      this.uploadProgresses
        .filter(p => this.canCancelOperation(p))
        .forEach(p => this.data.onCancel!(p.id));
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
