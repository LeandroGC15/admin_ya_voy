import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  // Rutas públicas que no requieren login
  const publicPaths = ["/login", "/auth/register"];

  // Permitir rutas públicas
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path + "/"))) {
    return NextResponse.next();
  }

  // Si no hay token, redirige al login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si hay token, permite continuar
  return NextResponse.next();
}

// Configuración de rutas donde aplica el middleware
export const config = {
matcher: [
  "/dashboard/:path*", 
  "/dashboard", 
  "/admin/:path*", 
  "/admin", 
  "/protected/:path*", 
  "/protected"
]
};
