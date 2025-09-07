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
}
