import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { HttpService } from './http.service';
import { LoggerService } from './logger.service';
import { AuthService } from './auth.service';

export interface SystemStatus {
  status: 'Online' | 'Offline' | 'Degraded';
}

@Injectable({
  providedIn: 'root'
})
export class SystemStatusService {
  private statusSubject = new BehaviorSubject<SystemStatus>({
    status: 'Online'
  });

  status$: Observable<SystemStatus> = this.statusSubject.asObservable();

  constructor(
    private httpService: HttpService,
    private logger: LoggerService,
    private authService: AuthService
  ) {
    this.startStatusPolling();
  }

  private startStatusPolling() {
    timer(0, 5000).pipe( // check each 5 seconds
      switchMap(() => this.checkSystemStatus()),
      catchError((error) => {
        this.logger.error('System status check failed', error);
        this.statusSubject.next({
          status: 'Offline'
        });
        return [];
      })
    ).subscribe();
  }

  private checkSystemStatus(): Observable<SystemStatus> {
    // Only check status if authenticated
    if (!this.authService.isAuthenticated$) {
      return new Observable(observer => {
        observer.next({ status: 'Offline' });
        observer.complete();
      });
    }

    return this.httpService.get<SystemStatus>('/system/status').pipe(
      switchMap(status => {
        this.statusSubject.next({
          status: status.status
        });
        return [status];
      }),
      catchError((error) => {
        this.logger.error('System status check error', error);
        this.statusSubject.next({
          status: 'Offline'
        });
        return [];
      })
    );
  }
}
