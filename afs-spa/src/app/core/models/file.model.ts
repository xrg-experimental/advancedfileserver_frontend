// API Response interfaces
export interface ApiFileEntry {
  name: string;
  path: string;
  type: string | null;
  size: number;
  createdAt: string;
  modifiedAt: string;
  owner: string | null;
  group: string | null;
  permissions: string | null;
  mimeType: string | null;
  directory: boolean;
}

export interface ApiFileListResponse {
  path: string;
  entries: ApiFileEntry[];
  totalSize: number;
  totalFiles: number;
  totalDirectories: number;
}

// Component interfaces
export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified?: Date;
  children?: FileNode[];
  path: string;
  expanded?: boolean;
  loading?: boolean;
  level?: number;
  selected?: boolean;
  permissions?: FilePermissions;
}

// File operation interfaces
export interface FilePermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canShare: boolean;
  canUpload: boolean;
}

export interface OperationProgress {
  id: string;
  type: 'upload' | 'download';
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'in-progress' | 'completed' | 'error' | 'cancelled';
  error?: string;
  estimatedTimeRemaining?: number;
  bytesTransferred?: number;
  totalBytes?: number;
}

// API operation request/response interfaces
export interface RenameRequest {
  oldPath: string;
  newName: string;
}

export interface MoveRequest {
  sourcePath: string;
  targetPath: string;
}

export interface DeleteRequest {
  path: string;
}

export interface CreateDirectoryRequest {
  path: string;
  name: string;
}

export interface OperationResponse {
  success: boolean;
  message?: string;
  error?: string;
}


export interface NavigationState {
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  canNavigateUp: boolean;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}
