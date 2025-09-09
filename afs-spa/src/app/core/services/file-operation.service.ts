import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { LoggerService } from './logger.service';
import { Observable, throwError, timer, of, BehaviorSubject } from 'rxjs';
import { catchError, retry, timeout, finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
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
   * Upload a file with progress tracking (method signature for future implementation)
   */
  uploadFile(file: File, targetPath: string): Observable<OperationProgress> {
    const operationId = this.generateOperationId();
    const progressSubject = new BehaviorSubject<OperationProgress>({
      id: operationId,
      type: 'upload',
      fileName: file.name,
      progress: 0,
      status: 'pending'
    });

    this.operationsInProgress.set(operationId, progressSubject);
    this.operationCancellations.set(operationId, new BehaviorSubject<boolean>(false));

    // TODO: Implement actual upload logic in future task
    // For now, return the progress observable that will be implemented later
    this.logger.debug('FileOperationService: Upload method called (implementation pending)', {
      fileName: file.name,
      targetPath,
      operationId
    });

    // Simulate the pending state for now
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

    const cancellationSubject = this.operationCancellations.get(operationId);
    if (cancellationSubject) {
      cancellationSubject.next(true);
    }

    const progressSubject = this.operationsInProgress.get(operationId);
    if (progressSubject) {
      const currentProgress = progressSubject.value;
      progressSubject.next({
        ...currentProgress,
        status: 'cancelled'
      });
      progressSubject.complete();
      this.operationsInProgress.delete(operationId);
    }

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
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
}
