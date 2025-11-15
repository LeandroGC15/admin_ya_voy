'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DataTable, Modal, CreateButton, ActionButtons } from '@/features/core/components';
import {
  useModules,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useToggleModuleStatus,
} from '@/features/programa-yavoy/hooks/use-modules';
import { invalidateQueries } from '@/lib/api/react-query-client';
import {
  createModuleSchema,
  updateModuleSchema,
  type TrainingModule,
  type CreateModuleInput,
  type UpdateModuleInput,
  type SearchModulesInput,
} from '@/features/programa-yavoy/schemas/module-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Power, Eye } from 'lucide-react';
import Link from 'next/link';

const ProgramaYavoyPage: React.FC = () => {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState<Omit<SearchModulesInput, 'page' | 'limit'>>({});

  // React Hook Form for create module
  const createForm = useForm<CreateModuleInput>({
    resolver: zodResolver(createModuleSchema),
    defaultValues: {
      slug: '',
      title: '',
      summary: '',
      markdownContent: '',
      videoUrl: '',
      order: 0,
      isActive: true,
    },
  });

  // React Hook Form for edit module
  const editForm = useForm<UpdateModuleInput>({
    resolver: zodResolver(updateModuleSchema),
  });

  // React Query hooks
  const { data: modulesResponse, isLoading } = useModules({
    page: currentPage,
    limit: 10,
    ...searchParams,
  });

  const createModuleMutation = useCreateModule();
  const updateModuleMutation = useUpdateModule();
  const deleteModuleMutation = useDeleteModule();
  const toggleStatusMutation = useToggleModuleStatus();

  const modules = modulesResponse?.modules || [];
  const pagination = modulesResponse
    ? {
        currentPage: modulesResponse.page,
        totalPages: modulesResponse.totalPages,
        totalItems: modulesResponse.total,
      }
    : null;

  const handleCreate = (data: CreateModuleInput) => {
    createModuleMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateModal(false);
        createForm.reset();
        invalidateQueries(['programa-yavoy']);
      },
    });
  };

  const handleEdit = (module: TrainingModule) => {
    setSelectedModule(module);
    editForm.reset({
      id: module.id,
      slug: module.slug,
      title: module.title,
      summary: module.summary,
      markdownContent: module.markdownContent,
      videoUrl: module.videoUrl || '',
      order: module.order,
      isActive: module.isActive,
    });
    setShowEditModal(true);
  };

  const handleUpdate = (data: UpdateModuleInput) => {
    if (!data.id) return;
    updateModuleMutation.mutate(data, {
      onSuccess: () => {
        setShowEditModal(false);
        setSelectedModule(null);
        editForm.reset();
        invalidateQueries(['programa-yavoy']);
      },
    });
  };

  const handleDelete = (module: TrainingModule) => {
    setSelectedModule(module);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedModule) return;
    deleteModuleMutation.mutate(selectedModule.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setSelectedModule(null);
        invalidateQueries(['programa-yavoy']);
      },
    });
  };

  const handleToggleStatus = (module: TrainingModule) => {
    toggleStatusMutation.mutate(module.id, {
      onSuccess: () => {
        invalidateQueries(['programa-yavoy']);
      },
    });
  };

  const handleSearch = (searchTerm: string) => {
    setSearchParams({ ...searchParams, search: searchTerm });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Table columns
  const columns = [
    {
      key: 'order' as keyof TrainingModule,
      header: 'Orden',
      render: (value: number) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'title' as keyof TrainingModule,
      header: 'Título',
      render: (value: string, module: TrainingModule) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground truncate max-w-md">
            {module.summary}
          </div>
        </div>
      ),
    },
    {
      key: 'slug' as keyof TrainingModule,
      header: 'Slug',
      render: (value: string) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">{value}</code>
      ),
    },
    {
      key: 'isActive' as keyof TrainingModule,
      header: 'Estado',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'createdAt' as keyof TrainingModule,
      header: 'Creado',
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString('es-VE')}
        </span>
      ),
    },
  ];

  // Actions renderer
  const renderActions = (module: TrainingModule) => (
    <div className="flex items-center gap-2">
      <ActionButtons
        onEdit={() => handleEdit(module)}
        onDelete={() => handleDelete(module)}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleToggleStatus(module)}
        disabled={toggleStatusMutation.isPending}
      >
        <Power className="h-4 w-4 mr-2" />
        {module.isActive ? 'Desactivar' : 'Activar'}
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Programa Yavoy - Módulos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los módulos de capacitación del Programa Yavoy
          </p>
        </div>
        <CreateButton onClick={() => setShowCreateModal(true)} />
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Buscar por título o slug..."
          className="max-w-sm"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(e.currentTarget.value)}
        />
        <Button
          onClick={() =>
            handleSearch(
              (document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement)?.value ||
                ''
            )
          }
          variant="outline"
        >
          Buscar
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={modules}
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
        emptyMessage="No se encontraron módulos"
      />

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Módulo de Capacitación"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={createForm.handleSubmit(handleCreate)}
              disabled={createModuleMutation.isPending}
            >
              {createModuleMutation.isPending ? 'Creando...' : 'Crear Módulo'}
            </Button>
          </>
        }
      >
        <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="create-slug">Slug *</Label>
              <Input
                id="create-slug"
                {...createForm.register('slug')}
                placeholder="modulo-1-introduccion"
              />
              {createForm.formState.errors.slug && (
                <p className="text-sm text-red-500">{createForm.formState.errors.slug.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="create-order">Orden</Label>
              <Input
                id="create-order"
                type="number"
                {...createForm.register('order', { valueAsNumber: true })}
                placeholder="0"
              />
              {createForm.formState.errors.order && (
                <p className="text-sm text-red-500">{createForm.formState.errors.order.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="create-title">Título *</Label>
            <Input
              id="create-title"
              {...createForm.register('title')}
              placeholder="Introducción al Programa Yavoy"
            />
            {createForm.formState.errors.title && (
              <p className="text-sm text-red-500">{createForm.formState.errors.title.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="create-summary">Resumen *</Label>
            <Textarea
              id="create-summary"
              {...createForm.register('summary')}
              placeholder="Breve descripción del módulo..."
              rows={3}
            />
            {createForm.formState.errors.summary && (
              <p className="text-sm text-red-500">{createForm.formState.errors.summary.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="create-videoUrl">URL del Video (opcional)</Label>
            <Input
              id="create-videoUrl"
              {...createForm.register('videoUrl')}
              placeholder="https://youtube.com/watch?v=..."
            />
            {createForm.formState.errors.videoUrl && (
              <p className="text-sm text-red-500">{createForm.formState.errors.videoUrl.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="create-markdownContent">Contenido Markdown *</Label>
            <Textarea
              id="create-markdownContent"
              {...createForm.register('markdownContent')}
              placeholder="# Título&#10;&#10;Contenido del módulo..."
              rows={10}
              className="font-mono text-sm"
            />
            {createForm.formState.errors.markdownContent && (
              <p className="text-sm text-red-500">
                {createForm.formState.errors.markdownContent.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="create-isActive"
              {...createForm.register('isActive')}
              className="rounded"
            />
            <Label htmlFor="create-isActive" className="cursor-pointer">
              Módulo activo
            </Label>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedModule(null);
        }}
        title="Editar Módulo de Capacitación"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedModule(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={editForm.handleSubmit(handleUpdate)}
              disabled={updateModuleMutation.isPending}
            >
              {updateModuleMutation.isPending ? 'Actualizando...' : 'Actualizar Módulo'}
            </Button>
          </>
        }
      >
        <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-slug">Slug *</Label>
              <Input id="edit-slug" {...editForm.register('slug')} />
              {editForm.formState.errors.slug && (
                <p className="text-sm text-red-500">{editForm.formState.errors.slug.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-order">Orden</Label>
              <Input
                id="edit-order"
                type="number"
                {...editForm.register('order', { valueAsNumber: true })}
              />
              {editForm.formState.errors.order && (
                <p className="text-sm text-red-500">{editForm.formState.errors.order.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="edit-title">Título *</Label>
            <Input id="edit-title" {...editForm.register('title')} />
            {editForm.formState.errors.title && (
              <p className="text-sm text-red-500">{editForm.formState.errors.title.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="edit-summary">Resumen *</Label>
            <Textarea id="edit-summary" {...editForm.register('summary')} rows={3} />
            {editForm.formState.errors.summary && (
              <p className="text-sm text-red-500">{editForm.formState.errors.summary.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="edit-videoUrl">URL del Video (opcional)</Label>
            <Input id="edit-videoUrl" {...editForm.register('videoUrl')} />
            {editForm.formState.errors.videoUrl && (
              <p className="text-sm text-red-500">{editForm.formState.errors.videoUrl.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="edit-markdownContent">Contenido Markdown *</Label>
            <Textarea
              id="edit-markdownContent"
              {...editForm.register('markdownContent')}
              rows={10}
              className="font-mono text-sm"
            />
            {editForm.formState.errors.markdownContent && (
              <p className="text-sm text-red-500">
                {editForm.formState.errors.markdownContent.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-isActive"
              {...editForm.register('isActive')}
              className="rounded"
            />
            <Label htmlFor="edit-isActive" className="cursor-pointer">
              Módulo activo
            </Label>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedModule(null);
        }}
        title="Eliminar Módulo"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedModule(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteModuleMutation.isPending}
            >
              {deleteModuleMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </>
        }
      >
        <p>
          ¿Estás seguro de que deseas eliminar el módulo{' '}
          <strong>{selectedModule?.title}</strong>? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
};

export default ProgramaYavoyPage;

