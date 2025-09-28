'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Plus, Search } from 'lucide-react';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function CreateButton({ onClick, disabled, loading }: Omit<ActionButtonProps, 'variant'>) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      size="sm"
      className="bg-green-600 hover:bg-green-700"
    >
      <Plus className="h-4 w-4 mr-2" />
      {loading ? 'Creando...' : 'Crear'}
    </Button>
  );
}

export function EditButton({ onClick, disabled, loading }: Omit<ActionButtonProps, 'variant'>) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant="outline"
      size="sm"
    >
      <Edit className="h-4 w-4 mr-2" />
      {loading ? 'Editando...' : 'Editar'}
    </Button>
  );
}

export function DeleteButton({ onClick, disabled, loading }: Omit<ActionButtonProps, 'variant'>) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant="destructive"
      size="sm"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {loading ? 'Eliminando...' : 'Eliminar'}
    </Button>
  );
}

export function ViewButton({ onClick, disabled }: Omit<ActionButtonProps, 'loading'>) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      size="sm"
    >
      <Eye className="h-4 w-4 mr-2" />
      Ver
    </Button>
  );
}

export function SearchButton({ onClick, disabled, loading }: Omit<ActionButtonProps, 'variant'>) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant="outline"
      size="sm"
    >
      <Search className="h-4 w-4 mr-2" />
      {loading ? 'Buscando...' : 'Buscar'}
    </Button>
  );
}

export function ActionButtons({
  onEdit,
  onDelete,
  onView,
  canEdit = true,
  canDelete = true,
  canView = true,
  loading = false,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {canView && onView && (
        <ViewButton onClick={onView} disabled={loading} />
      )}
      {canEdit && onEdit && (
        <EditButton onClick={onEdit} disabled={loading} loading={loading} />
      )}
      {canDelete && onDelete && (
        <DeleteButton onClick={onDelete} disabled={loading} loading={loading} />
      )}
    </div>
  );
}

