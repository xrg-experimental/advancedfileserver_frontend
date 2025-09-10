import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FileService } from '../../core/services/file.service';
import { FileOperationService } from '../../core/services/file-operation.service';
import { FileNode, FilePermissions } from '../../core/models/file.model';
import { BreadcrumbItem } from '../../shared';
import { FileActionBarComponent } from './file-action-bar';
import {
  RenameDialogComponent,
  RenameDialogData,
  RenameDialogResult,
  DeleteConfirmationDialogComponent,
  DeleteConfirmationDialogData,
  CreateDirectoryDialogComponent,
  CreateDirectoryDialogResult,
  DirectoryPickerDialogComponent,
  DirectoryPickerDialogData,
  DirectoryPickerDialogResult,
  FilePickerDialogComponent,
  FilePickerDialogData,
  FilePickerDialogResult,
  UploadProgressDialogComponent,
  UploadProgressDialogData
} from './dialogs';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    FileActionBarComponent
  ],
  templateUrl: './files.component.html',
  styleUrl: './files.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilesComponent implements OnInit {
  // Page-by-page navigation state
  currentPath = '/';
  fileList: FileNode[] = [];
  selectedItem: FileNode | null = null;
  breadcrumbs: BreadcrumbItem[] = [];

  // Loading and error state
  isLoading = false;
  error: string | null = null;

  // User permissions (mock data for now - will be replaced with real permissions)
  permissions: FilePermissions = {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canShare: true,
    canUpload: true
  };

  constructor(
    private fileService: FileService,
    private fileOperationService: FileOperationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  trackByPath = (_: number, item: { path: string }) => item.path;

  ngOnInit(): void {
    this.navigateToPath('/');
  }

  /**
   * Navigate to a specific directory path
   */
  navigateToPath(path: string): void {
    this.currentPath = path;
    this.selectedItem = null; // Reset selection when navigating
    this.generateBreadcrumbs();
    this.loadCurrentDirectory();
  }

  /**
   * Navigate up one directory level
   */
  navigateUp(): void {
    if (this.canNavigateUp()) {
      const parentPath = this.getParentPath(this.currentPath);
      this.navigateToPath(parentPath);
    }
  }

  /**
   * Check if navigation up is possible
   */
  canNavigateUp(): boolean {
    return this.currentPath !== '/';
  }

  /**
   * Handle item selection (single selection only)
   */
  selectItem(item: FileNode): void {
    // Clear previous selection
    if (this.selectedItem) {
      this.selectedItem.selected = false;
    }

    // Set a new selection
    if (this.selectedItem === item) {
      // Deselect if clicking the same item
      this.selectedItem = null;
    } else {
      this.selectedItem = item;
      item.selected = true;
    }

    this.cdr.markForCheck();
  }

  /**
   * Handle double-click on items (navigate into folders)
   */
  onItemDoubleClick(item: FileNode): void {
    if (item.type === 'folder') {
      this.navigateToPath(item.path);
    }
  }

  /**
   * Navigate to a breadcrumb path
   */
  navigateToBreadcrumb(breadcrumb: BreadcrumbItem): void {
    this.navigateToPath(breadcrumb.path);
  }

  /**
   * Load files for the current directory
   */
  private loadCurrentDirectory(): void {
    this.isLoading = true;
    this.error = null;

    this.fileService.getFiles(this.currentPath).subscribe({
      next: (files) => {
        this.fileList = this.processFiles(files);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(`Error loading directory ${this.currentPath}:`, err);
        this.error = `Failed to load directory: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Process files for display (remove tree-specific properties)
   */
  private processFiles(files: FileNode[]): FileNode[] {
    return files.map(file => ({
      ...file,
      selected: false,
      // Remove tree-specific properties
      expanded: undefined,
      loading: undefined,
      level: undefined,
      children: undefined
    }));
  }

  /**
   * Generate breadcrumb navigation items
   */
  private generateBreadcrumbs(): void {
    this.breadcrumbs = [];

    if (this.currentPath === '/') {
      this.breadcrumbs.push({ name: 'Root', path: '/' });
      return;
    }

    // Add root
    this.breadcrumbs.push({ name: 'Root', path: '/' });

    // Split path and build breadcrumbs
    const pathParts = this.currentPath.split('/').filter(part => part.length > 0);
    let currentPath = '';

    for (const part of pathParts) {
      currentPath += '/' + part;
      this.breadcrumbs.push({
        name: part,
        path: currentPath
      });
    }
  }

  /**
   * Get the parent directory path
   */
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

  // Action bar event handlers
  onUploadFile(): void {
    const targetPath = this.selectedItem?.type === 'folder' ? this.selectedItem.path : this.currentPath;

    const dialogData: FilePickerDialogData = {
      multiple: true,
      accept: '*/*', // Accept all file types - can be configured based on requirements
      maxFileSize: 100 * 1024 * 1024 // 100MB max file size - can be configured
    };

    const dialogRef = this.dialog.open(FilePickerDialogComponent, {
      width: '600px',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: FilePickerDialogResult | undefined) => {
      if (result && result.files.length > 0) {
        this.performUpload(result.files, targetPath);
      }
    });
  }

  onDownloadFile(): void {
    console.log('Download file action triggered for:', this.selectedItem?.name);
    // TODO: Implement file download functionality in future task
    this.showMessage('File download functionality will be implemented in a future task');
  }

  onRenameItem(): void {
    if (!this.selectedItem) {
      return;
    }

    const dialogData: RenameDialogData = {
      currentName: this.selectedItem.name,
      itemType: this.selectedItem.type
    };

    const dialogRef = this.dialog.open(RenameDialogComponent, {
      width: '400px',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: RenameDialogResult | undefined) => {
      if (result && this.selectedItem) {
        this.performRename(this.selectedItem.path, result.newName);
      }
    });
  }

  onMoveItem(): void {
    if (!this.selectedItem) {
      return;
    }

    const dialogData: DirectoryPickerDialogData = {
      currentPath: this.currentPath,
      excludePath: this.selectedItem.path // Exclude the item being moved
    };

    const dialogRef = this.dialog.open(DirectoryPickerDialogComponent, {
      width: '600px',
      height: '500px',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: DirectoryPickerDialogResult | undefined) => {
      if (result && this.selectedItem) {
        const targetPath = result.selectedPath + '/' + this.selectedItem.name;
        this.performMove(this.selectedItem.path, targetPath);
      }
    });
  }

  onDeleteItem(): void {
    if (!this.selectedItem) {
      return;
    }

    const dialogData: DeleteConfirmationDialogData = {
      itemName: this.selectedItem.name,
      itemType: this.selectedItem.type
    };

    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '450px',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed && this.selectedItem) {
        this.performDelete(this.selectedItem.path);
      }
    });
  }

  onCreateDirectory(): void {
    const dialogRef = this.dialog.open(CreateDirectoryDialogComponent, {
      width: '400px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: CreateDirectoryDialogResult | undefined) => {
      if (result) {
        this.performCreateDirectory(this.currentPath, result.directoryName);
      }
    });
  }

  /**
   * Perform a rename operation
   */
  private performRename(oldPath: string, newName: string): void {
    this.fileOperationService.renameItem(oldPath, newName).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage(`Successfully renamed to "${newName}"`);
          this.selectedItem = null; // Clear selection
          this.loadCurrentDirectory(); // Refresh the directory
        } else {
          this.showError(response.error || 'Failed to rename item');
        }
      },
      error: (error) => {
        this.showError(error.message || 'Failed to rename item');
      }
    });
  }

  /**
   * Perform a move operation
   */
  private performMove(sourcePath: string, targetPath: string): void {
    this.fileOperationService.moveItem(sourcePath, targetPath).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('Item moved successfully');
          this.selectedItem = null; // Clear selection
          this.loadCurrentDirectory(); // Refresh the directory
        } else {
          this.showError(response.error || 'Failed to move item');
        }
      },
      error: (error) => {
        this.showError(error.message || 'Failed to move item');
      }
    });
  }

  /**
   * Perform delete operation
   */
  private performDelete(path: string): void {
    this.fileOperationService.deleteItem(path).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('Item deleted successfully');
          this.selectedItem = null; // Clear selection
          this.loadCurrentDirectory(); // Refresh the directory
        } else {
          this.showError(response.error || 'Failed to delete item');
        }
      },
      error: (error) => {
        this.showError(error.message || 'Failed to delete item');
      }
    });
  }

  /**
   * Perform create directory operation
   */
  private performCreateDirectory(path: string, name: string): void {
    this.fileOperationService.createDirectory(path, name).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage(`Folder "${name}" created successfully`);
          this.loadCurrentDirectory(); // Refresh the directory
        } else {
          this.showError(response.error || 'Failed to create folder');
        }
      },
      error: (error) => {
        this.showError(error.message || 'Failed to create folder');
      }
    });
  }

  /**
   * Perform file upload operation with progress tracking
   */
  private performUpload(files: FileList, targetPath: string): void {
    // Start the upload and get progress observable
    const uploadProgress$ = this.fileOperationService.uploadFiles(files, targetPath);

    // Show progress dialog
    const progressDialogData: UploadProgressDialogData = {
      uploadProgress$,
      onCancel: (operationId: string) => {
        this.fileOperationService.cancelOperation(operationId);
      }
    };

    const progressDialogRef = this.dialog.open(UploadProgressDialogComponent, {
      width: '700px',
      data: progressDialogData,
      disableClose: true // Prevent closing during upload
    });

    // Subscribe to upload progress to handle completion
    uploadProgress$.subscribe({
      next: (progresses) => {
        // Check if all uploads are completed
        const allCompleted = progresses.every(p =>
          p.status === 'completed' || p.status === 'error' || p.status === 'cancelled'
        );

        if (allCompleted) {
          // Allow the dialog to be closed
          progressDialogRef.disableClose = false;

          // Show a summary message
          const completedCount = progresses.filter(p => p.status === 'completed').length;
          const errorCount = progresses.filter(p => p.status === 'error').length;
          const cancelledCount = progresses.filter(p => p.status === 'cancelled').length;

          if (completedCount > 0) {
            this.showMessage(`Successfully uploaded ${completedCount} file${completedCount !== 1 ? 's' : ''}`);
          }

          if (errorCount > 0) {
            this.showError(`${errorCount} file${errorCount !== 1 ? 's' : ''} failed to upload`);
          }

          if (cancelledCount > 0) {
            this.showMessage(`${cancelledCount} upload${cancelledCount !== 1 ? 's' : ''} cancelled`);
          }

          // Refresh the directory to show uploaded files
          this.loadCurrentDirectory();
        }
      },
      error: (error) => {
        this.showError(`Upload failed: ${error.message || 'Unknown error'}`);
        progressDialogRef.disableClose = false;
      }
    });
  }

  /**
   * Show a success message
   */
  private showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }
}
