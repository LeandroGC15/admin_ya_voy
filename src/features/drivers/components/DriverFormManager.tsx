'use client';

import React from 'react';
import { FormProvider, useFormContext } from '@/components/forms';
import { CrudModal, CrudForm, CrudSearchForm } from '@/components/forms';
import { driverFormConfigs } from '../config/driver-form-config';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Driver } from '../schemas/driver-schemas';

interface DriverFormManagerProps {
  onDriverAction?: (action: string, driver?: Driver) => void;
}

export function DriverFormManager({ onDriverAction }: DriverFormManagerProps) {
  return (
    <div className="space-y-4">
      {/* Formulario de búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5" />
          Buscar Conductores
        </h3>
        <FormProvider config={driverFormConfigs.search}>
          <CrudSearchForm
            config={driverFormConfigs.search}
            autoSearch={true}
            autoSearchDelay={800}
          />
        </FormProvider>
      </div>

      {/* Acciones principales */}
      <div className="flex gap-3">
        <FormProvider config={driverFormConfigs.create}>
          <DriverCreateButton onAction={onDriverAction} />
        </FormProvider>

        <FormProvider config={driverFormConfigs.update}>
          <DriverUpdateButton onAction={onDriverAction} />
        </FormProvider>

        <FormProvider config={driverFormConfigs.delete}>
          <DriverDeleteButton onAction={onDriverAction} />
        </FormProvider>
      </div>
    </div>
  );
}

// Componente para el botón de crear
function DriverCreateButton({ onAction }: { onAction?: (action: string) => void }) {
  const { openCreate } = useFormContext();

  const handleClick = () => {
    openCreate();
    onAction?.('create');
  };

  return (
    <FormProvider config={driverFormConfigs.create}>
      <Button onClick={handleClick} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Nuevo Conductor
      </Button>

      <CrudModal config={driverFormConfigs.create}>
        <CrudForm config={driverFormConfigs.create} />
      </CrudModal>
    </FormProvider>
  );
}

// Componente para el botón de actualizar
function DriverUpdateButton({ onAction }: { onAction?: (action: string, driver?: Driver) => void }) {
  const { openUpdate } = useFormContext();

  const handleClick = () => {
    // En un caso real, aquí se seleccionaría un driver de una lista
    // Por ahora, mostramos cómo se abriría el formulario
    const mockDriver: Driver = {
      id: 1,
      firstName: 'Juan',
      lastName: 'Pérez',
      carModel: 'Toyota Corolla',
      licensePlate: 'ABC-123',
      carSeats: 4,
      status: 'online',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    openUpdate(mockDriver);
    onAction?.('update', mockDriver);
  };

  return (
    <FormProvider config={driverFormConfigs.update}>
      <Button variant="outline" onClick={handleClick} className="flex items-center gap-2">
        <Edit className="h-4 w-4" />
        Actualizar Conductor
      </Button>

      <CrudModal config={driverFormConfigs.update}>
        <CrudForm config={driverFormConfigs.update} />
      </CrudModal>
    </FormProvider>
  );
}

// Componente para el botón de eliminar
function DriverDeleteButton({ onAction }: { onAction?: (action: string, driver?: Driver) => void }) {
  const { openDelete } = useFormContext();

  const handleClick = () => {
    // En un caso real, aquí se seleccionaría un driver de una lista
    const mockDriver: Driver = {
      id: 1,
      firstName: 'Juan',
      lastName: 'Pérez',
      carModel: 'Toyota Corolla',
      licensePlate: 'ABC-123',
      carSeats: 4,
      status: 'online',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    openDelete(mockDriver);
    onAction?.('delete', mockDriver);
  };

  return (
    <FormProvider config={driverFormConfigs.delete}>
      <Button variant="destructive" onClick={handleClick} className="flex items-center gap-2">
        <Trash2 className="h-4 w-4" />
        Eliminar Conductor
      </Button>

      <CrudModal config={driverFormConfigs.delete}>
        <CrudForm config={driverFormConfigs.delete} />
      </CrudModal>
    </FormProvider>
  );
}

export default DriverFormManager;
