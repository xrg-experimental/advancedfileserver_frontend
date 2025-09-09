import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { FileService } from '../../core/services/file.service';
import { FileNode, FilePermissions, BreadcrumbItem } from '../../core/models/file.model';
import { FileActionBarComponent } from './file-action-bar';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatChipsModule,
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

  constructor(private fileService: FileService, private cdr: ChangeDetectorRef) {}

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

  // Action bar event handlers (placeholder implementations)
  onUploadFile(): void {
    console.log('Upload file action triggered');
    // TODO: Implement file upload functionality
  }

  onDownloadFile(): void {
    console.log('Download file action triggered for:', this.selectedItem?.name);
    // TODO: Implement file download functionality
  }

  onRenameItem(): void {
    console.log('Rename item action triggered for:', this.selectedItem?.name);
    // TODO: Implement rename functionality
  }

  onMoveItem(): void {
    console.log('Move item action triggered for:', this.selectedItem?.name);
    // TODO: Implement move functionality
  }

  onDeleteItem(): void {
    console.log('Delete item action triggered for:', this.selectedItem?.name);
    // TODO: Implement delete functionality
  }

  onCreateDirectory(): void {
    console.log('Create directory action triggered');
    // TODO: Implement create directory functionality
  }
}
