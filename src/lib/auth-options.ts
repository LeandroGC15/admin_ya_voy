import type { NextAuthOptions, User, Session, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { loginSchema } from "@/features/auth/schemas/auth.schema"
import { z } from "zod"

// Extender los tipos de NextAuth para incluir las propiedades personalizadas
declare module "next-auth" {
  /**
   * Extiende la interfaz de sesión por defecto
   */
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://72.60.119.19:3001';

// Extend the User type to include the role
interface ExtendedUser extends User {
  role?: string;
  accessToken?: string;
  refreshToken?: string;
}

// Extend the Session type to include the role
interface ExtendedSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    accessToken?: string;
  };
  accessToken?: string;
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
    error: "/login",
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
        console.log('=== AUTHORIZE FUNCTION STARTED ===');
        
        try {
          // 1. Verificar credenciales
          if (!credentials) {
            console.error('❌ No credentials provided');
            throw new Error('No se proporcionaron credenciales');
          }
          
          // 2. Validar formato de credenciales
          console.log('🔍 Validating credentials format...');
          const { email, password } = loginSchema.parse(credentials);
          console.log('✅ Credentials format is valid');
          
          // 3. Preparar la petición al backend
          console.log('📡 Preparing request to backend...');
          const requestBody = { 
            email: email.trim(), 
            password: password.trim() 
          };
          
          const requestUrl = `${API_URL}/admin/auth/login`;
          
          // Mostrar información de depuración
          console.log('📤 Sending request to:', requestUrl);
          console.log('📝 Request body:', JSON.stringify(requestBody, null, 2));
          
          // Verificar si la URL de la API está definida
          if (!API_URL) {
            console.error('❌ API_URL is not defined');
            throw new Error('Error de configuración del servidor');
          }
          
          // 4. Realizar la petición al backend
          const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(requestBody)
          });
          
          console.log(`📥 Response status: ${response.status} ${response.statusText}`);
          
          // 5. Procesar la respuesta
          let responseData;
          try {
            responseData = await response.json();
            console.log('📦 Response data:', JSON.stringify(responseData, null, 2));
          } catch (jsonError) {
            console.error('❌ Error parsing JSON response:', jsonError);
            const textResponse = await response.text();
            console.error('📝 Raw response:', textResponse);
            throw new Error('Formato de respuesta inválido del servidor');
          }
          
          if (!response.ok) {
            console.error('❌ API error response:', responseData);
            throw new Error(responseData.message || `Error en la autenticación (${response.status})`);
          }
          
          // 6. Verificar la estructura de la respuesta
          const responseDataToUse = responseData.data || responseData;
          
          if (!responseDataToUse) {
            console.error('❌ Empty response from server');
            throw new Error('El servidor no devolvió datos');
          }
          
          if (!responseDataToUse.accessToken || !responseDataToUse.admin) {
            console.error('❌ Invalid response format. Expected accessToken and admin data');
            console.error('Response received:', JSON.stringify(responseDataToUse, null, 2));
            throw new Error('Formato de respuesta inválido: faltan datos requeridos');
          }
        
          // 7. Crear el objeto de usuario
          const user = {
            id: responseDataToUse.admin.id?.toString() || '',
            email: responseDataToUse.admin.email || email,
            name: responseDataToUse.admin.name || 'Admin User',
            role: responseDataToUse.admin.adminRole || 'admin',
            accessToken: responseDataToUse.accessToken,
            refreshToken: responseDataToUse.refreshToken,
            permissions: responseDataToUse.admin.adminPermissions || []
          };
          
          if (!user.id) {
            throw new Error('ID de usuario no proporcionado');
          }
          
          console.log('✅ User authenticated successfully:', {
            id: user.id,
            email: user.email,
            role: user.role
          });
          
          return user;
        } catch (error) {
          console.error('❌ Outer authentication error:', error);
          
          // Si es un error de validación de zod
          if (error instanceof z.ZodError) {
            console.error('Validation errors:', error.errors);
            throw new Error('Formato de correo o contraseña inválido');
          }
          
          // Si ya es un error con mensaje, lo propagamos
          if (error instanceof Error) {
            throw error;
          }
          
          // Cualquier otro error
          throw new Error('Error desconocido al iniciar sesión');
        }
      },
    }),
  ],
}
