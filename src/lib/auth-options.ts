import { AuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Admin, RefreshTokenRequest, RefreshTokenResponse } from "../features/auth/types/next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";
import { User } from "next-auth";
import axios from "axios";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: Admin;
  expiresIn: number; // en segundos
}

// JWT personalizado
export interface JWT extends NextAuthUser {
  id: string; // obligatorio
  accessToken: string;
  refreshToken: string;
  admin?: Admin;
  expiresIn: number;
  accessTokenExpiry?: number;
  error?: string;
}
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    console.log("[Refresh] Intentando refresh token para:", token.admin?.email);

    const body: RefreshTokenRequest = {
      email: token.admin!.email!,
      refreshToken: token.refreshToken,
    };

    const { data } = await axios.post<RefreshTokenResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}admin/auth/refresh-token`,
      body,
      { headers: { "Content-Type": "application/json" } }
    );

    return {
      ...token,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
      admin: data.data.admin,
      expiresIn: data.data.expiresIn,
      accessTokenExpiry: Date.now() + data.data.expiresIn * 1000,
      id: token.id,
    };
  } catch (error: any) {
    // Manejo silencioso de errores de conexión
    if (axios.isAxiosError(error) && error.code === "ECONNREFUSED") {
      console.warn("[Refresh] Backend no disponible, token no refrescado");
    } else {
      console.error("[Refresh] Error al refrescar token:", error.message);
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
      async authorize(credentials) {
        if (!credentials) return null;

        console.log("[Login] Intentando login con:", credentials.email);

        try {
          const { data } = await axios.post<{ data: LoginResponse }>(
            `${process.env.NEXT_PUBLIC_API_URL}admin/auth/login`,
            { email: credentials.email, password: credentials.password },
            { headers: { "Content-Type": "application/json" } }
          );

          console.log("[Login] Respuesta login:", data);

          if (data.data) {
            const user = data.data;
            return {
              id: user.user.id.toString(),
              name: user.user.name,
              email: user.user.email,
              accessToken: user.accessToken,
              refreshToken: user.refreshToken,
              admin: user.user,
              expiresIn: user.expiresIn,
              accessTokenExpiry: Date.now() + user.expiresIn * 1000, // 1 hora
            };
          }

          console.warn("[Login] Credenciales inválidas");
          return null;
        } catch (error) {
          console.error("[Login] Error en login:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 3600, // 1 hora
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("[JWT Callback] Token inicial:", token, "User:", user);

      if (user) return { ...token, ...user } as JWT;

      if ((token as JWT).accessTokenExpiry && Date.now() < (token as JWT).accessTokenExpiry!) {
        console.log("[JWT Callback] Token aún válido");
        return token as JWT;
      }

      console.log("[JWT Callback] Token expiró, refrescando...");
      return await refreshAccessToken(token as JWT);
    },
    async session({ session, token }) {
      console.log("[Session Callback] Token recibido:", token);
      session.accessToken = (token as JWT).accessToken;
      session.refreshToken = (token as JWT).refreshToken;
      session.admin = (token as JWT).admin;
      session.expiresIn = (token as JWT).expiresIn;

      if ((token as JWT).error) {
        console.warn("[Session Callback] Error en token:", (token as JWT).error);
        if (typeof window !== "undefined") alert("Error en sesión: " + (token as JWT).error);
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};