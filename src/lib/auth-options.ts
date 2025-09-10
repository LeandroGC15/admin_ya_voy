import type { NextAuthOptions, User, Session, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { loginSchema } from "@/features/auth/schemas/auth.schema"
import { z } from "zod"
import { loginAdmin } from "@/features/auth/services/auth.service"
import { AuthResponseData } from "@/features/auth/interfaces/authResponse";

// Extender los tipos de NextAuth para incluir las propiedades personalizadas
declare module "next-auth" {
  
  interface Session {
    user: {
      // Mantener las propiedades del usuario por defecto
      name?: string | null;
      email?: string | null;
      image?: string | null;
      // Nuestras propiedades personalizadas
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
    // Propiedades requeridas
    id: string;
    email?: string | null; // Hacer email opcional para coincidir con DefaultUser
    name?: string | null;
    // Nuestras propiedades personalizadas
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    permissions?: string[];
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



// Extend the User type to include the role
interface ExtendedUser extends User {
  role?: string;
  accessToken?: string;
  refreshToken?: string;
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
      console.log('User signed out');
    }
  },
  
  // Callbacks para personalizar el comportamiento de autenticación
  callbacks: {
    async jwt({ token, user }) {
      // Pasar las propiedades del usuario al token
      if (user) {
        // Asegurarse de que el ID siempre esté presente
        if (!user.id) {
          throw new Error('User ID is required');
        }
        
        // Actualizar el token con las propiedades del usuario
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
        };
      }
      return token;
    },
    
    async session({ session, token }) {
      // Pasar las propiedades del token a la sesión
      if (session.user) {
        // Asegurarse de que el ID siempre esté presente
        if (!token.id) {
          throw new Error('Token ID is required');
        }
        
        // Actualizar la sesión con las propiedades del token
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
            role: token.role,
            accessToken: token.accessToken,
          },
          accessToken: token.accessToken,
        };
      }
      return session;
    },
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
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);
          try {
            const authResponse = await loginAdmin({ email, password });
            console.log(`RESPUESTA authResponse ${authResponse}`)
            const user = {
              id: authResponse.admin.id.toString(),
              email: authResponse.admin.email,
              name: authResponse.admin.name,
              role: authResponse.admin.adminRole,
              accessToken: authResponse.accessToken,
              refreshToken: authResponse.refreshToken || '',
              permissions: authResponse.admin.adminPermissions || []
            };
            return user;
          } catch (apiError: any) {
            
            // Manejar errores específicos de la API
            if (apiError.response) {
              const { status, data } = apiError.response;
              
              // Mapear códigos de estado HTTP a mensajes de error específicos
              if (status === 401) {
                throw new Error('Credenciales inválidas');
              } else if (status === 403) {
                throw new Error('No tienes permiso para acceder a esta cuenta');
              } else if (status === 404) {
                throw new Error('Usuario no encontrado');
              } else if (status >= 500) {
                throw new Error('Error del servidor. Por favor, inténtalo de nuevo más tarde');
              } else if (data?.message) {
                // Usar el mensaje de error del servidor si está disponible
                throw new Error(data.message);
              }
            }
            
            // Si no podemos determinar el tipo de error, lanzar un error genérico
            throw new Error('Error al conectar con el servidor de autenticación');
          }
        } catch (error: any) {
          // Si es un error de validación de zod
          if (error instanceof z.ZodError) {
            console.error('Validation errors:', error.errors);
            throw new Error('Formato de correo o contraseña inválido');
          }
          
          // Si ya es un error con mensaje, lo propagamos
          if (error instanceof Error) {
            // Asegurarse de que el mensaje de error sea seguro para mostrar al usuario
            const safeMessage = error.message || 'Error desconocido al iniciar sesión';
            throw new Error(safeMessage);
          }
          
          // Cualquier otro error
          throw new Error('Error desconocido al iniciar sesión');
        }
      },
    }),
  ],
}
