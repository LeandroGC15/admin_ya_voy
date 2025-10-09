import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { getServerSession } from "next-auth/next";
import {authOptions} from "@/lib/auth-options";
import { SessionProvider } from "@/providers/session-provider";
import { ThemeProvider } from "../providers/theme-provider";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing your application",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          "min-h-screen bg-background font-sans antialiased"
        )}
      >
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <SessionProvider session={session}>
            <QueryProvider>
              {children}
              <Toaster
                position="top-center"
                expand={true}
                richColors
                closeButton
              />
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
      // "min-h-screen bg-background font-sans antialiased bg-[url('/fondosencillo.png')] bg-cover bg-center bg-no-repeat"