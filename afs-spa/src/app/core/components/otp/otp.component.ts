import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="otp-container">
      <h2>Two-Factor Authentication</h2>
      <p>Please enter your OTP code to continue</p>

      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <form [formGroup]="otpForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill">
          <mat-label>OTP Code</mat-label>
          <input matInput formControlName="otpCode" type="text" required>
          <mat-error *ngIf="otpForm.get('otpCode')?.hasError('required')">
            OTP code is required
          </mat-error>
        </mat-form-field>

        <button mat-raised-button color="primary" type="submit"
                [disabled]="!otpForm.valid || isLoading">
          Verify
        </button>
      </form>
    </div>
  `,
  styles: [`
    .otp-container {
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
      text-align: center;
      margin-top: 100px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 1rem;
    }

    button {
      width: 100%;
    }

    .error-message {
      color: #f44336;
      margin: 1rem 0;
      padding: 0.5rem;
      border-radius: 4px;
      background-color: rgba(244, 67, 54, 0.1);
    }
  `]
})
export class OtpComponent implements OnInit {
  otpForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.otpForm = this.fb.group({
      otpCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    // Check if we have stored credentials
    if (!this.authService.getStoredCredentials()) {
      this.router.navigate(['/login']);
    }
  }

  onSubmit(): void {
    if (!this.otpForm.valid) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    const credentials = this.authService.getStoredCredentials();

    if (!credentials) {
      this.error = 'No stored credentials found';
      this.isLoading = false;
      return;
    }

    const { username, password } = credentials;
    const otpCode = this.otpForm.get('otpCode')?.value;

    if (!otpCode) {
      this.error = 'OTP code is required';
      this.isLoading = false;
      return;
    }

    this.authService.otpLogin({ username, password, otpCode }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Invalid OTP code';
      }
    });
  }
}
