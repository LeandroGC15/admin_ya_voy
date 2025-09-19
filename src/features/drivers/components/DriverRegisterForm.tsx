'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { driverFormSchema, type DriverFormValues } from '../schemas/driver.schema';
import { registerDriver } from '../services/drivers.service';

interface DriverRegisterFormProps {
  onClose: () => void;
  onDriverRegistered: () => void;
}

const DriverRegisterForm: React.FC<DriverRegisterFormProps> = ({ onClose, onDriverRegistered }) => {
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      carModel: '',
      licensePlate: '',
      carSeats: 4,
    },
  });

  const registerDriverMutation = useMutation({
    mutationFn: registerDriver,
    onSuccess: () => {
      reset();
      onDriverRegistered();
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  const onSubmit = (data: DriverFormValues) => {
    // TODO: Get the actual clerkId from the authenticated user
    // For now, using a placeholder value
    const payload = {
      ...data,
      clerkId: 'temp_clerk_id' // This should be replaced with the actual clerkId from auth context
    };
    registerDriverMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Registrar Nuevo Conductor</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="mb-4">
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre
              </label>
              <input
                type="text"
                id="firstName"
                className={`block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Apellido
              </label>
              <input
                type="text"
                id="lastName"
                className={`block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
                errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Número de Teléfono
            </label>
            <input
              type="tel"
              id="phoneNumber"
              className={`block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              {...register('phoneNumber')}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="mb-4">
              <label htmlFor="carModel" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Modelo del Coche
              </label>
              <input
                type="text"
                id="carModel"
                className={`block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
                  errors.carModel ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                {...register('carModel')}
              />
              {errors.carModel && (
                <p className="mt-1 text-sm text-red-500">{errors.carModel.message}</p>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="licensePlate" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Matrícula
              </label>
              <input
                type="text"
                id="licensePlate"
                className={`block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
                  errors.licensePlate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                {...register('licensePlate')}
              />
              {errors.licensePlate && (
                <p className="mt-1 text-sm text-red-500">{errors.licensePlate.message}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="carSeats" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Número de Asientos
            </label>
            <input
              type="number"
              id="carSeats"
              className={`block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
                errors.carSeats ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              min="1"
              {...register('carSeats', { valueAsNumber: true })}
            />
            {errors.carSeats && (
              <p className="mt-1 text-sm text-red-500">{errors.carSeats.message}</p>
            )}
          </div>

          {registerDriverMutation.isError && (
            <div className="mb-4 text-red-500 text-sm">
              Error al registrar conductor: {registerDriverMutation.error?.message || 'Error desconocido'}
            </div>
          )}
          {registerDriverMutation.isSuccess && (
            <div className="mb-4 text-green-500 text-sm">
              Conductor registrado exitosamente!
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Conductor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverRegisterForm;
