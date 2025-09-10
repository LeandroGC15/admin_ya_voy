'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut as nextAuthSignOut } from 'next-auth/react';
import useAuthStore from '@/stores/use-auth-store';

export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: loginStore, clearError: clearErrorStore } = useAuthStore();

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    clearErrorStore();
    
    try {
      console.log('Attempting to login with:', credentials.email);
      
      // Usar next-auth para el inicio de sesión
      await loginStore(credentials.email, credentials.password);
      
      console.log('Login successful, redirecting to dashboard...');
      
      // Usar replace en lugar de push para evitar problemas con el historial de navegación
      router.replace('/dashboard');
      
      // Forzar una recarga de la página para asegurar que todos los datos se actualicen
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
      
      return { success: true };
    } catch (err: any) {
      console.error('Login error in handleLogin:', err);
      
      // Mapear errores comunes a mensajes más amigables
      let errorMessage = 'Error al iniciar Login errorsesión. Por favor, inténtalo de nuevo.';
      
      if (err.message.includes('Network Error')) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a Internet.';
      } else if (err.message.includes('401') || err.message.includes('credenciales')) {
        errorMessage = 'Correo o contraseña incorrectos';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      setLoading(true);
      await nextAuthSignOut({ redirect: false });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogin,
    handleLogout,
    loading,
    error,
  };
};
