import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { LoggerService } from './logger.service';
import { Observable, throwError, timer, of, BehaviorSubject } from 'rxjs';
import { catchError, retry, timeout, finalize, takeUntil, map } from 'rxjs/operators';
import { HttpEventType, HttpRequest, HttpClient } from '@angular/common/http';
import {
  OperationProgress,
  RenameRequest,
  MoveRequest,
  DeleteRequest,
  CreateDirectoryRequest,
  OperationResponse
} from '../models/file.model';

@Injectable({
  providedIn: 'root'
})
export class FileOperationService {
  private operationsInProgress = new Map<string, BehaviorSubject<OperationProgress>>();
  private operationCancellations = new Map<string, BehaviorSubject<boolean>>();

  constructor(
    private http: HttpService,
    private httpClient: HttpClient,
    private logger: LoggerService
  ) {}

  /**
   * Rename a file or directory
   */
  renameItem(oldPath: string, newName: string): Observable<OperationResponse> {
    const request: RenameRequest = { oldPath, newName };

    this.logger.debug('FileOperationService: Renaming item', { oldPath, newName });

    return this.http.post<OperationResponse>('/files/rename', request).pipe(
      timeout(10000),
      retry({
        count: 2,
        delay: (_error, retryCount) => {
          this.logger.warn(`Rename operation failed, retry ${retryCount}`);
          return timer(1000 * retryCount);
        }
      }),
      catchError(error => this.handleOperationError('rename', error)),
      finalize(() => this.cleanupCompletedOperations())
    );
  }

  /**
   * Move a file or directory to a new location
   */
  moveItem(sourcePath: string, targetPath: string): Observable<OperationResponse> {
    const request: MoveRequest = { sourcePath, targetPath };

    this.logger.debug('FileOperationService: Moving item', { sourcePath, targetPath });

    return this.http.post<OperationResponse>('/files/move', request)
      .pipe(
        retry({
          count: 2,
          delay: (error, retryCount) => {
            this.logger.warn(`Move operation failed, retry ${retryCount}`, { error });
            return timer(1000 * retryCount);
          }
        }),
        catchError(error => this.handleOperationError('move', error))
      );
  }

  /**
   * Delete a file or directory
   */
  deleteItem(path: string): Observable<OperationResponse> {
    const request: DeleteRequest = { path };

    this.logger.debug('FileOperationService: Deleting item', { path });

    return this.http.post<OperationResponse>('/files/delete', request)
      .pipe(
        retry({
          count: 2,
          delay: (error, retryCount) => {
            this.logger.warn(`Delete operation failed, retry ${retryCount}`, { error });
            return timer(1000 * retryCount);
          }
        }),
        catchError(error => this.handleOperationError('delete', error))
      );
  }

  /**
   * Create a new directory
   */
  createDirectory(path: string, name: string): Observable<OperationResponse> {
    const request: CreateDirectoryRequest = { path, name };

    this.logger.debug('FileOperationService: Creating directory', { path, name });

    return this.http.post<OperationResponse>('/files/create-directory', request)
      .pipe(
        retry({
          count: 2,
          delay: (error, retryCount) => {
            this.logger.warn(`Create directory operation failed, retry ${retryCount}`, { error });
            return timer(1000 * retryCount);
          }
        }),
        catchError(error => this.handleOperationError('create-directory', error))
      );
  }

  /**
   * Upload multiple files with individual progress tracking
   */
  uploadFiles(files: FileList | File[], targetPath: string): Observable<OperationProgress[]> {
    const fileArray = Array.from(files);
    const uploadObservables = fileArray.map(file => this.uploadFile(file, targetPath));

    this.logger.debug('FileOperationService: Starting multiple file upload', {
      fileCount: fileArray.length,
      targetPath,
      fileNames: fileArray.map(f => f.name)
    });

    // Return an observable that emits the current state of all uploads
    return new Observable<OperationProgress[]>(subscriber => {
      const progressStates = new Map<string, OperationProgress>();
      let completedCount = 0;

      uploadObservables.forEach((upload$, index) => {
        upload$.subscribe({
          next: (progress) => {
            progressStates.set(progress.id, progress);
            subscriber.next(Array.from(progressStates.values()));

            if (progress.status === 'completed' || progress.status === 'error' || progress.status === 'cancelled') {
              completedCount++;
              if (completedCount === fileArray.length) {
                subscriber.complete();
              }
            }
          },
          error: (error) => {
            // Individual file errors are handled in the progress tracking
            // Don't fail the entire batch for one file
            this.logger.warn('FileOperationService: Individual file upload failed in batch', {
              fileName: fileArray[index]?.name,
              error: error?.message
            });
          }
        });
      });
    });
  }

  /**
   * Upload a file with progress tracking
   */
  uploadFile(file: File, targetPath: string): Observable<OperationProgress> {
    const operationId = this.generateOperationId();
    const progressSubject = new BehaviorSubject<OperationProgress>({
      id: operationId,
      type: 'upload',
      fileName: file.name,
      progress: 0,
      status: 'pending',
      totalBytes: file.size,
      bytesTransferred: 0
    });

    this.operationsInProgress.set(operationId, progressSubject);
    const cancellationSubject = new BehaviorSubject<boolean>(false);
    this.operationCancellations.set(operationId, cancellationSubject);

    this.logger.debug('FileOperationService: Starting file upload', {
      fileName: file.name,
      targetPath,
      operationId,
      fileSize: file.size
    });

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', targetPath);

    // Create an HTTP request with progress tracking
    const uploadRequest = new HttpRequest('POST', '/api/files/upload', formData, {
      reportProgress: true
    });

    // Start the upload
    this.httpClient.request(uploadRequest).pipe(
      takeUntil(cancellationSubject.pipe(
        map(cancelled => {
          if (cancelled) {
            throw new Error('Upload cancelled by user');
          }
          return cancelled;
        })
      )),
      catchError(error => {
        this.logger.error('FileOperationService: Upload failed', {
          operationId,
          fileName: file.name,
          error: error?.message || error
        });

        const errorMessage = this.getUploadErrorMessage(error);
        progressSubject.next({
          ...progressSubject.value,
          status: 'error',
          error: errorMessage
        });

        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        // Clean up after completion, error, or cancellation
        setTimeout(() => {
          this.operationsInProgress.delete(operationId);
          this.operationCancellations.delete(operationId);
          progressSubject.complete();
        }, 1000); // Keep progress visible for 1 second after completion
      })
    ).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const progress = Math.round((event.loaded / event.total) * 100);
          const estimatedTimeRemaining = this.calculateEstimatedTime(
            event.loaded,
            event.total,
            progressSubject.value.estimatedTimeRemaining
          );

          progressSubject.next({
            ...progressSubject.value,
            progress,
            status: 'in-progress',
            bytesTransferred: event.loaded,
            estimatedTimeRemaining
          });

          this.logger.debug('FileOperationService: Upload progress', {
            operationId,
            progress,
            bytesTransferred: event.loaded,
            totalBytes: event.total
          });
        } else if (event.type === HttpEventType.Response) {
          // Upload completed successfully
          this.logger.info('FileOperationService: Upload completed successfully', {
            operationId,
            fileName: file.name
          });

          progressSubject.next({
            ...progressSubject.value,
            progress: 100,
            status: 'completed',
            bytesTransferred: file.size
          });
        }
      },
      error: (_) => {
        // Error handling is done in the catchError operator above
        // This is just to ensure the subscription doesn't break
      }
    });

    return progressSubject.asObservable();
  }

  /**
   * Download a file with progress tracking (method signature for future implementation)
   */
  downloadFile(filePath: string): Observable<OperationProgress> {
    const operationId = this.generateOperationId();
    const fileName = filePath.split('/').pop() || 'unknown';
    const progressSubject = new BehaviorSubject<OperationProgress>({
      id: operationId,
      type: 'download',
      fileName,
      progress: 0,
      status: 'pending'
    });

    this.operationsInProgress.set(operationId, progressSubject);
    this.operationCancellations.set(operationId, new BehaviorSubject<boolean>(false));

    // TODO: Implement actual download logic in future task
    // For now, return the progress observable that will be implemented later
    this.logger.debug('FileOperationService: Download method called (implementation pending)', {
      filePath,
      operationId
    });

    // Simulate the pending state for now
    return progressSubject.asObservable();
  }

  /**
   * Cancel a long-running operation
   */
  cancelOperation(operationId: string): void {
    this.logger.debug('FileOperationService: Cancelling operation', { operationId });

    const progressSubject = this.operationsInProgress.get(operationId);
    if (!progressSubject) {
      return; // Operation doesn't exist
    }

    const currentProgress = progressSubject.value;
    // Only cancel if operation is still active
    if (currentProgress.status !== 'pending' && currentProgress.status !== 'in-progress') {
      return;
    }

    const cancellationSubject = this.operationCancellations.get(operationId);
    if (cancellationSubject) {
      cancellationSubject.next(true);
    }

    progressSubject.next({
      ...currentProgress,
      status: 'cancelled'
    });
    progressSubject.complete();

    this.operationCancellations.delete(operationId);
  }

  /**
   * Get progress for a specific operation
   */
  getOperationProgress(operationId: string): Observable<OperationProgress> {
    const progressSubject = this.operationsInProgress.get(operationId);
    if (!progressSubject) {
      return throwError(() => new Error(`Operation ${operationId} not found`));
    }
    return progressSubject.asObservable();
  }

  /**
   * Get all active operations
   */
  getActiveOperations(): Observable<OperationProgress[]> {
    const activeOperations = Array.from(this.operationsInProgress.values())
      .map(subject => subject.value)
      .filter(progress => progress.status === 'in-progress' || progress.status === 'pending');

    return of(activeOperations);
  }

  /**
   * Handle operation errors with proper logging and user-friendly messages
   */
  private handleOperationError(operation: string, error: any): Observable<never> {
    let userMessage = `Failed to ${operation} item`;

    if (error?.message) {
      if (error.message.includes('permission')) {
        userMessage = `Permission denied: Cannot ${operation} this item`;
      } else if (error.message.includes('not found')) {
        userMessage = `Item not found: Cannot ${operation} non-existent item`;
      } else if (error.message.includes('exists')) {
        userMessage = `Item already exists: Cannot ${operation} to existing location`;
      } else if (error.message.includes('space')) {
        userMessage = `Insufficient disk space: Cannot ${operation} item`;
      }
    }

    this.logger.error(`FileOperationService: ${operation} operation failed`, {
      operation,
      error: error?.message || error,
      userMessage
    });

    return throwError(() => new Error(userMessage));
  }

  /**
   * Generate unique operation ID
   */
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Clean up completed operations to prevent memory leaks
   */
  private cleanupCompletedOperations(): void {
    for (const [operationId, progressSubject] of this.operationsInProgress.entries()) {
      const progress = progressSubject.value;
      if (progress.status === 'completed' || progress.status === 'error' || progress.status === 'cancelled') {
        progressSubject.complete();
        this.operationsInProgress.delete(operationId);
        this.operationCancellations.delete(operationId);
      }
    }
  }

  /**
   * Get user-friendly error message for upload failures
   */
  private getUploadErrorMessage(error: any): string {
    if (error?.message?.includes('cancelled')) {
      return 'Upload cancelled by user';
    }

    if (error?.status) {
      switch (error.status) {
        case 413:
          return 'File is too large to upload';
        case 415:
          return 'File type is not supported';
        case 403:
          return 'Permission denied: Cannot upload to this location';
        case 507:
          return 'Insufficient storage space';
        case 409:
          return 'A file with this name already exists';
        default:
          return error?.error?.message || 'Upload failed due to server error';
      }
    }

    if (error?.message?.includes('network')) {
      return 'Upload failed due to network error';
    }

    return error?.message || 'Upload failed due to unknown error';
  }

  /**
   * Calculate estimated time remaining for upload
   */
  private calculateEstimatedTime(
    bytesTransferred: number,
    totalBytes: number,
    previousEstimate?: number
  ): number {
    if (bytesTransferred === 0) {
      return 0;
    }

    const progress = bytesTransferred / totalBytes;
    if (progress >= 1) {
      return 0;
    }

    // Simple estimation based on current progress
    // In a real implementation, you might want to track transfer rate over time
    const remainingBytes = totalBytes - bytesTransferred;
    const transferRate = bytesTransferred / (Date.now() / 1000); // bytes per second (rough estimate)

    if (transferRate === 0) {
      return previousEstimate || 0;
    }

    const estimatedSeconds = remainingBytes / transferRate;

    // Smooth the estimate with the previous value to avoid jumpy numbers
    if (previousEstimate) {
      return Math.round((estimatedSeconds + previousEstimate) / 2);
    }

    return Math.round(estimatedSeconds);
  }
}
