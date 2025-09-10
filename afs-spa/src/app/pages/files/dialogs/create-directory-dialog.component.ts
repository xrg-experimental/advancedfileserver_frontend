import { Component, ChangeDetectionStrategy } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { getNameValidationError as getNameValidationErrorUtil, isValidName as isValidNameUtil } from '../../../shared/validators/file-name.validator';

export interface CreateDirectoryDialogResult {
  directoryName: string;
}

@Component({
  selector: 'app-create-directory-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    A11yModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>create_new_folder</mat-icon>
      Create New Folder
    </h2>

    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Folder name</mat-label>
        <input
          matInput
          [(ngModel)]="directoryName"
          (keyup.enter)="onConfirm()"
          #nameInput
          maxlength="255"
          placeholder="Enter folder name"
          required
          cdkFocusInitial>
        <mat-error *ngIf="!isValidName()">
          {{ getValidationError() }}
        </mat-error>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onConfirm()"
        [disabled]="!isValidName()">
        <mat-icon>create_new_folder</mat-icon>
        Create
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-content {
      min-width: 300px;
      padding-top: 16px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateDirectoryDialogComponent {
  directoryName = '';

  constructor(
    public dialogRef: MatDialogRef<CreateDirectoryDialogComponent, CreateDirectoryDialogResult>
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.isValidName()) {
      this.dialogRef.close({ directoryName: this.directoryName.trim() });
    }
  }

  isValidName(): boolean {
    return isValidNameUtil(this.directoryName, { label: 'Folder name', forbidDotsOnly: true });
  }

  getValidationError(): string {
    return getNameValidationErrorUtil(this.directoryName, { label: 'Folder name', forbidDotsOnly: true });
  }
}
