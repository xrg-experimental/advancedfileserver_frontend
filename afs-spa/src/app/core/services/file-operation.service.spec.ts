import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FileOperationService } from './file-operation.service';
import { HttpService } from './http.service';
import { LoggerService } from './logger.service';
import { OperationResponse } from '../models/file.model';

describe('FileOperationService', () => {
  let service: FileOperationService;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpService', ['post']);
    const loggerSpy = jasmine.createSpyObj('LoggerService', ['debug', 'warn', 'error']);

    TestBed.configureTestingModule({
      providers: [
        FileOperationService,
        { provide: HttpService, useValue: httpSpy },
        { provide: LoggerService, useValue: loggerSpy }
      ]
    });

    service = TestBed.inject(FileOperationService);
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
    loggerServiceSpy = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('renameItem', () => {
    it('should rename item successfully', (done) => {
      const mockResponse: OperationResponse = { success: true, message: 'Item renamed successfully' };
      httpServiceSpy.post.and.returnValue(of(mockResponse));

      service.renameItem('/test/file.txt', 'newname.txt').subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(httpServiceSpy.post).toHaveBeenCalledWith('/files/rename', {
            oldPath: '/test/file.txt',
            newName: 'newname.txt'
          });
          expect(loggerServiceSpy.debug).toHaveBeenCalled();
          done();
        }
      });
    });

    it('should handle rename errors with user-friendly messages', (done) => {
      const error = new Error('permission denied');
      httpServiceSpy.post.and.returnValue(throwError(() => error));

      service.renameItem('/test/file.txt', 'newname.txt').subscribe({
        error: (err) => {
          expect(err.message).toContain('Permission denied');
          expect(loggerServiceSpy.error).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('moveItem', () => {
    it('should move item successfully', (done) => {
      const mockResponse: OperationResponse = { success: true, message: 'Item moved successfully' };
      httpServiceSpy.post.and.returnValue(of(mockResponse));

      service.moveItem('/source/file.txt', '/target/file.txt').subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(httpServiceSpy.post).toHaveBeenCalledWith('/files/move', {
            sourcePath: '/source/file.txt',
            targetPath: '/target/file.txt'
          });
          done();
        }
      });
    });

    it('should handle move errors', (done) => {
      const error = new Error('not found');
      httpServiceSpy.post.and.returnValue(throwError(() => error));

      service.moveItem('/source/file.txt', '/target/file.txt').subscribe({
        error: (err) => {
          expect(err.message).toContain('Item not found');
          done();
        }
      });
    });
  });

  describe('deleteItem', () => {
    it('should delete item successfully', (done) => {
      const mockResponse: OperationResponse = { success: true, message: 'Item deleted successfully' };
      httpServiceSpy.post.and.returnValue(of(mockResponse));

      service.deleteItem('/test/file.txt').subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(httpServiceSpy.post).toHaveBeenCalledWith('/files/delete', {
            path: '/test/file.txt'
          });
          done();
        }
      });
    });
  });

  describe('createDirectory', () => {
    it('should create directory successfully', (done) => {
      const mockResponse: OperationResponse = { success: true, message: 'Directory created successfully' };
      httpServiceSpy.post.and.returnValue(of(mockResponse));

      service.createDirectory('/test', 'newdir').subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(httpServiceSpy.post).toHaveBeenCalledWith('/files/create-directory', {
            path: '/test',
            name: 'newdir'
          });
          done();
        }
      });
    });

    it('should handle directory creation errors', (done) => {
      const error = new Error('already exists');
      httpServiceSpy.post.and.returnValue(throwError(() => error));

      service.createDirectory('/test', 'newdir').subscribe({
        error: (err) => {
          expect(err.message).toContain('Item already exists');
          done();
        }
      });
    });
  });

  describe('uploadFile', () => {
    it('should return progress observable for upload (method signature)', (done) => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      
      service.uploadFile(mockFile, '/target').subscribe({
        next: (progress) => {
          expect(progress.type).toBe('upload');
          expect(progress.fileName).toBe('test.txt');
          expect(progress.status).toBe('pending');
          expect(loggerServiceSpy.debug).toHaveBeenCalledWith(
            jasmine.stringContaining('Upload method called (implementation pending)'),
            jasmine.any(Object)
          );
          done();
        }
      });
    });
  });

  describe('downloadFile', () => {
    it('should return progress observable for download (method signature)', (done) => {
      service.downloadFile('/test/file.txt').subscribe({
        next: (progress) => {
          expect(progress.type).toBe('download');
          expect(progress.fileName).toBe('file.txt');
          expect(progress.status).toBe('pending');
          expect(loggerServiceSpy.debug).toHaveBeenCalledWith(
            jasmine.stringContaining('Download method called (implementation pending)'),
            jasmine.any(Object)
          );
          done();
        }
      });
    });
  });

  describe('cancelOperation', () => {
    it('should cancel operation and update status', (done) => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      
      service.uploadFile(mockFile, '/target').subscribe({
        next: (progress) => {
          if (progress.status === 'cancelled') {
            expect(progress.status).toBe('cancelled');
            done();
          } else {
            // Cancel the operation after initial progress
            service.cancelOperation(progress.id);
          }
        }
      });
    });
  });

  describe('getOperationProgress', () => {
    it('should return progress for existing operation', (done) => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      
      service.uploadFile(mockFile, '/target').subscribe({
        next: (progress) => {
          service.getOperationProgress(progress.id).subscribe({
            next: (retrievedProgress) => {
              expect(retrievedProgress.id).toBe(progress.id);
              expect(retrievedProgress.fileName).toBe('test.txt');
              done();
            }
          });
        }
      });
    });

    it('should throw error for non-existent operation', (done) => {
      service.getOperationProgress('non-existent-id').subscribe({
        error: (err) => {
          expect(err.message).toContain('Operation non-existent-id not found');
          done();
        }
      });
    });
  });

  describe('getActiveOperations', () => {
    it('should return list of active operations', (done) => {
      service.getActiveOperations().subscribe({
        next: (operations) => {
          expect(Array.isArray(operations)).toBe(true);
          done();
        }
      });
    });
  });
});