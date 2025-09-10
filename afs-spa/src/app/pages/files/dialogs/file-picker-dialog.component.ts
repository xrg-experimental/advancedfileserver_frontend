import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface FilePickerDialogData {
  multiple?: boolean;
  accept?: string; // MIME types or file extensions
  maxFileSize?: number; // in bytes
}

export interface FilePickerDialogResult {
  files: FileList;
}

@Component({
  selector: 'app-file-picker-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>upload</mat-icon>
      Select Files to Upload
    </h2>

    <mat-dialog-content>
      <div class="file-picker-container">
        <!-- Hidden file input -->
        <input
          #fileInput
          type="file"
          [multiple]="data.multiple || false"
          [accept]="data.accept || '*/*'"
          (change)="onFileSelected($event)"
          style="display: none;"
        />

        <!-- Drop zone -->
        <div
          class="drop-zone"
          [class.drag-over]="isDragOver"
          (click)="fileInput.click()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
        >
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          <p class="drop-text">
            Click to select files or drag and drop them here
          </p>
          <p class="file-info" *ngIf="data.maxFileSize">
            Maximum file size: {{ formatFileSize(data.maxFileSize) }}
          </p>
        </div>

        <!-- Selected files list -->
        <div class="selected-files" *ngIf="selectedFiles.length > 0">
          <h3>Selected Files ({{ selectedFiles.length }})</h3>
          <mat-list>
            <mat-list-item *ngFor="let file of selectedFiles">
              <mat-icon matListItemIcon>description</mat-icon>
              <div matListItemTitle>{{ file.name }}</div>
              <div matListItemLine>{{ formatFileSize(file.size) }}</div>
              <button
                mat-icon-button
                matListItemMeta
                (click)="removeFile(file)"
                aria-label="Remove file"
              >
                <mat-icon>close</mat-icon>
              </button>
            </mat-list-item>
          </mat-list>
        </div>

        <!-- Error messages -->
        <div class="error-messages" *ngIf="errorMessages.length > 0">
          <h4>Upload Errors:</h4>
          <ul>
            <li *ngFor="let error of errorMessages" class="error-message">
              {{ error }}
            </li>
          </ul>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="selectedFiles.length === 0"
        (click)="onUpload()"
      >
        Upload {{ selectedFiles.length }} File{{ selectedFiles.length !== 1 ? 's' : '' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .file-picker-container {
      min-width: 400px;
      max-width: 600px;
    }

    .drop-zone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 20px;
    }

    .drop-zone:hover,
    .drop-zone.drag-over {
      border-color: #2196f3;
      background-color: #f5f5f5;
    }

    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #666;
      margin-bottom: 16px;
    }

    .drop-text {
      font-size: 16px;
      color: #666;
      margin: 0 0 8px 0;
    }

    .file-info {
      font-size: 12px;
      color: #999;
      margin: 0;
    }

    .selected-files {
      margin-top: 20px;
    }

    .selected-files h3 {
      margin: 0 0 16px 0;
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .error-messages {
      margin-top: 16px;
      padding: 12px;
      background-color: #ffebee;
      border-radius: 4px;
    }

    .error-messages h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #c62828;
    }

    .error-messages ul {
      margin: 0;
      padding-left: 20px;
    }

    .error-message {
      color: #c62828;
      font-size: 12px;
    }

    mat-list-item {
      border-bottom: 1px solid #eee;
    }

    mat-list-item:last-child {
      border-bottom: none;
    }
  `]
})
export class FilePickerDialogComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFiles: File[] = [];
  errorMessages: string[] = [];
  isDragOver = false;

  constructor(
    public dialogRef: MatDialogRef<FilePickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FilePickerDialogData
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(input.files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer?.files) {
      this.processFiles(event.dataTransfer.files);
    }
  }

  private processFiles(fileList: FileList): void {
    this.errorMessages = [];
    const files = Array.from(fileList);

    for (const file of files) {
      if (this.validateFile(file)) {
        // Check for duplicates
        const isDuplicate = this.selectedFiles.some(
          existingFile => existingFile.name === file.name && existingFile.size === file.size
        );

        if (!isDuplicate) {
          if (this.data.multiple) {
            this.selectedFiles.push(file);
          } else {
            this.selectedFiles = [file]; // for single file mode
          }
        } else {
          this.errorMessages.push(`File "${file.name}" is already selected`);
        }
      }
    }
  }

  private validateFile(file: File): boolean {
    // Check file size
    if (this.data.maxFileSize && file.size > this.data.maxFileSize) {
      this.errorMessages.push(
        `File "${file.name}" is too large (${this.formatFileSize(file.size)}). ` +
        `Maximum allowed size is ${this.formatFileSize(this.data.maxFileSize)}`
      );
      return false;
    }

    // Check the file type if accept is specified
    if (this.data.accept && this.data.accept !== '*/*') {
      const acceptedTypes = this.data.accept.split(',').map(type => type.trim());
      const isAccepted = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          // File extension check
          return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
        } else {
          // MIME type check
          return file.type.match(acceptedType.replace('*', '.*'));
        }
      });

      if (!isAccepted) {
        this.errorMessages.push(
          `File "${file.name}" has an unsupported file type. ` +
          `Accepted types: ${this.data.accept}`
        );
        return false;
      }
    }

    return true;
  }

  removeFile(fileToRemove: File): void {
    this.selectedFiles = this.selectedFiles.filter(file => file !== fileToRemove);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onUpload(): void {
    if (this.selectedFiles.length > 0) {
      // Create a FileList-like object from the selected files
      const dataTransfer = new DataTransfer();
      this.selectedFiles.forEach(file => dataTransfer.items.add(file));

      const result: FilePickerDialogResult = {
        files: dataTransfer.files
      };

      this.dialogRef.close(result);
    }
  }
}
