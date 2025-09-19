/**
 * Login credentials for authentication
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponseData {
    accessToken: string;
    refreshToken: string;
    admin: {
      id: string;
      email: string;
      name: string;
    };
    expiresIn: number;
  }
  

export * from './authResponse';
