# Design Document

## Overview

The file action bar feature will transform the existing tree-based file navigation into a page-by-page directory browser with a dynamic action bar. The action bar will be positioned at the top of the file listing and will show contextual actions based on the current selection state and user permissions.

The design leverages the existing Angular Material components and follows the established patterns in the AFS SPA application. The action bar will integrate with the existing FileService and extend it with new methods for file operations.

## Architecture

### Component Structure

```
FilesComponent (Modified)
├── FileActionBarComponent (New)
│   ├── ActionButtonComponent (New)
│   └── ProgressDialogComponent (New)
├── FileListComponent (New - replaces tree view)
│   ├── FileItemComponent (New)
│   └── BreadcrumbComponent (New)
└── FileOperationService (New)
    ├── UploadService (New)
    ├── DownloadService (New)
    └── FileDialogService (New)
```

### Navigation Model Change

The current tree-based navigation will be replaced with a page-by-page directory browser:

- **Current**: Expandable tree structure showing multiple directory levels simultaneously
- **New**: Single directory view with breadcrumb navigation and up/down navigation

### State Management

The component will maintain the following state:
- `currentPath: string` - Current directory path
- `selectedItem: FileNode | null` - Currently selected file or directory
- `fileList: FileNode[]` - Files and directories in current path
- `isLoading: boolean` - Loading state for directory navigation
- `operationsInProgress: Map<string, OperationProgress>` - Track long-running operations

## Components and Interfaces

### FileActionBarComponent

**Purpose**: Displays contextual action buttons based on selection state and permissions.

**Interface**:
```typescript
interface FileActionBarComponent {
  selectedItem: FileNode | null;
  currentPath: string;
  permissions: FilePermissions;
  
  onUpload(): void;
  onDownload(): void;
  onRename(): void;
  onMove(): void;
  onDelete(): void;
  onCreateDirectory(): void;
}
```

**Actions Configuration**:
```typescript
interface ActionConfig {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
  visible: boolean;
  requiresSelection: boolean;
  supportedTypes: ('file' | 'folder')[];
  requiredPermissions: string[];
}
```

### FileListComponent

**Purpose**: Displays files and directories in the current path with single-selection capability.

**Interface**:
```typescript
interface FileListComponent {
  files: FileNode[];
  selectedItem: FileNode | null;
  currentPath: string;
  
  onItemSelect(item: FileNode): void;
  onItemDoubleClick(item: FileNode): void;
  onNavigateUp(): void;
}
```

### FileOperationService

**Purpose**: Handles all file operations with progress tracking and error handling.

**Interface**:
```typescript
interface FileOperationService {
  uploadFile(file: File, targetPath: string): Observable<OperationProgress>;
  downloadFile(filePath: string): Observable<OperationProgress>;
  renameItem(oldPath: string, newName: string): Observable<void>;
  moveItem(sourcePath: string, targetPath: string): Observable<void>;
  deleteItem(path: string): Observable<void>;
  createDirectory(path: string, name: string): Observable<void>;
  
  cancelOperation(operationId: string): void;
  getOperationProgress(operationId: string): Observable<OperationProgress>;
}
```

### Progress Tracking

**OperationProgress Interface**:
```typescript
interface OperationProgress {
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
```

## Data Models

### Extended FileNode

The existing FileNode interface will be extended to support selection state:

```typescript
interface FileNode {
  // Existing properties
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified?: Date;
  path: string;
  
  // New properties for action bar
  selected?: boolean;
  permissions?: FilePermissions;
}
```

### FilePermissions

```typescript
interface FilePermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canShare: boolean;
  canUpload: boolean;
}
```

### Navigation State

```typescript
interface NavigationState {
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  canNavigateUp: boolean;
}

interface BreadcrumbItem {
  name: string;
  path: string;
}
```

## Error Handling

### Error Types

1. **Network Errors**: Connection issues, timeouts
2. **Permission Errors**: Insufficient permissions for operations
3. **File System Errors**: File not found, disk full, etc.
4. **Validation Errors**: Invalid file names, path conflicts

### Error Display Strategy

- **Quick Operations**: Show error snackbar with retry option
- **Long Operations**: Show error in progress dialog with retry/cancel options
- **Critical Errors**: Show error message in main content area

### Error Recovery

- Automatic retry for network errors (with exponential backoff)
- Manual retry option for user-initiated operations
- Graceful degradation when permissions are insufficient

## Testing Strategy

### Unit Tests

1. **FileActionBarComponent**:
   - Action button enable/disable logic based on selection and permissions
   - Correct action triggering based on user interactions
   - Progress indicator display during operations

2. **FileOperationService**:
   - API integration for all file operations
   - Progress tracking accuracy
   - Error handling and recovery
   - Operation cancellation

3. **FileListComponent**:
   - Single selection enforcement
   - Navigation between directories
   - Breadcrumb generation and navigation

### Integration Tests

1. **File Upload Flow**:
   - File selection → Progress tracking → Success/Error handling
   - Multiple file upload handling
   - Upload cancellation

2. **File Operations Flow**:
   - Select file → Enable actions → Execute operation → Update view
   - Permission-based action availability
   - Error scenarios and recovery

3. **Navigation Flow**:
   - Directory navigation → Path updates → Breadcrumb updates
   - Selection state reset on navigation
   - Back/forward navigation behavior

### E2E Tests

1. **Complete User Workflows**:
   - Upload file to directory
   - Download file from directory
   - Rename file/directory
   - Move file between directories
   - Delete file/directory
   - Create new directory

2. **Permission Scenarios**:
   - Limited permission user interactions
   - Admin user full access scenarios

## Implementation Phases

### Phase 1: Navigation Refactor
- Convert tree view to page-by-page navigation
- Implement breadcrumb navigation
- Add single-selection capability

### Phase 2: Action Bar Foundation
- Create FileActionBarComponent
- Implement basic action button layout
- Add permission-based enable/disable logic

### Phase 3: Quick Operations
- Implement rename, move, delete, create directory
- Add confirmation dialogs
- Integrate with existing API endpoints

### Phase 4: Long Operations
- Implement upload/download with progress tracking
- Add cancellation capability
- Create progress dialog component

### Phase 5: Polish and Testing
- Add keyboard shortcuts (if requested later)
- Comprehensive error handling
- Performance optimization
- Accessibility improvements