import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

type UserRole = 'admin' | 'user';

// Extend the default session user type to include role
interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: UserRole;
  image?: string | null;
}

// Extend the default session type to include our custom user type
interface ExtendedSession {
  user?: ExtendedUser;
  expires: string;
}

export function useAuth() {
  const { data: session, status, update } = useSession() as { 
    data: ExtendedSession | null; 
    status: 'loading' | 'authenticated' | 'unauthenticated';
    update: (data?: any) => Promise<ExtendedSession | null>;
  };
  
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
    []
  );

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push("/auth/login");
  }, [router]);

  const checkAuth = useCallback(
    (requiredRole?: UserRole) => {
      if (status === "unauthenticated") {
        router.push("/auth/login");
        return false;
      }

      const user = session?.user;
      
      if (requiredRole && user?.role !== requiredRole) {
        toast.error("No tienes permisos para acceder a esta página");
        router.push("/");
        return false;
      }

      return true;
    },
    [status, session, router]
  );

  return {
    session,
    status,
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    login,
    logout,
    checkAuth,
    updateSession: update,
  };
}

export type { UserRole, ExtendedUser };
