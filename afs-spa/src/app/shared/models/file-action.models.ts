/**
 * Extended interfaces for file action bar functionality
 * These interfaces extend the base FileNode model with additional properties
 * needed for selection state, permissions, and action configuration.
 */

import { FileNode } from '../../core/models/file.model';

/**
 * Extended FileNode interface with selection state and permissions
 * Extends the base FileNode with properties needed for action bar functionality
 */
export interface ExtendedFileNode extends FileNode {
  /** Whether this file/folder is currently selected */
  selected?: boolean;
  /** Permissions for this specific file/folder */
  permissions?: FilePermissions;
}

/**
 * File permissions interface defining what operations are allowed
 * Based on requirements 4.1, 4.2, 4.3 for permission-based action visibility
 */
export interface FilePermissions {
  /** Can read/view the file or folder contents */
  canRead: boolean;
  /** Can write/modify the file or folder */
  canWrite: boolean;
  /** Can delete the file or folder */
  canDelete: boolean;
  /** Can share the file or folder with others */
  canShare: boolean;
  /** Can upload files to this directory (only applicable to folders) */
  canUpload: boolean;
}

/**
 * Navigation state for page-by-page directory browsing
 * Tracks current location and navigation history
 */
export interface NavigationState {
  /** Current directory path being viewed */
  currentPath: string;
  /** Breadcrumb items for navigation */
  breadcrumbs: BreadcrumbItem[];
  /** Whether user can navigate up from current directory */
  canNavigateUp: boolean;
}

/**
 * Individual breadcrumb item for navigation
 */
export interface BreadcrumbItem {
  /** Display name for the breadcrumb */
  name: string;
  /** Full path to navigate to when clicked */
  path: string;
}

/**
 * Progress tracking for long-running operations like upload/download
 * Based on requirement 6.1-6.6 for progress monitoring and cancellation
 */
export interface OperationProgress {
  /** Unique identifier for this operation */
  id: string;
  /** Type of operation being performed */
  type: 'upload' | 'download';
  /** Name of the file being processed */
  fileName: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current status of the operation */
  status: 'pending' | 'in-progress' | 'completed' | 'error' | 'cancelled';
  /** Error message if status is 'error' */
  error?: string;
  /** Estimated time remaining in seconds */
  estimatedTimeRemaining?: number;
  /** Number of bytes transferred so far */
  bytesTransferred?: number;
  /** Total number of bytes to transfer */
  totalBytes?: number;
}

/**
 * Configuration for action buttons in the action bar
 * Defines behavior and visibility rules for each action
 */
export interface ActionConfig {
  /** Unique identifier for the action */
  id: string;
  /** Display label for the action button */
  label: string;
  /** Material icon name for the action button */
  icon: string;
  /** Whether the action is currently enabled */
  enabled: boolean;
  /** Whether the action should be visible */
  visible: boolean;
  /** Whether this action requires a file/folder to be selected */
  requiresSelection: boolean;
  /** File/folder types this action supports */
  supportedTypes: ('file' | 'folder')[];
  /** Permissions required to perform this action */
  requiredPermissions: (keyof FilePermissions)[];
}