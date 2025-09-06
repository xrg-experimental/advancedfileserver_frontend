export interface LoginRequest {
  username: string;
  password: string;
}

export interface OtpLoginRequest {
  username: string;
  password: string;
  otpCode: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  userType: string;
  refreshWindowStart: number;
  refreshWindowEnd: number;
  otpRequired: boolean;
}
