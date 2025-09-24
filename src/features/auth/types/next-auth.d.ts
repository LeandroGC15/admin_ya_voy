// src/features/auth/types/next-auth.d.ts
import NextAuth from "next-auth";

export interface Admin {
  id: number;
  name?: string;
  email?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    admin?: Admin;
    expiresIn: number;
  }

  interface User {
    id: string;
    accessToken: string;
    refreshToken: string;
    admin?: Admin;
    expiresIn: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string;
    refreshToken: string;
    admin?: Admin;
    expiresIn: number;
    accessTokenExpiry?: number;
    error?: string;
  }
}

export interface RefreshTokenRequest {
  email: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    admin: Admin;
    expiresIn: number;
  };
  message: string;
  statusCode: number;
}