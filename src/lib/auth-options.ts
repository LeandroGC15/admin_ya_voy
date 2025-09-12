import type { NextAuthOptions, User, Session, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { loginSchema } from "@/features/auth/schemas/auth.schema"
import { z } from "zod"
import { loginAdmin } from "@/features/auth/services/auth.service"

// Extender los tipos de NextAuth para incluir las propiedades personalizadas
declare module "next-auth" {
  
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id: string;
      role?: string;
      accessToken?: string;
    };
    accessToken?: string;
  }

  /**
   * Extiende la interfaz de usuario por defecto
   */
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    permissions?: string[];
    [key: string]: any; // Allow additional properties
  }
}

/**
 * Extender la interfaz JWT para incluir nuestras propiedades personalizadas
 */
declare module "next-auth/jwt" {
  interface JWT {
    // Propiedades estándar
    name?: string | null;
    email?: string | null;
    sub?: string;
    // Nuestras propiedades personalizadas
    id: string;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}


export const authOptions: NextAuthOptions = {
  // Configuración de la sesión
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  
  // Configuración de páginas personalizadas
  pages: {
    signIn: "/login",
  },
  
  // Configuración de depuración
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  
  // Configuración de cookies
  cookies: process.env.NODE_ENV === 'development' ? {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
  } : {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: process.env.NODE_ENV === 'production' ? '.tudominio.com' : undefined,
      },
    },
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  // Configuración de la estrategia JWT
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  
  // Configuración de eventos
  events: {
    async signIn(message) {
      console.log('User signed in:', message.user?.email);
    },
    async signOut() {
      console.log('User signed out and store cleared');
    }
  },
  
  // Callbacks para personalizar el comportamiento de autenticación
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        // Asegurarse de que el ID siempre esté presente
        if (!user.id) {
          throw new Error('User ID is required');
        }
      
        const extendedUser = user as User & { authData?: any };
        return {
          ...token,
          id: extendedUser.id,
          name: extendedUser.name,
          email: extendedUser.email,
          role: extendedUser.role,
          accessToken: extendedUser.accessToken,
          refreshToken: extendedUser.refreshToken,
          permissions: extendedUser.permissions || [],
          ...(extendedUser.authData ? { authData: extendedUser.authData } : {}) // Include authData if it exists
        };
      }
      
      // For subsequent requests, return the existing token
      return token;
    },
    
    async session({ session, token }) {
      console.log('Session callback - Token:', token);
      
      // Ensure we have a valid token
      if (!token) {
        console.warn('No token provided to session callback');
        return session;
      }

      // Ensure we have a valid user object in the session
      if (!session.user) {
        console.warn('No user object in session');
        return session;
      }

      // Ensure we have required token data
      if (!token.id) {
        console.warn('No user ID found in token');
        return session;
      }

      // Create a new user object with all the necessary data
      const userData = {
        ...session.user,
        id: token.id as string,
        ...(token.name && { name: token.name as string }),
        ...(token.email && { email: token.email as string }),
        ...(token.role && { role: token.role as string }),
        ...(token.accessToken && { accessToken: token.accessToken as string }),
        ...(token.refreshToken && { refreshToken: token.refreshToken as string }),
        ...(token.permissions && { permissions: token.permissions as string[] })
      };

      // Only add authData if it exists and is an object
      if (token.authData && typeof token.authData === 'object') {
        (userData as any).authData = token.authData;
      }

      console.log('Session callback - User data:', userData);

      return {
        ...session,
        user: userData,
        ...(token.accessToken && { accessToken: token.accessToken as string }),
        expires: session.expires
      };
    }
  },
  
  // Proveedores de autenticación
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "correo@ejemplo.com"
        },
        password: { 
          label: "Contraseña", 
          type: "password",
          placeholder: "••••••••"
        },
      },
      // Configuración específica para el proveedor de credenciales
      async authorize(credentials, req): Promise<User | null> {
        try {
          if (!credentials) {
            console.error('No credentials provided');
            return null;
          }
          
          // Validate credentials with Zod
          const validatedCredentials = loginSchema.parse(credentials);
          
          // Try to authenticate with the API
          const response = await loginAdmin({
            email: validatedCredentials.email,
            password: validatedCredentials.password
          });

          // If authentication is successful, return the user
          if (response && response.accessToken && response.admin) {
            const userData: User = {
              id: response.admin.id.toString(),
              email: response.admin.email,
              name: response.admin.name || response.admin.email.split('@')[0],
              role: response.admin.adminRole,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              permissions: response.admin.adminPermissions || [],
              authData: response // Include all response data
            };
            
            console.log('User authenticated successfully:', userData);
            return userData;
          }
          
          console.error('Authentication failed - invalid response format');
          return null;
        } catch (error: any) {
          if (error instanceof z.ZodError) {
            console.error('Validation errors:', error.errors);
            return Promise.reject(new Error('Formato de correo o contraseña inválido'));
          }
          
          // Return error message
          const safeMessage = error?.message || 'Error desconocido al iniciar sesión';
          return Promise.reject(new Error(safeMessage));
        }
      },
    }),
  ],
}
