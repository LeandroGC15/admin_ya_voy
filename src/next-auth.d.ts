import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Extiende el tipo de la sesión para incluir propiedades personalizadas.
   */
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      role?: string;
      permissions?: string[];
    } & DefaultSession['user'];
  }

  /**
   * Extiende el tipo de usuario para incluir propiedades personalizadas.
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    permissions?: string[];
    expiresIn?: number;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extiende el token JWT para incluir propiedades personalizadas.
   */
  interface JWT {
    id: string;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    permissions?: string[];
    expiresIn?: number;
  }
}
