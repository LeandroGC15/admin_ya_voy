'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have auth data in localStorage
        const authData = localStorage.getItem('auth');
        
        if (authData) {
          // If we have auth data, wait a moment for the session to be ready
          await new Promise(resolve => setTimeout(resolve, 300));
          return;
        }

        // If no session and no auth data, redirect to login
        if (status !== 'loading' && !session) {
          console.log('No session found, redirecting to login');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [session, status, router]);

  // If we're still checking auth or loading session, show loading indicator
  if (isCheckingAuth || status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  // If no session and not checking auth, don't render anything (will redirect)
  if (!session) {
    return null;
  }

  // Check role if required
  if (requiredRole && session.user.role !== requiredRole) {
    router.push('/dashboard');
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  // If we get here, the user is authenticated and has the required role
  return <>{children}</>;
}
