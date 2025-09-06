import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  debug(message: string, ...args: any[]): void {
    if (environment.logging.level === 'debug' && environment.logging.enabled) {
      console.debug(message, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (environment.logging.enabled) {
      console.info(message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (environment.logging.enabled) {
      console.warn(message, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (environment.logging.enabled) {
      console.error(message, ...args);
    }
  }
}
