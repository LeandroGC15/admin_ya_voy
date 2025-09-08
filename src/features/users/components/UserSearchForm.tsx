'use client';

import React, { useState } from 'react';
import axios from 'axios';

interface UserSearchFormProps {
  onClose: () => void;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  clerkId?: string;
  // Añadir otras propiedades del usuario si son relevantes
}

const UserSearchForm: React.FC<UserSearchFormProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUser(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        throw new Error('La URL de la API no está configurada en las variables de entorno.');
      }

      const response = await axios.get<any>(`${API_URL}api/user?email=${email}`);
      
      if (response.status === 200 && response.data && response.data.data) {
        console.log('Datos de usuario recibidos:', response.data.data); // Log del objeto de usuario real
        setUser(response.data.data);
      } else if (response.status === 404 || (response.data && !response.data.data)) {
        setError('Usuario no encontrado.');
      } else {
        setError(`Error inesperado: ${response.statusText}`);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          setError('Usuario no encontrado con ese email.');
        } else {
          setError(`Error al buscar el usuario: ${err.response.data.message || err.message}`);
        }
      } else {
        setError(`Error al buscar el usuario: ${err instanceof Error ? err.message : String(err)}`);
      }
      console.error('Error searching user:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Buscar Usuario por Email</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email del Usuario
            </label>
            <input
              type="email"
              id="email"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              disabled={loading}
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>

        {user && (
          <div className="mt-6 border-t pt-4 dark:border-gray-700">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Detalles del Usuario</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>ID:</strong> {user.id}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Nombre:</strong> {user.name}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Email:</strong> {user.email}</p>
            {user.clerkId && <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Clerk ID:</strong> {user.clerkId}</p>}
            {/* Añadir más detalles del usuario si es necesario */}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearchForm;
