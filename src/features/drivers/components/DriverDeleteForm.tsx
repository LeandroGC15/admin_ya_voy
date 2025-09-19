'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDriver } from '../services/drivers.service';

interface DriverDeleteFormProps {
  onClose: () => void;
  onDriverDeleted: () => void;
}

const DriverDeleteForm: React.FC<DriverDeleteFormProps> = ({ onClose, onDriverDeleted }) => {
  const [driverId, setDriverId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteDriverMutation = useMutation({
    mutationFn: deleteDriver,
    onSuccess: (data, variables) => {
      setSuccess(`Conductor con ID ${variables} eliminado exitosamente.`);
      setDriverId('');
      onDriverDeleted();
      // Invalidate and refetch drivers list
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (error: any) => {
      if (error.response) {
        if (error.response.status === 404) {
          setError('Conductor no encontrado con ese ID.');
        } else {
          setError(`Error al eliminar el conductor: ${error.response.data?.message || error.message}`);
        }
      } else {
        setError(`Error al eliminar el conductor: ${error.message}`);
      }
      console.error('Error deleting driver:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!driverId) {
      setError('Por favor, ingrese el ID del conductor.');
      return;
    }

    deleteDriverMutation.mutate(driverId);
  };

  const isLoading = deleteDriverMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Eliminar Conductor</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="driverId" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              ID del Conductor a Eliminar
            </label>
            <input
              type="number"
              id="driverId"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              required
            />
          </div>
          {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}
          {success && <p className="mb-4 text-green-500 text-sm">{success}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-500 dark:hover:bg-red-600"
              disabled={isLoading}
            >
              {isLoading ? 'Eliminando...' : 'Eliminar Conductor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverDeleteForm;



