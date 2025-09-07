import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { signIn, signOut } from 'next-auth/react';
import { Session } from 'next-auth';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  image?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (session: Session | null) => void;
  clearError: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Initiating sign in with credentials...');
          const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
            callbackUrl: '/dashboard',
          });

          console.log('SignIn result:', result);

          if (!result) {
            throw new Error('No response from authentication server');
          }

          if (result.error) {
            console.error('Authentication error:', result.error);
            
            // Mapear errores comunes a mensajes más amigables
            let errorMessage = result.error;
            if (result.error === 'CredentialsSignin') {
              errorMessage = 'Correo o contraseña incorrectos';
            } else if (result.error.includes('ECONNREFUSED')) {
              errorMessage = 'No se pudo conectar con el servidor';
            }
            
            throw new Error(errorMessage);
          }
          
          // Si llegamos aquí, la autenticación fue exitosa
          // La sesión se actualizará a través del SessionProvider
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido al iniciar sesión';
          console.error('Login error:', errorMessage);
          
          set({
            error: errorMessage,
            isAuthenticated: false,
            user: null,
          });
          
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        try {
          await signOut({ redirect: false });
          set({
            user: null,
            isAuthenticated: false,
          });
        } finally {
          set({ isLoading: false });
        }
      },
      
      setSession: (session) => {
        if (session?.user) {
          const user = session.user as any;
          set({
            user: {
              id: user.id || '',
              name: user.name || null,
              email: user.email || null,
              role: user.role || 'user',
              image: user.image || null,
            },
            isAuthenticated: true,
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
