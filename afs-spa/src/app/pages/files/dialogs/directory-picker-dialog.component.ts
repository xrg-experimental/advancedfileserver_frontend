import { Component, Inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FileService } from '../../../core/services/file.service';
import { FileNode } from '../../../core/models/file.model';
import { BreadcrumbItem } from '../../../shared';

export interface DirectoryPickerDialogData {
  currentPath: string;
  excludePath?: string; // Path to exclude from selection (e.g., the item being moved)
}

export interface DirectoryPickerDialogResult {
  selectedPath: string;
}

@Component({
  selector: 'app-directory-picker-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>drive_file_move</mat-icon>
      Select Destination Folder
    </h2>

    <mat-dialog-content>
      <!-- Breadcrumb navigation -->
      <div class="breadcrumb-container" *ngIf="breadcrumbs.length > 0">
        <button
          *ngFor="let breadcrumb of breadcrumbs; let last = last"
          mat-button
          class="breadcrumb-item"
          [class.current]="last"
          (click)="navigateToPath(breadcrumb.path)"
          [disabled]="isLoading">
          {{ breadcrumb.name }}
          <mat-icon *ngIf="!last">chevron_right</mat-icon>
        </button>
      </div>

      <!-- Current path display -->
      <div class="current-path">
        <strong>Current location:</strong> {{ currentViewPath }}
      </div>

      <!-- Loading indicator -->
      <div class="loading-container" *ngIf="isLoading">
        <mat-spinner diameter="32"></mat-spinner>
        <span>Loading folders...</span>
      </div>

      <!-- Error message -->
      <div class="error-message" *ngIf="error">
        <mat-icon color="warn">error</mat-icon>
        <span>{{ error }}</span>
      </div>

      <!-- Directory list -->
      <div class="directory-list" *ngIf="!isLoading && !error">
        <!-- Up navigation -->
        <button
          mat-button
          class="directory-item up-button"
          *ngIf="canNavigateUp()"
          (click)="navigateUp()">
          <mat-icon>arrow_upward</mat-icon>
          <span>.. (Up one level)</span>
        </button>

        <!-- Folders -->
        <button
          *ngFor="let folder of folders"
          mat-button
          class="directory-item"
          [class.selected]="selectedPath === folder.path"
          [class.excluded]="isExcluded(folder.path)"
          [disabled]="isExcluded(folder.path)"
          (click)="selectFolder(folder)"
          (dblclick)="navigateToFolder(folder)">
          <mat-icon>folder</mat-icon>
          <span>{{ folder.name }}</span>
          <mat-icon class="navigate-icon" *ngIf="!isExcluded(folder.path)">chevron_right</mat-icon>
        </button>

        <div class="no-folders" *ngIf="folders.length === 0">
          <mat-icon>folder_open</mat-icon>
          <span>No folders in this directory</span>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onConfirm()"
        [disabled]="!selectedPath || selectedPath === data.currentPath">
        <mat-icon>drive_file_move</mat-icon>
        Move Here
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
      max-width: 600px;
      min-height: 300px;
      max-height: 500px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .breadcrumb-container {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 16px;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 4px;
      min-height: 32px;
      padding: 4px 8px;
      font-size: 14px;
    }

    .breadcrumb-item.current {
      font-weight: 500;
      color: #1976d2;
    }

    .current-path {
      margin-bottom: 16px;
      padding: 8px;
      background-color: #f5f5f5;
      border-radius: 4px;
      font-size: 14px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 32px;
      flex: 1;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background-color: #ffebee;
      border-radius: 4px;
      color: #c62828;
    }

    .directory-list {
      flex: 1;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }

    .directory-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #f0f0f0;
      justify-content: flex-start;
      min-height: 48px;
    }

    .directory-item:last-child {
      border-bottom: none;
    }

    .directory-item:hover:not(:disabled) {
      background-color: #f5f5f5;
    }

    .directory-item.selected {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .directory-item.excluded {
      opacity: 0.5;
      background-color: #fafafa;
    }

    .directory-item.up-button {
      font-style: italic;
      border-bottom: 2px solid #e0e0e0;
    }

    .navigate-icon {
      margin-left: auto;
      opacity: 0.6;
    }

    .no-folders {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 32px;
      color: #666;
      font-style: italic;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DirectoryPickerDialogComponent implements OnInit {
  currentViewPath: string;
  selectedPath: string;
  folders: FileNode[] = [];
  breadcrumbs: BreadcrumbItem[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<DirectoryPickerDialogComponent, DirectoryPickerDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: DirectoryPickerDialogData,
    private fileService: FileService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentViewPath = data.currentPath;
    this.selectedPath = data.currentPath;
  }

  ngOnInit(): void {
    this.loadDirectory(this.currentViewPath);
  }

  navigateToPath(path: string): void {
    this.currentViewPath = path;
    this.selectedPath = path;
    this.loadDirectory(path);
  }

  navigateUp(): void {
    if (this.canNavigateUp()) {
      const parentPath = this.getParentPath(this.currentViewPath);
      this.navigateToPath(parentPath);
    }
  }

  navigateToFolder(folder: FileNode): void {
    if (!this.isExcluded(folder.path)) {
      this.navigateToPath(folder.path);
    }
  }

  selectFolder(folder: FileNode): void {
    if (!this.isExcluded(folder.path)) {
      this.selectedPath = folder.path;
      this.cdr.markForCheck();
    }
  }

  canNavigateUp(): boolean {
    return this.currentViewPath !== '/';
  }

  isExcluded(path: string): boolean {
    return this.data.excludePath ? path === this.data.excludePath : false;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.selectedPath && this.selectedPath !== this.data.currentPath) {
      this.dialogRef.close({ selectedPath: this.selectedPath });
    }
  }

  private loadDirectory(path: string): void {
    this.isLoading = true;
    this.error = null;
    this.generateBreadcrumbs(path);

    this.fileService.getFiles(path).subscribe({
      next: (files: FileNode[]) => {
        // Filter to only show folders
        this.folders = files.filter((file: FileNode) => file.type === 'folder');
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error(`Error loading directory ${path}:`, err);
        this.error = `Failed to load directory: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private generateBreadcrumbs(path: string): void {
    this.breadcrumbs = [];

    if (path === '/') {
      this.breadcrumbs.push({ name: 'Root', path: '/' });
      return;
    }

    // Add root
    this.breadcrumbs.push({ name: 'Root', path: '/' });

    // Split path and build breadcrumbs
    const pathParts = path.split('/').filter(part => part.length > 0);
    let currentPath = '';

    for (const part of pathParts) {
      currentPath += '/' + part;
      this.breadcrumbs.push({
        name: part,
        path: currentPath
      });
    }
  }

  private getParentPath(path: string): string {
    if (path === '/') {
      return '/';
    }

    const lastSlashIndex = path.lastIndexOf('/');
    if (lastSlashIndex === 0) {
      return '/';
    }

    return path.substring(0, lastSlashIndex);
  }
}
