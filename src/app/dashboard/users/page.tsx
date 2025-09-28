'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DataTable, Modal, CreateButton, ActionButtons } from '@/features/core/components';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, userKeys } from '@/features/users/hooks';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { createUserSchema, updateUserSchema, type User, type CreateUserInput, type UpdateUserInput, type SearchUsersInput } from '@/features/users/schemas/user-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const UsersPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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

  // React Hook Form for edit user
  const editForm = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
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
      alert(`Error al cargar usuarios: ${error.message || 'Error desconocido'}`);
    }
  }, [error]);

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const users = usersResponse?.data || [];
  const pagination = usersResponse ? {
    currentPage: usersResponse.pagination.page,
    totalPages: usersResponse.pagination.totalPages,
    totalItems: usersResponse.pagination.total,
  } : null;

  const handleCreate = (data: CreateUserInput) => {
    createUserMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateModal(false);
        createForm.reset();
        invalidateQueries(userKeys.lists());
      },
      onError: (error: any) => {
        console.error('Error creating user:', error);
        alert(`Error al crear usuario: ${error.message || 'Error desconocido'}`);
      },
    });
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      city: user.city || '',
      state: user.state || '',
      country: user.country || '',
      isActive: user.isActive,
      userType: user.userType || 'passenger',
    });
    setShowEditModal(true);
  };

  const handleUpdate = (data: UpdateUserInput) => {
    if (selectedUser) {
      updateUserMutation.mutate(
        { userId: selectedUser.id, userData: data },
        {
          onSuccess: () => {
            setShowEditModal(false);
            setSelectedUser(null);
            invalidateQueries(userKeys.lists());
          },
          onError: (error: any) => {
            console.error('Error updating user:', error);
            alert(`Error al actualizar usuario: ${error.message || 'Error desconocido'}`);
          },
        }
      );
    }
  };

  const handleDelete = (user: User) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.name}?`)) {
      deleteUserMutation.mutate(user.id, {
        onSuccess: () => {
          invalidateQueries(userKeys.lists());
        },
        onError: (error: any) => {
          console.error('Error deleting user:', error);
          alert(`Error al eliminar usuario: ${error.message || 'Error desconocido'}`);
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

  const renderActions = (user: User) => (
    <ActionButtons
      onEdit={() => handleEdit(user)}
      onDelete={() => handleDelete(user)}
      canEdit={true}
      canDelete={true}
      canView={false}
      loading={deleteUserMutation.isPending}
    />
  );

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
            <Label htmlFor="create-name">Nombre *</Label>
            <Input
              id="create-name"
              {...createForm.register('name')}
              placeholder="Nombre completo"
            />
            {createForm.formState.errors.name && (
              <p className="text-sm text-red-500">{createForm.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="create-email">Email *</Label>
            <Input
              id="create-email"
              type="email"
              {...createForm.register('email')}
              placeholder="email@ejemplo.com"
            />
            {createForm.formState.errors.email && (
              <p className="text-sm text-red-500">{createForm.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="create-phone">Teléfono</Label>
            <Input
              id="create-phone"
              {...createForm.register('phone')}
              placeholder="+1234567890"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="create-city">Ciudad</Label>
              <Input
                id="create-city"
                {...createForm.register('city')}
                placeholder="Ciudad"
              />
            </div>
            <div>
              <Label htmlFor="create-state">Estado</Label>
              <Input
                id="create-state"
                {...createForm.register('state')}
                placeholder="Estado"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="create-country">País</Label>
            <Input
              id="create-country"
              {...createForm.register('country')}
              placeholder="País"
            />
          </div>
          <div>
            <Label htmlFor="create-userType">Tipo de Usuario</Label>
            <Select
              value={createForm.watch('userType')}
              onValueChange={(value) => createForm.setValue('userType', value as 'passenger' | 'driver')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passenger">Pasajero</SelectItem>
                <SelectItem value="driver">Conductor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Usuario"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={editForm.handleSubmit(handleUpdate)}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? 'Actualizando...' : 'Actualizar Usuario'}
            </Button>
          </>
        }
      >
        <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nombre *</Label>
            <Input
              id="edit-name"
              {...editForm.register('name')}
              placeholder="Nombre completo"
            />
            {editForm.formState.errors.name && (
              <p className="text-sm text-red-500">{editForm.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="edit-email">Email *</Label>
            <Input
              id="edit-email"
              type="email"
              {...editForm.register('email')}
              placeholder="email@ejemplo.com"
            />
            {editForm.formState.errors.email && (
              <p className="text-sm text-red-500">{editForm.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="edit-phone">Teléfono</Label>
            <Input
              id="edit-phone"
              {...editForm.register('phone')}
              placeholder="+1234567890"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-city">Ciudad</Label>
              <Input
                id="edit-city"
                {...editForm.register('city')}
                placeholder="Ciudad"
              />
            </div>
            <div>
              <Label htmlFor="edit-state">Estado</Label>
              <Input
                id="edit-state"
                {...editForm.register('state')}
                placeholder="Estado"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-country">País</Label>
            <Input
              id="edit-country"
              {...editForm.register('country')}
              placeholder="País"
            />
          </div>
          <div>
            <Label htmlFor="edit-userType">Tipo de Usuario</Label>
            <Select
              value={editForm.watch('userType') || 'passenger'}
              onValueChange={(value) => editForm.setValue('userType', value as 'passenger' | 'driver')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passenger">Pasajero</SelectItem>
                <SelectItem value="driver">Conductor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-isActive"
              {...editForm.register('isActive')}
            />
            <Label htmlFor="edit-isActive">Usuario activo</Label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
