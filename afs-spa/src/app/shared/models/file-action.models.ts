/**
 * Extended interfaces for file action bar functionality
 * These interfaces extend the base FileNode model with additional properties
 * needed for selection state, permissions, and action configuration.
 */

import { FileNode, FilePermissions } from '../../core/models/file.model';

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
 * Navigation state for page-by-page directory browsing
 * Tracks current location and navigation history
 */
export interface NavigationState {
  /** Current directory path being viewed */
  readonly currentPath: string;
  /** Breadcrumb items for navigation */
  readonly breadcrumbs: ReadonlyArray<BreadcrumbItem>;
  /** Whether a user can navigate up from the current directory */
  readonly canNavigateUp: boolean;
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
 * Configuration for action buttons in the action bar
 * Defines behavior and visibility rules for each action
 */
export type ActionId =
  | 'upload'
  | 'download'
  | 'rename'
  | 'move'
  | 'delete'
  | 'create-directory';

export type ActionIcon =
  | 'upload'
  | 'download'
  | 'edit'
  | 'drive_file_move'
  | 'delete'
  | 'create_new_folder';

export type PermissionKey = keyof FilePermissions; // narrows to the literal union of permission keys

export interface ActionConfig {
  /** Unique identifier for the action */
  readonly id: ActionId;
  /** Display label for the action button */
  readonly label: string;
  /** Material icon name for the action button */
  readonly icon: ActionIcon;
  /** Whether the action is currently enabled */
  readonly enabled: boolean;
  /** Whether the action should be visible */
  readonly visible: boolean;
  /** Whether this action requires a file/folder to be selected */
  readonly requiresSelection: boolean;
  /** File/folder types this action supports */
  readonly supportedTypes: ReadonlyArray<FileNode['type']>;
  /** Permissions required to perform this action */
  readonly requiredPermissions: ReadonlyArray<PermissionKey>;
}
