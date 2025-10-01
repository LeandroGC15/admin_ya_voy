'use client';

import React, { useEffect } from 'react';
import { Modal } from '@/features/core/components';
import { useDeleteUser } from '../hooks';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, UserX } from 'lucide-react';

interface UserDeleteFormProps {
  isOpen: boolean;
  userId?: string;
  userName?: string;
  onClose: () => void;
  onUserDeleted: () => void;
}

const UserDeleteForm: React.FC<UserDeleteFormProps> = ({
  isOpen,
  userId,
  userName,
  onClose,
  onUserDeleted
}) => {
  const deleteUserMutation = useDeleteUser();
  const [reason, setReason] = React.useState('');

  // Reset reason when modal opens
  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

  // Handle successful deletion
  useEffect(() => {
    if (deleteUserMutation.isSuccess) {
      onUserDeleted();
      onClose();
    }
  }, [deleteUserMutation.isSuccess, onUserDeleted, onClose]);

  const handleConfirmDelete = () => {
    if (!reason.trim()) {
      alert('Por favor ingrese un motivo de desactivación');
      return;
    }

    if (!userId) {
      alert('Error: ID de usuario no disponible');
      return;
    }

    deleteUserMutation.mutate(
      { userId, reason: reason.trim() },
      {
        onSuccess: () => {
          // Success handled by useEffect
        },
        onError: (error: any) => {
          alert(`Error al desactivar usuario: ${error.message || 'Error desconocido'}`);
        }
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Desactivar Usuario${userName ? ` - ${userName}` : ''}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={!reason.trim() || deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? 'Desactivando...' : 'Confirmar Desactivación'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Warning Section */}
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-8 w-8 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-red-900">
              ¿Estás seguro de que quieres desactivar este usuario?
            </h3>
            <p className="text-sm text-red-700 mt-1">
              El usuario será marcado como inactivo pero podrá ser reactivado posteriormente.
              Esta acción requiere un motivo que será registrado en el sistema.
            </p>
          </div>
        </div>

        {/* User Info Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <UserX className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{userName || 'Usuario'}</h4>
              <p className="text-sm text-gray-600 mt-1">
                ID: {userId}
              </p>
            </div>
          </div>
        </div>

        {/* Reason Input Section */}
        <div className="space-y-2">
          <Label htmlFor="deactivation-reason" className="text-sm font-medium">
            Motivo de desactivación <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="deactivation-reason"
            placeholder="Ej: Violación de términos de servicio, solicitud del usuario, cuenta fraudulenta..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            Este motivo será almacenado en el sistema para auditoría.
          </p>
        </div>

        {/* Info Section */}
        <div className="text-sm text-gray-500 space-y-1">
          <p>• El usuario será marcado como inactivo</p>
          <p>• No podrá iniciar sesión hasta ser reactivado</p>
          <p>• Todos sus datos serán preservados</p>
          <p>• Podrá ser reactivado posteriormente con un motivo</p>
        </div>
      </div>
    </Modal>
  );
};

export default UserDeleteForm;
