import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DeleteConfirmationDialogData {
  itemName: string;
  itemType: 'file' | 'folder';
}

@Component({
  selector: 'app-delete-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    A11yModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn">warning</mat-icon>
      Confirm Delete
    </h2>

    <mat-dialog-content>
      <p>Are you sure you want to delete the {{ data.itemType }} <strong>"{{ data.itemName }}"</strong>?</p>

      <div class="warning-message" *ngIf="data.itemType === 'folder'">
        <mat-icon color="warn">info</mat-icon>
        <span>This will permanently delete the folder and all its contents.</span>
      </div>

      <p class="permanent-warning">This action cannot be undone.</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" cdkFocusInitial>Cancel</button>
      <button
        mat-raised-button
        color="warn"
        (click)="onConfirm()"
        [attr.aria-label]="'Delete ' + data.itemType + ' ' + data.itemName">
        <mat-icon>delete</mat-icon>
        Delete
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .warning-message {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      padding: 12px;
      margin: 16px 0;
      color: #856404;
    }

    .permanent-warning {
      font-weight: 500;
      color: #d32f2f;
      margin-top: 16px;
      margin-bottom: 0;
    }

    mat-dialog-content {
      min-width: 350px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmationDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteConfirmationDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
