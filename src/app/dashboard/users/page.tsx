'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, Modal, CreateButton, ActionButtons } from '@/features/core/components';
import UserDeleteForm from '@/features/users/components/UserDeleteForm';
import UserRestoreForm from '@/features/users/components/UserRestoreForm';
import UserUpdateForm from '@/features/users/components/UserUpdateForm';
import { useUsers, useCreateUser, useDeleteUser, useRestoreUser } from '@/features/users/hooks';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { createUserSchema, updateUserSchema, type User, type CreateUserInput, type UpdateUserInput, type SearchUsersInput } from '@/features/users/schemas/user-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const UsersPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState<SearchUsersInput>({});

  // React Hook Form for create user
  const createForm = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      country: '',
      userType: 'passenger',
    },
  });


  // React Query hooks
  const { data: usersResponse, isLoading, error } = useUsers({
    ...searchParams,
    page: currentPage,
    limit: 10,
  });

  // Handle main data loading error
  React.useEffect(() => {
    if (error) {
      console.error('Error loading users:', error);
    }
  }, [error]);

  const createUserMutation = useCreateUser();
  const deleteUserMutation = useDeleteUser();
  const restoreUserMutation = useRestoreUser();

  const users = usersResponse?.users || [];
  const pagination = usersResponse ? {
    currentPage: usersResponse.page,
    totalPages: usersResponse.totalPages,
    totalItems: usersResponse.total,
  } : null;

  const handleCreate = (data: CreateUserInput) => {
    createUserMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateModal(false);
        createForm.reset();
        invalidateQueries(['users']);
      },
      onError: (error: any) => {
        console.error('Error creating user:', error);
        alert(`Error al crear usuario: ${error.message || 'Error desconocido'}`);
      },
    });
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };


  const handleDelete = (user: User) => {
    console.log('handleDelete called with user:', user);
    // Mostrar modal de desactivación en lugar de confirmación simple
    setSelectedUser(user);
    setShowDeleteModal(true);
    console.log('Modal state set to true');
  };

  const handleConfirmDelete = (reason: string) => {
    if (!selectedUser) return;

    // Ejecutar desactivación (soft delete) si el usuario confirma
    deleteUserMutation.mutate(
      { userId: selectedUser.id.toString(), reason },
      {
        onSuccess: () => {
          // Refrescar tabla y mostrar mensaje de éxito
          invalidateQueries(['users']);
          setShowDeleteModal(false);
          setSelectedUser(null);
          alert('Usuario desactivado exitosamente. El usuario puede ser reactivado posteriormente.');
        },
        onError: (error: any) => {
          console.error('Error deleting user:', error);
          // Mensaje de error único y específico
          const status = error?.response?.status;
          let message = 'Error desconocido al desactivar usuario';
          if (status === 404) message = 'Usuario no encontrado';
          else if (status === 403) message = 'No tienes permisos para desactivar este usuario';
          else if (status === 409) message = 'No se puede desactivar el usuario porque tiene viajes o pedidos activos';
          else if (error?.response?.data?.message) message = error.response.data.message;
          alert(`Error al desactivar usuario: ${message}`);
        },
      }
    );
  };

  const handleRestore = (user: User) => {
    // Mostrar modal de restauración
    setSelectedUser(user);
    setShowRestoreModal(true);
  };

  const handleConfirmRestore = (reason?: string) => {
    if (!selectedUser) return;

    // Ejecutar restauración si el usuario confirma
    restoreUserMutation.mutate(
      { userId: selectedUser.id.toString(), reason },
      {
        onSuccess: () => {
          // Refrescar tabla y mostrar mensaje de éxito
          invalidateQueries(['users']);
          setShowRestoreModal(false);
          setSelectedUser(null);
          alert('Usuario restaurado exitosamente.');
        },
        onError: (error: any) => {
          console.error('Error restoring user:', error);
          // Mensaje de error único y específico
          const status = error?.response?.status;
          let message = 'Error desconocido al restaurar usuario';
          if (status === 404) message = 'Usuario no encontrado o no está desactivado';
          else if (status === 403) message = 'No tienes permisos para restaurar este usuario';
          else if (error?.response?.data?.message) message = error.response.data.message;
          alert(`Error al restaurar usuario: ${message}`);
        },
      }
    );
  };

  const handleSearch = (searchTerm: string) => {
    setSearchParams({ ...searchParams, search: searchTerm });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      key: 'name' as keyof User,
      header: 'Nombre',
    },
    {
      key: 'email' as keyof User,
      header: 'Email',
    },
    {
      key: 'phone' as keyof User,
      header: 'Teléfono',
    },
    {
      key: 'city' as keyof User,
      header: 'Ciudad',
      render: (value: string) => value || '-',
    },
    {
      key: 'userType' as keyof User,
      header: 'Tipo',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value === 'driver'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {value === 'driver' ? 'Conductor' : 'Pasajero'}
        </span>
      ),
    },
    {
      key: 'isActive' as keyof User,
      header: 'Estado',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'createdAt' as keyof User,
      header: 'Fecha de Creación',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
  ];

  const renderActions = (user: User) => {
    const isSoftDeleted = !!user.deletedAt;

    return (
      <div className="flex gap-2">
        <ActionButtons
          onEdit={() => handleEdit(user)}
          onDelete={isSoftDeleted ? () => handleRestore(user) : () => handleDelete(user)}
          canEdit={!isSoftDeleted} // No permitir editar usuarios soft deleted
          canDelete={true}
          canView={false}
          loading={deleteUserMutation.isPending || restoreUserMutation.isPending}
          deleteText={isSoftDeleted ? "Restaurar" : "Desactivar"}
          deleteLoadingText={isSoftDeleted ? "Restaurando..." : "Desactivando..."}
        />
        {isSoftDeleted && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Desactivado
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona todos los usuarios de la plataforma
          </p>
        </div>
        <CreateButton
          onClick={() => setShowCreateModal(true)}
          loading={createUserMutation.isPending}
        />
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre o email..."
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
        data={users}
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
        emptyMessage="No se encontraron usuarios"
      />

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Usuario"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={createForm.handleSubmit(handleCreate)}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </>
        }
      >
        <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
          <div>
            <Label htmlFor="create-name">Nombre <span className="text-red-500">*</span></Label>
            <Input
              id="create-name"
              {...createForm.register('name')}
              placeholder="Ej: Juan Pérez"
              className={createForm.formState.errors.name ? 'border-red-500' : ''}
            />
            {createForm.formState.errors.name && (
              <p className="text-sm text-red-500 mt-1">{createForm.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="create-email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="create-email"
              type="email"
              {...createForm.register('email')}
              placeholder="usuario@ejemplo.com"
              className={createForm.formState.errors.email ? 'border-red-500' : ''}
            />
            {createForm.formState.errors.email && (
              <p className="text-sm text-red-500 mt-1">{createForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="create-phone">Teléfono</Label>
            <Input
              id="create-phone"
              type="tel"
              {...createForm.register('phone')}
              placeholder="+57 300 123 4567"
              className={createForm.formState.errors.phone ? 'border-red-500' : ''}
            />
            {createForm.formState.errors.phone && (
              <p className="text-sm text-red-500 mt-1">{createForm.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="create-city">Ciudad</Label>
              <Input
                id="create-city"
                {...createForm.register('city')}
                placeholder="Ej: Bogotá"
                className={createForm.formState.errors.city ? 'border-red-500' : ''}
              />
              {createForm.formState.errors.city && (
                <p className="text-sm text-red-500 mt-1">{createForm.formState.errors.city.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="create-state">Estado/Departamento</Label>
              <Input
                id="create-state"
                {...createForm.register('state')}
                placeholder="Ej: Cundinamarca"
                className={createForm.formState.errors.state ? 'border-red-500' : ''}
              />
              {createForm.formState.errors.state && (
                <p className="text-sm text-red-500 mt-1">{createForm.formState.errors.state.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="create-country">País</Label>
            <Input
              id="create-country"
              {...createForm.register('country')}
              placeholder="Ej: Colombia"
              className={createForm.formState.errors.country ? 'border-red-500' : ''}
            />
            {createForm.formState.errors.country && (
              <p className="text-sm text-red-500 mt-1">{createForm.formState.errors.country.message}</p>
            )}
          </div>

          <div className="relative">
            <Label htmlFor="create-userType">Tipo de Usuario <span className="text-red-500">*</span></Label>
            <Select
              value={createForm.watch('userType')}
              onValueChange={(value) => createForm.setValue('userType', value as 'passenger' | 'driver')}
            >
              <SelectTrigger className="relative z-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="passenger">Pasajero</SelectItem>
                <SelectItem value="driver">Conductor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <UserUpdateForm
        isOpen={showEditModal}
        user={selectedUser}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onUserUpdated={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
      />

      {/* Delete Modal */}
      {(() => {
        console.log('Rendering Delete Modal:', { showDeleteModal, selectedUser });
        return null;
      })()}
      <UserDeleteForm
        isOpen={showDeleteModal}
        userId={selectedUser?.id.toString()}
        userName={selectedUser?.name}
        onClose={() => {
          console.log('Modal onClose called');
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onUserDeleted={() => {
          console.log('onUserDeleted called');
          // This is handled by the mutation onSuccess callback
        }}
      />

      {/* Restore Modal */}
      <UserRestoreForm
        isOpen={showRestoreModal}
        userId={selectedUser?.id.toString()}
        userName={selectedUser?.name}
        onClose={() => {
          setShowRestoreModal(false);
          setSelectedUser(null);
        }}
        onUserRestored={() => {
          // This is handled by the mutation onSuccess callback
        }}
      />
    </div>
  );
};

export default UsersPage;
