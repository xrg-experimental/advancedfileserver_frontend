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
  currentPath: string;
  /** Breadcrumb items for navigation */
  breadcrumbs: BreadcrumbItem[];
  /** Whether a user can navigate up from the current directory */
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
