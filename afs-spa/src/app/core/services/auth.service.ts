import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, map, Observable, throwError} from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from '../models/login.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private storedCredentials: { username: string; password: string } | null = null;

  constructor(private http: HttpClient) {
    this.checkStoredAuth();
  }

  get currentUser$(): Observable<any> {
    return this.currentUserSubject.asObservable();
  }

  get isLoading$(): Observable<boolean> {
    return this.isLoadingSubject.asObservable();
  }

  get error$(): Observable<string | null> {
    return this.errorSubject.asObservable();
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => !!user)
    );
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.isLoadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.otpRequired) {
            // Store credentials for OTP verification
            this.storedCredentials = credentials;
          } else {
            this.handleAuthentication(response);
          }
          this.isLoadingSubject.next(false);
        }),
        catchError(error => {
          this.isLoadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  otpLogin(request: { username: string; password: string; otpCode: string }): Observable<LoginResponse> {
    this.isLoadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/otp-login`, request)
      .pipe(
        tap(response => {
          this.handleAuthentication(response);
          this.clearStoredCredentials();
          this.isLoadingSubject.next(false);
        }),
        catchError(error => {
          this.isLoadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  getStoredCredentials(): { username: string; password: string } | null {
    return this.storedCredentials;
  }

  private clearStoredCredentials(): void {
    this.storedCredentials = null;
  }

  private handleAuthentication(response: LoginResponse): void {
    this.currentUserSubject.next({
      username: response.username,
      userType: response.userType
    });
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify({
      username: response.username,
      userType: response.userType
    }));
  }

  private checkStoredAuth(): void {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this.logout();
      }
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}
