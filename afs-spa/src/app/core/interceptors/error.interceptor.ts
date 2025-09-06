import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side errors
        errorMessage = `Client Error: ${error.error.message}`;
      } else {
        // Server-side errors
        switch (error.status) {
          case 400:
            errorMessage = 'Bad Request: Invalid data submitted';
            break;
          case 401:
            errorMessage = 'Unauthorized: Please log in again';
            authService.logout();
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'Forbidden: You do not have permission';
            break;
          case 404:
            errorMessage = 'Not Found: The requested resource does not exist';
            break;
          case 500:
            errorMessage = 'Server Error: Internal server problem';
            break;
          default:
            errorMessage = `Server Error: ${error.status} - ${error.statusText}`;
        }
      }

      // Log the error (you might want to add a proper logging service later)
      console.error('HTTP Error', {
        url: req.url,
        status: error.status,
        message: errorMessage
      });

      return throwError(() => new Error(errorMessage));
    })
  );
};
