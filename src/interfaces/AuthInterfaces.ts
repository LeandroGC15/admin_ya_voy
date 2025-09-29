/**
 * Authentication related interfaces
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface Admin {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'supervisor';
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: Admin;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  admin: Admin;
  expiresIn: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
