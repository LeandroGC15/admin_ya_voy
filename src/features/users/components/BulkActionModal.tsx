'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/features/core/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  UserCheck, 
  UserX, 
  Users,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { User } from '../schemas/user-schemas';
import { useBulkUpdateUsers } from '../hooks/use-bulk-users';
import { invalidateQueries } from '@/lib/api/react-query-client';

// Schema de validación para el formulario
const bulkActionSchema = z.object({
  reason: z.string().min(1, 'La razón es obligatoria').max(500, 'La razón no puede exceder 500 caracteres'),
});

type BulkActionFormData = z.infer<typeof bulkActionSchema>;

interface BulkActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedUsers: User[];
  action: 'activate' | 'deactivate';
  title: string;
  description: string;
  confirmText: string;
  confirmButtonVariant: 'default' | 'destructive';
  confirmButtonClassName?: string;
}

export const BulkActionModal: React.FC<BulkActionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedUsers,
  action,
  title,
  description,
  confirmText,
  confirmButtonVariant,
  confirmButtonClassName = '',
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const bulkUpdateMutation = useBulkUpdateUsers();

  const form = useForm<BulkActionFormData>({
    resolver: zodResolver(bulkActionSchema),
    defaultValues: {
      reason: '',
    },
  });

  // Calcular estadísticas de usuarios seleccionados
  const stats = React.useMemo(() => {
    const activeUsers = selectedUsers.filter(user => user.isActive && !user.deletedAt);
    const inactiveUsers = selectedUsers.filter(user => !user.isActive && !user.deletedAt);
    const softDeletedUsers = selectedUsers.filter(user => user.deletedAt);
    const drivers = selectedUsers.filter(user => user.userType === 'driver');
    const passengers = selectedUsers.filter(user => user.userType === 'passenger');

    return {
      total: selectedUsers.length,
      active: activeUsers.length,
      inactive: inactiveUsers.length,
      softDeleted: softDeletedUsers.length,
      drivers: drivers.length,
      passengers: passengers.length,
    };
  }, [selectedUsers]);

  const handleSubmit = async (data: BulkActionFormData) => {
    if (selectedUsers.length === 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userIds = selectedUsers.map(user => user.id);
      const isActive = action === 'activate';

      await bulkUpdateMutation.mutateAsync({
        userIds,
        isActive,
        reason: data.reason,
      });

      // Invalidar queries para refrescar la lista
      invalidateQueries(['users', 'list']);
      
      // Cerrar modal y notificar éxito
      onSuccess();
      
    } catch (error) {
      console.error('Error en acción masiva:', error);
      // El error ya se maneja en el hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  // Determinar si la acción es válida para los usuarios seleccionados
  const isActionValid = React.useMemo(() => {
    if (action === 'activate') {
      // Solo se pueden activar usuarios que no estén activos
      return stats.inactive > 0 || stats.softDeleted > 0;
    } else {
      // Solo se pueden desactivar usuarios que estén activos
      return stats.active > 0;
    }
  }, [action, stats]);

  const getActionIcon = () => {
    if (action === 'activate') {
      return <UserCheck className="h-5 w-5 text-green-600" />;
    } else {
      return <UserX className="h-5 w-5 text-red-600" />;
    }
  };

  const getActionColor = () => {
    if (action === 'activate') {
      return 'text-green-600';
    } else {
      return 'text-red-600';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting || !isActionValid}
            className={confirmButtonClassName}
          >
            {isSubmitting ? 'Procesando...' : confirmText}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Información de la acción */}
        <div className="flex items-center gap-3">
          {getActionIcon()}
          <div>
            <h3 className={`font-medium ${getActionColor()}`}>
              {action === 'activate' ? 'Activación Masiva' : 'Desactivación Masiva'}
            </h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>

        {/* Estadísticas de usuarios seleccionados */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-900">
              {stats.total} usuario{stats.total !== 1 ? 's' : ''} seleccionado{stats.total !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>{stats.active} activo{stats.active !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-gray-600" />
              <span>{stats.inactive} inactivo{stats.inactive !== 1 ? 's' : ''}</span>
            </div>
            {stats.softDeleted > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span>{stats.softDeleted} eliminado{stats.softDeleted !== 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span>{stats.drivers} conductor{stats.drivers !== 1 ? 'es' : ''}, {stats.passengers} pasajero{stats.passengers !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Advertencia si la acción no es válida */}
        {!isActionValid && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {action === 'activate' 
                ? 'No hay usuarios inactivos o eliminados para activar.'
                : 'No hay usuarios activos para desactivar.'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Formulario de razón */}
        <div className="space-y-2">
          <Label htmlFor="reason">
            Razón de la {action === 'activate' ? 'activación' : 'desactivación'} masiva *
          </Label>
          <Textarea
            id="reason"
            {...form.register('reason')}
            placeholder={`Explique el motivo de la ${action === 'activate' ? 'activación' : 'desactivación'} masiva de estos usuarios...`}
            className={form.formState.errors.reason ? 'border-red-500' : ''}
            rows={3}
            disabled={isSubmitting}
          />
          {form.formState.errors.reason && (
            <p className="text-sm text-red-500">
              {form.formState.errors.reason.message}
            </p>
          )}
        </div>

        {/* Lista de usuarios (limitada a los primeros 10) */}
        <div className="space-y-2">
          <Label>Usuarios a {action === 'activate' ? 'activar' : 'desactivar'}:</Label>
          <div className="max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50">
            {selectedUsers.slice(0, 10).map((user) => (
              <div key={user.id} className="flex items-center justify-between py-1 text-sm">
                <div>
                  <span className="font-medium">{user.name}</span>
                  <span className="text-gray-500 ml-2">({user.email})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.isActive && !user.deletedAt 
                      ? 'bg-green-100 text-green-800' 
                      : user.deletedAt
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isActive && !user.deletedAt ? 'Activo' : user.deletedAt ? 'Eliminado' : 'Inactivo'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.userType === 'driver' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {user.userType === 'driver' ? 'Conductor' : 'Pasajero'}
                  </span>
                </div>
              </div>
            ))}
            {selectedUsers.length > 10 && (
              <div className="text-sm text-gray-500 text-center py-2">
                ... y {selectedUsers.length - 10} usuario{selectedUsers.length - 10 !== 1 ? 's' : ''} más
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

