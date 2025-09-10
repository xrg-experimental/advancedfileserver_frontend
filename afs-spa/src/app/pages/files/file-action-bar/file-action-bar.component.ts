import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileNode, FilePermissions } from '../../../core/models/file.model';
import { ActionConfig, ActionId } from '../../../shared';

@Component({
  selector: 'app-file-action-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './file-action-bar.component.html',
  styleUrls: ['./file-action-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileActionBarComponent implements OnChanges, OnInit {
  @Input() selectedItem: FileNode | null = null;
  @Input() currentPath: string = '/';
  @Input() permissions: FilePermissions = {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canShare: true,
    canUpload: true
  };

  @Output() uploadFile = new EventEmitter<void>();
  @Output() downloadFile = new EventEmitter<void>();
  @Output() renameItem = new EventEmitter<void>();
  @Output() moveItem = new EventEmitter<void>();
  @Output() deleteItem = new EventEmitter<void>();
  @Output() createDirectory = new EventEmitter<void>();

  actions: ActionConfig[] = [];

  ngOnInit(): void {
    this.updateActionStates();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedItem'] || changes['permissions']) {
      this.updateActionStates();
    }
  }

  /**
   * Handle action button clicks
   */
  onActionClick(actionId: ActionId): void {
    switch (actionId) {
      case 'upload':
        this.uploadFile.emit();
        break;
      case 'download':
        this.downloadFile.emit();
        break;
      case 'rename':
        this.renameItem.emit();
        break;
      case 'move':
        this.moveItem.emit();
        break;
      case 'delete':
        this.deleteItem.emit();
        break;
      case 'create-directory':
        this.createDirectory.emit();
        break;
    }
  }

  /**
   * Update action states based on selection and permissions
   */
  private updateActionStates(): void {
    this.actions = [
      {
        id: 'upload',
        label: 'Upload File',
        icon: 'upload',
        enabled: this.canUpload(),
        visible: true,
        requiresSelection: false,
        supportedTypes: ['folder'],
        requiredPermissions: ['canUpload', 'canWrite']
      },
      {
        id: 'download',
        label: 'Download',
        icon: 'download',
        enabled: this.canDownload(),
        visible: true,
        requiresSelection: true,
        supportedTypes: ['file'],
        requiredPermissions: ['canRead']
      },
      {
        id: 'rename',
        label: 'Rename',
        icon: 'edit',
        enabled: this.canRename(),
        visible: true,
        requiresSelection: true,
        supportedTypes: ['file', 'folder'],
        requiredPermissions: ['canWrite']
      },
      {
        id: 'move',
        label: 'Move',
        icon: 'drive_file_move',
        enabled: this.canMove(),
        visible: true,
        requiresSelection: true,
        supportedTypes: ['file', 'folder'],
        requiredPermissions: ['canWrite']
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: 'delete',
        enabled: this.canDelete(),
        visible: true,
        requiresSelection: true,
        supportedTypes: ['file', 'folder'],
        requiredPermissions: ['canDelete']
      },
      {
        id: 'create-directory',
        label: 'Create Directory',
        icon: 'create_new_folder',
        enabled: this.canCreateDirectory(),
        visible: true,
        requiresSelection: false,
        supportedTypes: [],
        requiredPermissions: ['canWrite', 'canUpload']
      }
    ];
  }

  /**
   * Check if the upload action should be enabled
   */
  private canUpload(): boolean {
    // Upload is enabled when:
    // 1. User has upload and write permissions
    // 2. Either no selection (upload to current directory) or the selected item is a folder
    const hasPermissions = this.permissions.canUpload && this.permissions.canWrite;
    const validSelection = !this.selectedItem || this.selectedItem.type === 'folder';

    return hasPermissions && validSelection;
  }

  /**
   * Check if the download action should be enabled
   */
  private canDownload(): boolean {
    // Download is enabled when:
    // 1. User has read permissions
    // 2. A file is selected (not a folder)
    const hasPermissions = this.permissions.canRead;
    const validSelection = this.selectedItem && this.selectedItem.type === 'file';

    return hasPermissions && !!validSelection;
  }

  /**
   * Check if the rename action should be enabled
   */
  private canRename(): boolean {
    // Rename is enabled when:
    // 1. User has write permissions
    // 2. An item is selected
    const hasPermissions = this.permissions.canWrite;
    const hasSelection = !!this.selectedItem;

    return hasPermissions && hasSelection;
  }

  /**
   * Check if move action should be enabled
   */
  private canMove(): boolean {
    // Move is enabled when:
    // 1. User has write permissions
    // 2. An item is selected
    const hasPermissions = this.permissions.canWrite;
    const hasSelection = !!this.selectedItem;

    return hasPermissions && hasSelection;
  }

  /**
   * Check if the delete action should be enabled
   */
  private canDelete(): boolean {
    // Delete is enabled when:
    // 1. User has delete permissions
    // 2. An item is selected
    const hasPermissions = this.permissions.canDelete;
    const hasSelection = !!this.selectedItem;

    return hasPermissions && hasSelection;
  }

  /**
   * Check if the create directory action should be enabled
   */
  private canCreateDirectory(): boolean {
    // Create directory is enabled when:
    // 1. User has write and upload permissions
    // noinspection UnnecessaryLocalVariableJS
    const hasPermissions = this.permissions.canWrite && this.permissions.canUpload;

    return hasPermissions;
  }
}
