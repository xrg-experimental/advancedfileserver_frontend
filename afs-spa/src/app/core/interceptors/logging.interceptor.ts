import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.logging.enabled) {
    return next(req);
  }

  const startTime = Date.now();
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          if (environment.logging.consoleOutput) {
            console.log(`[HTTP] ${req.method} ${req.urlWithParams} ${event.status} ${duration}ms`);
          }
          
          if (environment.logging.serverLogging) {
            // Implement server logging here if needed
            // You could send logs to a logging endpoint
          }
        }
      },
      error: (error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (environment.logging.consoleOutput) {
          console.error(`[HTTP] ${req.method} ${req.urlWithParams} ${error.status} ${duration}ms`);
          console.error('Error details:', error);
        }
      }
    })
  );
};
