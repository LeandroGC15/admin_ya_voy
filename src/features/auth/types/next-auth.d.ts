// src/features/auth/types/next-auth.d.ts
import NextAuth from "next-auth";

// Admin completo según API
export interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive?: boolean; // opcional si tu backend lo maneja
  [key: string]: unknown;
}

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    admin: Admin;
    expiresIn: number; // timestamp UNIX
  }

  interface User {
    id: string;
    accessToken: string;
    refreshToken: string;
    admin: Admin;
    expiresIn: number; // timestamp UNIX
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string;
    refreshToken: string;
    admin: Admin;
    expiresIn: number; // timestamp UNIX
    accessTokenExpiry?: number; // milisegundos
    error?: string;
  }
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  user: Admin;
  expires_in: number; // timestamp UNIX
}
