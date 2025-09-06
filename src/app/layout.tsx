import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { SessionProvider } from "@/providers/session-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing your application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <QueryProvider>
          <SessionProvider session={session}>
            {children}
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
