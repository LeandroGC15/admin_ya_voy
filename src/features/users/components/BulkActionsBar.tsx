'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserCheck, 
  UserX, 
  X, 
  AlertTriangle,
  Users,
  CheckCircle2
} from 'lucide-react';
import { User } from '../schemas/user-schemas';
import { BulkActionModal } from './BulkActionModal';

interface BulkActionsBarProps {
  selectedUsers: User[];
  onClearSelection: () => void;
  onBulkActionComplete: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedUsers,
  onClearSelection,
  onBulkActionComplete,
}) => {
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

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

  const handleActivate = () => {
    setShowActivateModal(true);
  };

  const handleDeactivate = () => {
    setShowDeactivateModal(true);
  };

  const handleModalClose = () => {
    setShowActivateModal(false);
    setShowDeactivateModal(false);
  };

  const handleBulkActionSuccess = () => {
    handleModalClose();
    onBulkActionComplete();
  };

  if (selectedUsers.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                {stats.total} usuario{stats.total !== 1 ? 's' : ''} seleccionado{stats.total !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {stats.active > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {stats.active} activo{stats.active !== 1 ? 's' : ''}
                </Badge>
              )}
              {stats.inactive > 0 && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  <UserX className="h-3 w-3 mr-1" />
                  {stats.inactive} inactivo{stats.inactive !== 1 ? 's' : ''}
                </Badge>
              )}
              {stats.softDeleted > 0 && (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {stats.softDeleted} eliminado{stats.softDeleted !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              {stats.drivers > 0 && (
                <span>{stats.drivers} conductor{stats.drivers !== 1 ? 'es' : ''}</span>
              )}
              {stats.passengers > 0 && (
                <span>{stats.passengers} pasajero{stats.passengers !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleActivate}
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              disabled={stats.active === stats.total}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Activar
            </Button>

            <Button
              onClick={handleDeactivate}
              variant="destructive"
              size="sm"
              disabled={stats.inactive === stats.total}
            >
              <UserX className="h-4 w-4 mr-2" />
              Desactivar
            </Button>

            <Button
              onClick={onClearSelection}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      {/* Modales para confirmación de acciones masivas */}
      <BulkActionModal
        isOpen={showActivateModal}
        onClose={handleModalClose}
        onSuccess={handleBulkActionSuccess}
        selectedUsers={selectedUsers}
        action="activate"
        title="Activar Usuarios"
        description="¿Está seguro de que desea activar los usuarios seleccionados?"
        confirmText="Activar Usuarios"
        confirmButtonVariant="default"
        confirmButtonClassName="bg-green-600 hover:bg-green-700"
      />

      <BulkActionModal
        isOpen={showDeactivateModal}
        onClose={handleModalClose}
        onSuccess={handleBulkActionSuccess}
        selectedUsers={selectedUsers}
        action="deactivate"
        title="Desactivar Usuarios"
        description="¿Está seguro de que desea desactivar los usuarios seleccionados?"
        confirmText="Desactivar Usuarios"
        confirmButtonVariant="destructive"
        confirmButtonClassName=""
      />
    </>
  );
};

