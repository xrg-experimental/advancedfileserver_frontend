import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private apiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.statusText}`;
    }

    this.logger.error('HTTP Request Error', {
      url: error.url,
      status: error.status,
      message: errorMessage
    });

    return throwError(() => new Error(errorMessage));
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}
