'use client';

import React, { useState } from 'react';
import axios from 'axios';

interface DriverDeleteFormProps {
  onClose: () => void;
  onDriverDeleted: () => void;
}

const DriverDeleteForm: React.FC<DriverDeleteFormProps> = ({ onClose, onDriverDeleted }) => {
  const [driverId, setDriverId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!driverId) {
      setError('Por favor, ingrese el ID del conductor.');
      setLoading(false);
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        throw new Error('La URL de la API no está configurada en las variables de entorno.');
      }

      const response = await axios.delete(`${API_URL}api/driver/${driverId}`);

      if (response.status === 200) {
        setSuccess(`Conductor con ID ${driverId} eliminado exitosamente.`);
        setDriverId('');
        onDriverDeleted();
      } else {
        setError(`Error inesperado: ${response.statusText}`);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          setError('Conductor no encontrado con ese ID.');
        } else {
          setError(`Error al eliminar el conductor: ${err.response.data.message || err.message}`);
        }
      } else {
        setError(`Error al eliminar el conductor: ${err instanceof Error ? err.message : String(err)}`);
      }
      console.error('Error deleting driver:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
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
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-500 dark:hover:bg-red-600"
              disabled={loading}
            >
              {loading ? 'Eliminando...' : 'Eliminar Conductor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverDeleteForm;

