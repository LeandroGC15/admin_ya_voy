'use client';

import React from 'react';
import { Modal } from '@/features/core/components';
import { useRestoreUser } from '../hooks';
import { User } from '../schemas/user-schemas';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RotateCcw, AlertTriangle, User as UserIcon, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface UserRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
  title?: string;
  actionLabel?: string;
  onConfirm?: (reason?: string) => void;
  requireReason?: boolean; // Whether to show a textarea for reason input
}

export function UserRestoreModal({
  isOpen,
  onClose,
  user,
  onSuccess,
  title = "Restaurar Usuario",
  actionLabel = "Restaurar Usuario",
  onConfirm,
  requireReason = false
}: UserRestoreModalProps) {
  const restoreUserMutation = useRestoreUser();
  const [reason, setReason] = React.useState('');

  // Reset reason when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

  const handleAction = () => {
    if (requireReason && !reason.trim()) {
      alert(`Por favor ingrese un motivo de ${title.includes('Activar') ? 'activación' : 'restauración'}`);
      return;
    }

    if (onConfirm) {
      // Use custom confirm handler (for activation)
      onConfirm(reason.trim() || `Activación administrativa desde panel de administración`);
    } else {
      // Use default restore logic
      if (!user) return;

      restoreUserMutation.mutate(
        {
          userId: user.id.toString(),
          reason: reason.trim() || 'Restauración administrativa desde panel de administración'
        },
        {
          onSuccess: () => {
            onClose();
            invalidateQueries(['users']);
            onSuccess?.();
          },
        }
      );
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleAction}
            disabled={restoreUserMutation.isPending || (requireReason && !reason.trim())}
            className="bg-green-500 hover:bg-green-600"
          >
            {restoreUserMutation.isPending ? `${actionLabel.split(' ')[0]}ando...` : actionLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 border border-green-200 rounded-lg bg-green-50">
          <RotateCcw className="h-8 w-8 text-green-500" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {title.includes('Activar')
                ? 'El usuario será activado y podrá acceder nuevamente a la plataforma.'
                : 'El usuario será reactivado y podrá acceder nuevamente a la plataforma.'
              }
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-gray-900">{user.name}</h4>
                {!user.isActive && !user.deletedAt && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Suspendido
                  </span>
                )}
                {!!user.deletedAt && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    Soft Deleted
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Creado: {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {user.city && user.state ? `${user.city}, ${user.state}` :
                     user.city ? user.city :
                     user.state ? user.state : 'Ubicación no especificada'}
                  </span>
                </div>
              </div>
              {user.totalRides !== undefined && user.totalRides > 0 && (
                <div className="mt-2 p-2 border border-blue-200 rounded bg-blue-50">
                  <p className="text-sm text-blue-800">
                    <strong>{user.totalRides}</strong> viaje{user.totalRides !== 1 ? 's' : ''} registrado{user.totalRides !== 1 ? 's' : ''} •
                    <strong> {user.completedRides || 0}</strong> completado{user.completedRides !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reason Input Section (only when required) */}
        {requireReason && (
          <div className="space-y-2">
            <Label htmlFor="activation-reason" className="text-sm font-medium">
              Motivo de {title.includes('Activar') ? 'activación' : 'restauración'} <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="activation-reason"
              placeholder={`Ej: ${title.includes('Activar') ? 'Usuario ha cumplido con los requisitos' : 'Restauración por solicitud del usuario'}`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        )}

        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Información de {title.includes('Activar') ? 'activación' : 'restauración'}</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>El usuario podrá iniciar sesión nuevamente</li>
              <li>Todos los datos y viajes se mantendrán intactos</li>
              {title.includes('Activar') ? (
                <li>La cuenta será activada (isActive = true)</li>
              ) : (
                <>
                  <li>Se limpiarán los campos de eliminación (deletedAt, deletedReason)</li>
                  <li>La cuenta será reactivada (isActive = true)</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>• La {title.includes('Activar') ? 'activación' : 'restauración'} se registra en el log de auditoría</p>
          <p>• El usuario no será notificado automáticamente</p>
          <p>• Puedes {title.includes('Activar') ? 'suspender' : 'desactivar'} nuevamente al usuario si es necesario</p>
        </div>
      </div>
    </Modal>
  );
}

export default UserRestoreModal;
