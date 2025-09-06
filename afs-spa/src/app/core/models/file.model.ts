export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified?: Date;
  children?: FileNode[];
  path: string;
}
