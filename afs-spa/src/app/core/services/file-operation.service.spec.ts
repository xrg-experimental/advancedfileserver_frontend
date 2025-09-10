import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { FileOperationService } from './file-operation.service';
import { HttpService } from './http.service';
import { LoggerService } from './logger.service';
import { OperationResponse } from '../models/file.model';

describe('FileOperationService', () => {
  let service: FileOperationService;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpService', ['post', 'getFullUrl']);
    const httpClientSpyObj = jasmine.createSpyObj('HttpClient', ['request', 'get', 'post']);
    const loggerSpy = jasmine.createSpyObj('LoggerService', ['debug', 'warn', 'error', 'info']);

    TestBed.configureTestingModule({
      providers: [
        FileOperationService,
        { provide: HttpService, useValue: httpSpy },
        { provide: HttpClient, useValue: httpClientSpyObj },
        { provide: LoggerService, useValue: loggerSpy }
      ]
    });

    service = TestBed.inject(FileOperationService);
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
    httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    loggerServiceSpy = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;

    // Set up default return value for getFullUrl
    httpServiceSpy.getFullUrl.and.returnValue('http://localhost:3000/files/upload');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('renameItem', () => {
    it('should rename item successfully', (done) => {
      const mockResponse: OperationResponse = { success: true, message: 'Item renamed successfully' };
      httpServiceSpy.getFullUrl.and.returnValue('http://localhost:3000/files/rename');
      httpClientSpy.post.and.returnValue(of(mockResponse));

      service.renameItem('/test/file.txt', 'newname.txt').subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);

          expect(httpClientSpy.post).toHaveBeenCalled();
          const args = (httpClientSpy.post as jasmine.Spy).calls.mostRecent().args;
          expect(args[0]).toBe('http://localhost:3000/files/rename');
          expect(args[1]).toBeNull();
          const options = args[2];
          expect(options.params.get('path')).toBe('/test/file.txt');
          expect(options.params.get('newName')).toBe('newname.txt');

          expect(loggerServiceSpy.debug).toHaveBeenCalled();
          done();
        }
      });
    });

    it('should handle rename errors with user-friendly messages', (done) => {
      const error = new Error('permission denied');
      httpServiceSpy.getFullUrl.and.returnValue('http://localhost:3000/files/rename');
      httpClientSpy.post.and.returnValue(throwError(() => error));

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
    it('should upload file with progress tracking', (done) => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

      // Mock HTTP events for upload progress
      const progressEvent = {
        type: HttpEventType.UploadProgress,
        loaded: 50,
        total: 100
      };

      const responseEvent = {
        type: HttpEventType.Response,
        body: { success: true }
      } as HttpResponse<any>;

      httpClientSpy.request.and.returnValue(of(progressEvent, responseEvent));

      let progressCount = 0;
      service.uploadFile(mockFile, '/target').subscribe({
        next: (progress) => {
          progressCount++;

          if (progressCount === 1) {
            // Initial pending state
            expect(progress.type).toBe('upload');
            expect(progress.fileName).toBe('test.txt');
            expect(progress.status).toBe('pending');
            expect(progress.totalBytes).toBe(mockFile.size);
          } else if (progressCount === 2) {
            // Progress update
            expect(progress.status).toBe('in-progress');
            expect(progress.progress).toBe(50);
            expect(progress.bytesTransferred).toBe(50);
          } else if (progressCount === 3) {
            // Completion
            expect(progress.status).toBe('completed');
            expect(progress.progress).toBe(100);
            done();
          }
        }
      });
    });

    it('should handle upload errors', (done) => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const error = { status: 413, message: 'File too large' };

      httpClientSpy.request.and.returnValue(throwError(() => error));

      service.uploadFile(mockFile, '/target').subscribe({
        next: (progress) => {
          if (progress.status === 'error') {
            expect(progress.error).toContain('File is too large');
            done();
          }
        }
      });
    });

    it('should handle upload cancellation', (done) => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

      // Mock a long-running upload
      httpClientSpy.request.and.returnValue(of({
        type: HttpEventType.UploadProgress,
        loaded: 10,
        total: 100
      }));

      service.uploadFile(mockFile, '/target').subscribe({
        next: (progress) => {
          if (progress.status === 'pending' || progress.status === 'in-progress') {
            // Cancel the operation
            service.cancelOperation(progress.id);
          } else if (progress.status === 'cancelled') {
            expect(progress.status).toBe('cancelled');
            done();
          }
        }
      });
    });
  });

  describe('uploadFiles', () => {
    it('should upload multiple files with individual progress tracking', (done) => {
      const mockFiles = [
        new File(['content1'], 'test1.txt', { type: 'text/plain' }),
        new File(['content2'], 'test2.txt', { type: 'text/plain' })
      ];

      // Mock successful upload for both files
      httpClientSpy.request.and.returnValue(of({
        type: HttpEventType.Response,
        body: { success: true }
      } as HttpResponse<any>));

      service.uploadFiles(mockFiles, '/target').subscribe({
        next: (progresses) => {
          expect(progresses.length).toBe(2);
          expect(progresses[0].fileName).toBe('test1.txt');
          expect(progresses[1].fileName).toBe('test2.txt');

          // Check if all uploads are completed
          const allCompleted = progresses.every(p => p.status === 'completed');
          if (allCompleted) {
            done();
          }
        }
      });
    });
  });

  describe('downloadFile', () => {
    it('should return download progress observable with correct initial state', (done) => {
      // Mock a simple successful response
      httpClientSpy.get = jasmine.createSpy('get').and.returnValue(of({
        type: HttpEventType.Response,
        body: new Blob(['file content'], { type: 'text/plain' })
      } as HttpResponse<Blob>));

      // Mock URL.createObjectURL and related DOM methods
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:mock-url');
      spyOn(window.URL, 'revokeObjectURL');

      const mockAnchor = {
        href: '',
        download: '',
        style: { display: '' },
        click: jasmine.createSpy('click')
      } as any;

      spyOn(document, 'createElement').and.returnValue(mockAnchor);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');

      service.downloadFile('/test/file.txt').subscribe({
        next: (progress) => {
          expect(progress.type).toBe('download');
          expect(progress.fileName).toBe('file.txt');
          expect(progress.status).toBe('pending');
          expect(progress.progress).toBe(0);
          done();
        }
      });
    });
  });

  describe('cancelOperation', () => {
    it('should cancel operation and update status', (done) => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

      // Mock a pending upload request
      httpClientSpy.request.and.returnValue(of({
        type: HttpEventType.UploadProgress,
        loaded: 10,
        total: 100
      }));

      service.uploadFile(mockFile, '/target').subscribe({
        next: (progress) => {
          if (progress.status === 'cancelled') {
            expect(progress.status).toBe('cancelled');
            done();
          } else if (progress.status === 'pending') {
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

      // Mock upload request
      httpClientSpy.request.and.returnValue(of({
        type: HttpEventType.Response,
        body: { success: true }
      } as HttpResponse<any>));

      service.uploadFile(mockFile, '/target').subscribe({
        next: (progress) => {
          if (progress.status === 'pending') {
            service.getOperationProgress(progress.id).subscribe({
              next: (retrievedProgress) => {
                expect(retrievedProgress.id).toBe(progress.id);
                expect(retrievedProgress.fileName).toBe('test.txt');
                done();
              }
            });
          }
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
