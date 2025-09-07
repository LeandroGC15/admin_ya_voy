'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    // Si no hay sesión, redirigir al login
    if (!session) {
      router.push('/login');
      return;
    }
    
    // Si se requiere un rol específico y el usuario no lo tiene, redirigir al dashboard
    if (requiredRole && session.user.role !== requiredRole) {
      router.push('/dashboard');
    }
  }, [session, status, router, requiredRole]);

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (status === 'loading' || !session) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  // Si el usuario tiene el rol requerido (o no se requiere un rol específico), mostrar el contenido
  if (!requiredRole || session.user.role === requiredRole) {
    return <>{children}</>;
  }

  // Si el usuario no tiene el rol requerido, no mostrar nada (ya se redirigirá)
  return null;
}
