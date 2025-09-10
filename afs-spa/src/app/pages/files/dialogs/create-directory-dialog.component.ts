import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

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
    MatIconModule
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
  `]
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
    const trimmed = this.directoryName?.trim();
    if (!trimmed) {
      return false;
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(trimmed)) {
      return false;
    }

    // Check for reserved names (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    if (reservedNames.test(trimmed)) {
      return false;
    }

    // Check for names that are just dots
    if (/^\.+$/.test(trimmed)) {
      return false;
    }

    return true;
  }

  getValidationError(): string {
    const trimmed = this.directoryName?.trim();
    
    if (!trimmed) {
      return 'Folder name cannot be empty';
    }

    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(trimmed)) {
      return 'Name contains invalid characters: < > : " / \\ | ? *';
    }

    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    if (reservedNames.test(trimmed)) {
      return 'This name is reserved by the system';
    }

    if (/^\.+$/.test(trimmed)) {
      return 'Folder name cannot be only dots';
    }

    return '';
  }
}