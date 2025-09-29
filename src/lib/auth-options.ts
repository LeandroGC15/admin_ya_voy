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
  try {
    console.log("[Refresh] Intentando refresh token para:", token.admin?.email);

    const body: RefreshTokenRequest = {
      refreshToken: token.refreshToken,
    };

    const { data: payload } = await axios.post<
      ApiResponse<RefreshTokenResponse>
    >(
      getFullEndpoint(ENDPOINTS.auth.refresh),
      body,
      { headers: { "Content-Type": "application/json" } }
    );

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

    console.log(
      "[Refresh] Token refrescado:",
      JSON.stringify(refreshed, null, 2)
    );
    return refreshed;
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === "ECONNREFUSED") {
      console.warn("[Refresh] Backend no disponible, token no refrescado");
    } else if (axios.isAxiosError(error)) {
      console.error("[Refresh] Error al refrescar token:", error.message);
    } else {
      console.error("[Refresh] Error desconocido:", error);
    }

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
        if (!credentials) return null;

        console.log("[Login] Intentando login con:", credentials.email);

        try {
          const { data: payload } = await axios.post<
            ApiResponse<LoginResponse>
          >(
            getFullEndpoint(ENDPOINTS.auth.login),
            { email: credentials.email, password: credentials.password },
            { headers: { "Content-Type": "application/json" } }
          );

          console.log("[Login] Respuesta login:", payload);

          const loginData = payload.data;

          if (loginData) {
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


            return mappedUser;
          }

          console.warn("[Login] Credenciales inválidas");
          return null;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("[Login] Error en login:", error.message);
          } else {
            console.error("[Login] Error desconocido:", error);
          }
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
  },
  secret: process.env.NEXTAUTH_SECRET,
};
