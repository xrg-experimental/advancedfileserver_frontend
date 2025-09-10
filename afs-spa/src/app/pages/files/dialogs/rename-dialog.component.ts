import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { getNameValidationError as getNameValidationErrorUtil, isValidName as isValidNameUtil } from '../../../shared/validators/file-name.validator';

export interface RenameDialogData {
  currentName: string;
  itemType: 'file' | 'folder';
}

export interface RenameDialogResult {
  newName: string;
}

@Component({
  selector: 'app-rename-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `
    <h2 mat-dialog-title>Rename {{ data.itemType === 'file' ? 'File' : 'Folder' }}</h2>

    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ data.itemType === 'file' ? 'File' : 'Folder' }} name</mat-label>
        <input
          matInput
          [(ngModel)]="newName"
          (keyup.enter)="onConfirm()"
          #nameInput
          maxlength="255"
          required>
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
        [disabled]="!isValidName() || newName.trim() === data.currentName">
        Rename
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
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
export class RenameDialogComponent {
  newName: string;

  constructor(
    public dialogRef: MatDialogRef<RenameDialogComponent, RenameDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: RenameDialogData
  ) {
    this.newName = data.currentName;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.isValidName() && this.newName.trim() !== this.data.currentName) {
      this.dialogRef.close({ newName: this.newName.trim() });
    }
  }

  isValidName(): boolean {
    return isValidNameUtil(this.newName);
  }

  getValidationError(): string {
    return getNameValidationErrorUtil(this.newName);
  }
}
