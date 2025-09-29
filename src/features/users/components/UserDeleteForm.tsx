'use client';

import React, { useState } from 'react';
import { useDeleteUserLegacy } from '../hooks';
import { toast } from 'sonner';

interface UserDeleteFormProps {
  onClose: () => void;
  onUserDeleted: () => void;
}

const UserDeleteForm: React.FC<UserDeleteFormProps> = ({ onClose, onUserDeleted }) => {
  const [userId, setUserId] = useState('');

  const deleteUserMutation = useDeleteUserLegacy();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim()) {
      toast.error('Por favor, ingrese el ID del usuario.');
      return;
    }

    deleteUserMutation.mutate(userId.trim(), {
      onSuccess: () => {
        toast.success(`Usuario con ID ${userId} eliminado exitosamente.`);
        setUserId('');
        onUserDeleted();
      },
      onError: (error: any) => {
        if (error.message?.includes('404') || error.message?.includes('not found')) {
          toast.error('Usuario no encontrado con ese ID.');
        } else {
          toast.error(`Error al eliminar usuario: ${error.message || 'Error desconocido'}`);
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Eliminar Usuario</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="userId" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              ID del Usuario a Eliminar
            </label>
            <input
              type="number"
              id="userId"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              disabled={deleteUserMutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-500 dark:hover:bg-red-600"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Eliminando...' : 'Eliminar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDeleteForm;
