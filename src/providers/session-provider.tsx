"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import useAuthStore from "@/stores/use-auth-store";

export function SessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: any;
}) {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    setSession(session);
  }, [session, setSession]);

  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
