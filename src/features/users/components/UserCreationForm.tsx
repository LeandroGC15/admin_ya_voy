'use client';

import React, { useState } from 'react';
import { useCreateUserLegacy } from '../hooks';
import { toast } from 'sonner';

interface UserCreationFormProps {
  onClose: () => void;
  onUserCreated: () => void;
}

const UserCreationForm: React.FC<UserCreationFormProps> = ({ onClose, onUserCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const createUserMutation = useCreateUserLegacy();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    createUserMutation.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        clerkId: `temp_frontend_${Date.now()}`,
      },
      {
        onSuccess: () => {
          toast.success('Usuario creado exitosamente!');
          setName('');
          setEmail('');
          onUserCreated();
        },
        onError: (error: any) => {
          if (error.message?.includes('409') || error.message?.includes('already exists')) {
            toast.error('El email ya está registrado');
          } else {
            toast.error(`Error al crear usuario: ${error.message || 'Error desconocido'}`);
          }
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Crear Nuevo Usuario</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
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
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              disabled={createUserMutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreationForm;
