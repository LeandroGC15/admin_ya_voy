import { useState } from 'react';
import { loginAdmin } from '../services/auth.service';
import { AuthResponseData } from '../interfaces/authResponse';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  permissions: string[];
  isSuperAdmin: boolean;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginAdmin(credentials);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement registration API call
      // For now, just simulate a successful registration
      console.log('Registering user:', userData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    localStorage.removeItem('auth');
    window.location.href = '/login';
  };

  return {
    handleLogin,
    handleRegister,
    handleLogout,
    loading,
    error,
  };
}
