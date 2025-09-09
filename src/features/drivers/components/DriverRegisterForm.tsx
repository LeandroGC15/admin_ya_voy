'use client';

import React, { useState } from 'react';
import axios from 'axios';

interface DriverRegisterFormProps {
  onClose: () => void;
  onDriverRegistered: () => void;
}

const DriverRegisterForm: React.FC<DriverRegisterFormProps> = ({ onClose, onDriverRegistered }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [carModel, setCarModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [carSeats, setCarSeats] = useState(4); // Valor por defecto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        throw new Error('La URL de la API no está configurada en las variables de entorno.');
      }

      const response = await axios.post(`${API_URL}api/driver/register`, {
        firstName,
        lastName,
        email,
        phoneNumber,
        carModel,
        licensePlate,
        carSeats,
        clerkId: `temp_driver_frontend_${Date.now()}`, // Placeholder para satisfacer la validación del backend
      });

      if (response.status === 201) {
        setSuccess('Conductor registrado exitosamente!');
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhoneNumber('');
        setCarModel('');
        setLicensePlate('');
        setCarSeats(4);
        onDriverRegistered();
      } else {
        setError(`Error inesperado: ${response.statusText}`);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(`Error al registrar conductor: ${err.response.data.message || err.message}`);
      } else {
        setError(`Error al registrar conductor: ${err instanceof Error ? err.message : String(err)}`);
      }
      console.error('Error registering driver:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Registrar Nuevo Conductor</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="mb-4">
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre
              </label>
              <input
                type="text"
                id="firstName"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Apellido
              </label>
              <input
                type="text"
                id="lastName"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
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

          <div className="mb-4">
            <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Número de Teléfono
            </label>
            <input
              type="tel"
              id="phoneNumber"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="mb-4">
              <label htmlFor="carModel" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Modelo del Coche
              </label>
              <input
                type="text"
                id="carModel"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="licensePlate" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Matrícula
              </label>
              <input
                type="text"
                id="licensePlate"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="carSeats" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Número de Asientos
            </label>
            <input
              type="number"
              id="carSeats"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={carSeats}
              onChange={(e) => setCarSeats(Number(e.target.value))}
              min="1"
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
              className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Conductor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverRegisterForm;
