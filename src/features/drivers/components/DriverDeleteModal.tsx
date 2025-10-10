'use client';

import React, { useState } from 'react';
import { Modal } from '@/features/core/components';
import { useDeleteDriver } from '../hooks/use-drivers';
import { Driver } from '../schemas/driver-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, User, Car, Phone, Mail } from 'lucide-react';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { toast } from 'sonner';

interface DriverDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver | null;
  onSuccess?: () => void;
}

export function DriverDeleteModal({ isOpen, onClose, driver, onSuccess }: DriverDeleteModalProps) {
  const deleteDriverMutation = useDeleteDriver();
  const [reason, setReason] = useState('');
  const [permanent, setPermanent] = useState(false);
  const [customReason, setCustomReason] = useState('');

  const handleDelete = () => {
    if (!driver || !reason) return;

    const finalReason = reason === 'other' ? customReason : reason;
    if (!finalReason.trim()) return;

    deleteDriverMutation.mutate({
      driverId: driver.id.toString(),
      reason: finalReason,
      permanent,
    }, {
      onSuccess: (data) => {
        toast.success(data.message || 'Conductor eliminado exitosamente');
        onClose();
        invalidateQueries(['drivers']);
        onSuccess?.();
        // Reset form
        setReason('');
        setPermanent(false);
        setCustomReason('');
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || 
                           error?.message || 
                           'Error desconocido al eliminar el conductor';
        toast.error(`Error al eliminar conductor: ${errorMessage}`);
      },
    });
  };

  const handleClose = () => {
    setReason('');
    setPermanent(false);
    setCustomReason('');
    onClose();
  };

  if (!driver) return null;

  const hasActiveData = (driver.totalRides && driver.totalRides > 0) || 
                       (driver.completedRides && driver.completedRides > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Eliminar Conductor"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteDriverMutation.isPending || !reason || (reason === 'other' && !customReason.trim())}
          >
            {deleteDriverMutation.isPending ? 'Eliminando...' : 'Eliminar Conductor'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <div>
            <h3 className="text-lg font-medium text-red-900">
              ¿Estás seguro de que quieres eliminar este conductor?
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Esta acción no se puede deshacer y puede afectar la funcionalidad del sistema.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-gray-900">
                  {driver.firstName} {driver.lastName}
                </h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  driver.status === 'online' ? 'bg-green-100 text-green-800' :
                  driver.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                  driver.status === 'offline' ? 'bg-gray-100 text-gray-800' :
                  driver.status === 'suspended' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {driver.status === 'online' ? 'En línea' :
                   driver.status === 'busy' ? 'Ocupado' :
                   driver.status === 'offline' ? 'Fuera de línea' :
                   driver.status === 'suspended' ? 'Suspendido' : 
                   driver.status || 'Desconocido'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
                {driver.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{driver.email}</span>
                  </div>
                )}
                {driver.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{driver.phone}</span>
                  </div>
                )}
                {driver.carModel && (
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-400" />
                    <span>{driver.carModel} - {driver.licensePlate}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Verificación:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    driver.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    driver.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    driver.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                    driver.verificationStatus === 'under_review' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {driver.verificationStatus === 'approved' ? 'Verificado' :
                     driver.verificationStatus === 'pending' ? 'Pendiente' :
                     driver.verificationStatus === 'rejected' ? 'Rechazado' :
                     driver.verificationStatus === 'under_review' ? 'En revisión' :
                     driver.verificationStatus || 'Desconocido'}
                  </span>
                </div>
                {driver.createdAt && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Registrado:</span>
                    <span>{new Date(driver.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {hasActiveData && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Este conductor tiene actividad registrada:
                  </p>
                  <ul className="text-sm text-yellow-700 mt-1 ml-4">
                    {driver.totalRides && driver.totalRides > 0 && (
                      <li>• {driver.totalRides} viajes totales</li>
                    )}
                    {driver.completedRides && driver.completedRides > 0 && (
                      <li>• {driver.completedRides} viajes completados</li>
                    )}
                    {driver.totalEarnings && driver.totalEarnings > 0 && (
                      <li>• ${driver.totalEarnings.toLocaleString()} en ganancias</li>
                    )}
                  </ul>
                  <p className="text-sm text-yellow-800 mt-2">
                    Eliminarlo puede causar inconsistencias en los reportes y estadísticas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formulario de eliminación */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h4 className="font-medium text-gray-900">Configuración de Eliminación</h4>
          
          <div>
            <Label htmlFor="delete-reason">Razón de Eliminación *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una razón" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Violation of terms of service">Violación de términos de servicio</SelectItem>
                <SelectItem value="Fraudulent activity">Actividad fraudulenta</SelectItem>
                <SelectItem value="Safety concerns">Problemas de seguridad</SelectItem>
                <SelectItem value="Driver request">Solicitud del conductor</SelectItem>
                <SelectItem value="Account inactivity">Inactividad de cuenta</SelectItem>
                <SelectItem value="Documentation issues">Problemas con documentación</SelectItem>
                <SelectItem value="other">Otra razón</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reason === 'other' && (
            <div>
              <Label htmlFor="custom-reason">Especifica la razón *</Label>
              <Input
                id="custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe la razón de eliminación"
              />
            </div>
          )}

          <div>
            <Label htmlFor="delete-type">Tipo de Eliminación</Label>
            <Select value={permanent.toString()} onValueChange={(value) => setPermanent(value === 'true')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Eliminación temporal (soft delete)</SelectItem>
                <SelectItem value="true">Eliminación permanente (hard delete)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              {permanent 
                ? "⚠️ Eliminación permanente: No se puede recuperar" 
                : "✓ Eliminación temporal: Se puede restaurar más tarde"
              }
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>• El conductor será eliminado {permanent ? 'permanentemente' : 'temporalmente'}</p>
          <p>• {permanent ? 'No se podrá recuperar después de la eliminación' : 'Se puede restaurar desde el panel de administración'}</p>
          <p>• Asegúrate de que no tenga viajes activos o pendientes</p>
          {hasActiveData && (
            <p className="text-yellow-600">• Se recomienda revisar el historial antes de eliminar</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default DriverDeleteModal;
