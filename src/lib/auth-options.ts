import { AuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  Admin,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from "../features/auth/types/next-auth";
import axios from "axios";
import { ENDPOINTS, getFullEndpoint } from "./endpoints";
import { JWT } from "next-auth/jwt";

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: Admin;
  expires_in: number; // timestamp unix
}

// 🔹 Usuario mapeado para NextAuth
export interface MappedUser extends NextAuthUser {
  id: string;
  accessToken: string;
  refreshToken: string;
  admin: Admin;
  role: string;
  permissions: string[];
  expiresIn: number; // timestamp unix
  accessTokenExpiry: number; // ms
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  console.log("[Refresh] ========================================");
  console.log("[Refresh] 🔄 Iniciando refresh token");
  console.log("[Refresh] 👤 Email:", token.admin?.email);
  
  try {
    const refreshUrl = getFullEndpoint(ENDPOINTS.auth.refresh, 'v1');
    const body: RefreshTokenRequest = {
      refreshToken: token.refreshToken,
    };

    console.log("[Refresh] 📡 URL del endpoint:", refreshUrl);
    console.log("[Refresh] 📦 Endpoint base:", ENDPOINTS.auth.refresh);
    console.log("[Refresh] 📤 Refresh Token:", token.refreshToken?.substring(0, 20) + "...");

    const { data: payload } = await axios.post<
      ApiResponse<RefreshTokenResponse>
    >(
      refreshUrl,
      body,
      { 
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    console.log("[Refresh] ✅ Respuesta recibida del backend");
    console.log("[Refresh] 📥 Status Code:", payload.statusCode);
    console.log("[Refresh] 📥 Message:", payload.message);

    const refreshedData = payload.data;

    const refreshed: JWT = {
      ...token,
      accessToken: refreshedData.access_token,
      refreshToken: refreshedData.refresh_token,
      admin: refreshedData.user,
      role: refreshedData.user.role,
      permissions: refreshedData.user.permissions,
      expiresIn: refreshedData.expires_in,
      accessTokenExpiry: refreshedData.expires_in * 1000,
      id: token.id,
    };

    console.log("[Refresh] ✅ Token refrescado exitosamente");
    console.log("[Refresh] 🔑 Nuevo Access Token:", refreshedData.access_token?.substring(0, 20) + "...");
    console.log("[Refresh] 🔑 Nuevo Refresh Token:", refreshedData.refresh_token?.substring(0, 20) + "...");
    console.log("[Refresh] ========================================");
    return refreshed;
  } catch (error) {
    console.error("[Refresh] ❌ Error al refrescar token");
    console.error("[Refresh] ========================================");
    
    if (axios.isAxiosError(error)) {
      console.error("[Refresh] Error Type: Axios Error");
      console.error("[Refresh] Error Message:", error.message);
      console.error("[Refresh] Error Code:", error.code);
      console.error("[Refresh] Status Code:", error.response?.status);
      console.error("[Refresh] Response Data:", JSON.stringify(error.response?.data, null, 2));
      console.error("[Refresh] Request URL:", error.config?.url);
      
      if (error.code === "ECONNREFUSED") {
        console.warn("[Refresh] ⚠️ Backend no disponible, token no refrescado");
      } else if (error.response) {
        console.error("[Refresh] ❌ El servidor respondió con error:", error.response.status);
      } else if (error.request) {
        console.error("[Refresh] ❌ No se recibió respuesta del servidor");
      }
    } else {
      console.error("[Refresh] Error desconocido:", error);
    }
    
    console.log("[Refresh] ========================================");

    return {
      ...token,
      error: "RefreshAccessTokenError",
      id: token.id,
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<MappedUser | null> {
        if (!credentials) {
          console.log("[Login] ❌ No se proporcionaron credenciales");
          return null;
        }

        console.log("[Login] ========================================");
        console.log("[Login] 🔐 Iniciando proceso de autenticación");
        console.log("[Login] Email:", credentials.email);
        console.log("[Login] Password length:", credentials.password?.length || 0);

        const loginUrl = getFullEndpoint(ENDPOINTS.auth.login, 'v1');
        const requestBody = { 
          email: credentials.email, 
          password: credentials.password 
        };

        console.log("[Login] 📡 URL del endpoint:", loginUrl);
        console.log("[Login] 📦 Endpoint base:", ENDPOINTS.auth.login);
        console.log("[Login] 📤 Request body:", { 
          email: requestBody.email, 
          password: requestBody.password ? `***${requestBody.password.slice(-2)}` : 'empty' 
        });

        try {
          console.log("[Login] ⏳ Enviando petición al backend...");
          
          const { data: payload } = await axios.post<
            ApiResponse<LoginResponse>
          >(
            loginUrl,
            requestBody,
            { 
              headers: { "Content-Type": "application/json" },
              timeout: 10000, // 10 segundos timeout
            }
          );

          console.log("[Login] ✅ Respuesta recibida del backend");
          console.log("[Login] 📥 Status Code:", payload.statusCode);
          console.log("[Login] 📥 Message:", payload.message);
          console.log("[Login] 📥 Data recibida:", JSON.stringify(payload.data, null, 2));

          const loginData = payload.data;

          if (loginData) {
            console.log("[Login] ✅ Login exitoso");
            console.log("[Login] 👤 Usuario:", loginData.user.email);
            console.log("[Login] 🔑 Access Token:", loginData.access_token?.substring(0, 20) + "...");
            console.log("[Login] 🔑 Refresh Token:", loginData.refresh_token?.substring(0, 20) + "...");
            console.log("[Login] ⏰ Expires In:", loginData.expires_in);

            const mappedUser: MappedUser = {
              id: loginData.user.id.toString(),
              name: loginData.user.name,
              email: loginData.user.email,
              accessToken: loginData.access_token,
              refreshToken: loginData.refresh_token,
              admin: loginData.user,
              role: loginData.user.role,
              permissions: loginData.user.permissions,
              expiresIn: loginData.expires_in,
              accessTokenExpiry: loginData.expires_in * 1000,
            };

            console.log("[Login] ✅ Usuario mapeado correctamente");
            console.log("[Login] ========================================");
            return mappedUser;
          }

          console.warn("[Login] ⚠️ Credenciales inválidas - no hay data en la respuesta");
          console.log("[Login] ========================================");
          return null;
        } catch (error) {
          console.error("[Login] ❌ Error en el proceso de login");
          console.error("[Login] ========================================");
          
          if (axios.isAxiosError(error)) {
            console.error("[Login] Error Type: Axios Error");
            console.error("[Login] Error Message:", error.message);
            console.error("[Login] Error Code:", error.code);
            console.error("[Login] Status Code:", error.response?.status);
            console.error("[Login] Status Text:", error.response?.statusText);
            console.error("[Login] Response Data:", JSON.stringify(error.response?.data, null, 2));
            console.error("[Login] Request URL:", error.config?.url);
            console.error("[Login] Request Method:", error.config?.method);
            console.error("[Login] Request Headers:", error.config?.headers);
            
            if (error.response) {
              // El servidor respondió con un código de estado fuera del rango 2xx
              console.error("[Login] ❌ El servidor respondió con error:", error.response.status);
              if (error.response.status === 404) {
                console.error("[Login] ❌ Endpoint no encontrado. Verifica la URL:", loginUrl);
              } else if (error.response.status === 401) {
                console.error("[Login] ❌ Credenciales inválidas o no autorizado");
              } else if (error.response.status === 500) {
                console.error("[Login] ❌ Error interno del servidor");
              }
            } else if (error.request) {
              // La petición fue hecha pero no se recibió respuesta
              console.error("[Login] ❌ No se recibió respuesta del servidor");
              console.error("[Login] Request:", error.request);
            } else {
              // Algo pasó al configurar la petición
              console.error("[Login] ❌ Error al configurar la petición:", error.message);
            }
          } else {
            console.error("[Login] Error desconocido:", error);
          }
          
          console.log("[Login] ========================================");
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 3600,
  },
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {

      // 🔹 Primer login → propagar campos
      if (user) {
        const merged: JWT = {
          ...token,
          id: (user as MappedUser).id,
          name: user.name,
          email: user.email,
          accessToken: (user as MappedUser).accessToken,
          refreshToken: (user as MappedUser).refreshToken,
          admin: (user as MappedUser).admin,
          role: (user as MappedUser).role,
          permissions: (user as MappedUser).permissions,
          expiresIn: (user as MappedUser).expiresIn,
          accessTokenExpiry: (user as MappedUser).accessTokenExpiry,
        };

        return merged;
      }

      // 🔹 Token aún válido
      if (token.accessTokenExpiry && Date.now() < token.accessTokenExpiry) {
        return token as unknown as JWT;
      }

      // 🔹 Token expirado → refrescar
      const refreshed = await refreshAccessToken(token as unknown as JWT);
      return refreshed;
    },

    async session({ session, token }) {

      const jwtToken = token as unknown as JWT;
      session.user = {
        id: jwtToken.id,
        name: jwtToken.name,
        email: jwtToken.email,
        role: jwtToken.admin.role,
        permissions: jwtToken.admin.permissions,
      };

      session.accessToken = jwtToken.accessToken;
      session.refreshToken = jwtToken.refreshToken;
      session.admin = jwtToken.admin;
      session.expiresIn = jwtToken.expiresIn;


      if (jwtToken.error) {

        if (typeof window !== "undefined")
          alert("Error en sesión: " + jwtToken.error);
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirigir errores de autenticación al login
  },
  secret: process.env.NEXTAUTH_SECRET,
};
