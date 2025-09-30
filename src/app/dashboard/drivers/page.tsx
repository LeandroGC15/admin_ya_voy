'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DataTable, Modal, CreateButton, ActionButtons } from '@/features/core/components';
import { useDrivers, useCreateDriver, useDeleteDriver } from '@/features/drivers/hooks';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { createDriverSchema, type Driver, type CreateDriverInput, type SearchDriversInput } from '@/features/drivers/schemas/driver-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DriversPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState<SearchDriversInput>({});

  // React Hook Form for create driver
  const createForm = useForm<CreateDriverInput>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      carModel: '',
      licensePlate: '',
      carSeats: 4,
      clerkId: '',
    },
  });

  // React Query hooks
  const { data: driversResponse, isLoading } = useDrivers({
    ...searchParams,
    page: currentPage,
    limit: 10,
  });

  const createDriverMutation = useCreateDriver();
  const deleteDriverMutation = useDeleteDriver();

  const drivers = driversResponse?.drivers || [];
  const pagination = driversResponse ? {
    currentPage: driversResponse.page,
    totalPages: driversResponse.totalPages,
    totalItems: driversResponse.total,
  } : null;

  const handleCreate = (data: CreateDriverInput) => {
    createDriverMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateModal(false);
        createForm.reset();
        invalidateQueries(['drivers']);
      },
    });
  };

  const handleDelete = (driver: Driver) => {
    const fullName = `${driver.firstName} ${driver.lastName}`;
    if (window.confirm(`¿Estás seguro de que quieres eliminar al conductor ${fullName}?`)) {
      deleteDriverMutation.mutate(driver.id.toString(), {
        onSuccess: () => {
          invalidateQueries(['drivers']);
        },
      });
    }
  };

  const handleSearch = (searchTerm: string) => {
    setSearchParams({ ...searchParams, search: searchTerm });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationColor = (status?: string) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'firstName' as keyof Driver,
      header: 'Nombre',
      render: (value: string, row: Driver) => `${value} ${row.lastName}`,
    },
    {
      key: 'email' as keyof Driver,
      header: 'Email',
      render: (value: string) => value || '-',
    },
    {
      key: 'phoneNumber' as keyof Driver,
      header: 'Teléfono',
      render: (value: string) => value || '-',
    },
    {
      key: 'carModel' as keyof Driver,
      header: 'Vehículo',
      render: (value: string) => value || '-',
    },
    {
      key: 'licensePlate' as keyof Driver,
      header: 'Placa',
      render: (value: string) => value || '-',
    },
    {
      key: 'carSeats' as keyof Driver,
      header: 'Asientos',
      render: (value: number) => value || '-',
    },
    {
      key: 'status' as keyof Driver,
      header: 'Estado',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value === 'online' ? 'En línea' :
           value === 'busy' ? 'Ocupado' :
           value === 'offline' ? 'Fuera de línea' :
           value === 'unavailable' ? 'No disponible' : value || 'Desconocido'}
        </span>
      ),
    },
    {
      key: 'verificationStatus' as keyof Driver,
      header: 'Verificación',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVerificationColor(value)}`}>
          {value === 'approved' || value === 'verified' ? 'Verificado' :
           value === 'pending' ? 'Pendiente' :
           value === 'rejected' ? 'Rechazado' :
           value === 'under_review' ? 'En revisión' : value || 'Desconocido'}
        </span>
      ),
    },
    {
      key: 'canDoDeliveries' as keyof Driver,
      header: 'Entregas',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      key: 'createdAt' as keyof Driver,
      header: 'Fecha de Registro',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
  ];

  const renderActions = (driver: Driver) => (
    <ActionButtons
      onDelete={() => handleDelete(driver)}
      canEdit={false}
      canDelete={true}
      canView={false}
      loading={deleteDriverMutation.isPending}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conductores</h1>
          <p className="text-muted-foreground">
            Gestiona todos los conductores de la plataforma
          </p>
        </div>
        <CreateButton onClick={() => setShowCreateModal(true)} />
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre, apellido, email o placa..."
            onChange={(e) => handleSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e.currentTarget.value)}
          />
        </div>
        <Button
          onClick={() => handleSearch((document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement)?.value || '')}
          variant="outline"
        >
          Buscar
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={drivers}
        columns={columns}
        loading={isLoading}
        pagination={
          pagination
            ? {
                ...pagination,
                onPageChange: handlePageChange,
              }
            : undefined
        }
        actions={renderActions}
        emptyMessage="No se encontraron conductores"
      />

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Registrar Conductor"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={createForm.handleSubmit(handleCreate)}
              disabled={createDriverMutation.isPending}
            >
              {createDriverMutation.isPending ? 'Registrando...' : 'Registrar Conductor'}
            </Button>
          </>
        }
      >
        <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="create-firstName">Nombre *</Label>
              <Input
                id="create-firstName"
                {...createForm.register('firstName')}
                placeholder="Nombre"
              />
              {createForm.formState.errors.firstName && (
                <p className="text-sm text-red-500">{createForm.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="create-lastName">Apellido *</Label>
              <Input
                id="create-lastName"
                {...createForm.register('lastName')}
                placeholder="Apellido"
              />
              {createForm.formState.errors.lastName && (
                <p className="text-sm text-red-500">{createForm.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="create-email">Email *</Label>
            <Input
              id="create-email"
              type="email"
              {...createForm.register('email')}
              placeholder="conductor@ejemplo.com"
            />
            {createForm.formState.errors.email && (
              <p className="text-sm text-red-500">{createForm.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="create-phoneNumber">Teléfono *</Label>
            <Input
              id="create-phoneNumber"
              {...createForm.register('phoneNumber')}
              placeholder="+1234567890"
            />
            {createForm.formState.errors.phoneNumber && (
              <p className="text-sm text-red-500">{createForm.formState.errors.phoneNumber.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="create-carModel">Modelo del Vehículo *</Label>
              <Input
                id="create-carModel"
                {...createForm.register('carModel')}
                placeholder="Toyota Corolla"
              />
              {createForm.formState.errors.carModel && (
                <p className="text-sm text-red-500">{createForm.formState.errors.carModel.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="create-licensePlate">Placa *</Label>
              <Input
                id="create-licensePlate"
                {...createForm.register('licensePlate')}
                placeholder="ABC-123"
              />
              {createForm.formState.errors.licensePlate && (
                <p className="text-sm text-red-500">{createForm.formState.errors.licensePlate.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="create-carSeats">Número de Asientos *</Label>
            <Select
              value={createForm.watch('carSeats').toString()}
              onValueChange={(value) => createForm.setValue('carSeats', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 asientos</SelectItem>
                <SelectItem value="4">4 asientos</SelectItem>
                <SelectItem value="5">5 asientos</SelectItem>
                <SelectItem value="6">6 asientos</SelectItem>
                <SelectItem value="7">7 asientos</SelectItem>
                <SelectItem value="8">8 asientos</SelectItem>
              </SelectContent>
            </Select>
            {createForm.formState.errors.carSeats && (
              <p className="text-sm text-red-500">{createForm.formState.errors.carSeats.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="create-clerkId">ID de Clerk *</Label>
            <Input
              id="create-clerkId"
              {...createForm.register('clerkId')}
              placeholder="ID de Clerk del usuario"
            />
            {createForm.formState.errors.clerkId && (
              <p className="text-sm text-red-500">{createForm.formState.errors.clerkId.message}</p>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DriversPage;

