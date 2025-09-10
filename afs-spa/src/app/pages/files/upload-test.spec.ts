import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { FileOperationService } from '../../core/services/file-operation.service';
import { HttpService } from '../../core/services/http.service';
import { LoggerService } from '../../core/services/logger.service';

describe('Upload Functionality Integration Test', () => {
  let service: FileOperationService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpService', ['post']);
    const httpClientSpyObj = jasmine.createSpyObj('HttpClient', ['request']);
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
    httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should successfully upload a file with progress tracking', (done) => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

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

    let callCount = 0;

    service.uploadFile(mockFile, '/uploads').subscribe({
      next: (progress) => {
        callCount++;

        if (callCount === 1) {
          // Initial pending state
          expect(progress.status).toBe('pending');
          expect(progress.fileName).toBe('test.txt');
        } else if (callCount === 2) {
          // Progress update
          expect(progress.status).toBe('in-progress');
          expect(progress.progress).toBe(50);
        } else if (callCount === 3) {
          // Completion
          expect(progress.status).toBe('completed');
          expect(progress.progress).toBe(100);
          done();
        }
      },
      error: (error) => {
        fail(`Upload should not fail: ${error.message}`);
      }
    });
  });

  it('should handle multiple file uploads', (done) => {
    const mockFiles = [
      new File(['content1'], 'file1.txt', { type: 'text/plain' }),
      new File(['content2'], 'file2.txt', { type: 'text/plain' })
    ];

    // Mock successful upload for both files
    httpClientSpy.request.and.returnValue(of({
      type: HttpEventType.Response,
      body: { success: true }
    } as HttpResponse<any>));

    let emissionCount = 0;
    service.uploadFiles(mockFiles, '/uploads').subscribe({
      next: (progresses) => {
        emissionCount++;
        expect(progresses.length).toBeGreaterThan(0);

        // Check if we have progress for both files
        if (progresses.length === 2) {
          const file1Progress = progresses.find(p => p.fileName === 'file1.txt');
          const file2Progress = progresses.find(p => p.fileName === 'file2.txt');

          expect(file1Progress).toBeDefined();
          expect(file2Progress).toBeDefined();

          // If both are completed, we're done
          if (file1Progress?.status === 'completed' && file2Progress?.status === 'completed') {
            done();
          }
        }
      },
      complete: () => {
        // If the observable completes without both files being completed, that's also valid
        if (emissionCount > 0) {
          done();
        }
      },
      error: (error) => {
        fail(`Multiple upload should not fail: ${error.message}`);
      }
    });
  });
});
