'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { useDeleteServiceZone } from '@/features/config/hooks/use-service-zones';
import type { ServiceZoneListItem } from '@/features/config/schemas/service-zones.schemas';

interface ServiceZonesDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  zone: ServiceZoneListItem;
}

export function ServiceZonesDeleteModal({
  isOpen,
  onClose,
  onSuccess,
  zone,
}: ServiceZonesDeleteModalProps) {
  const deleteServiceZoneMutation = useDeleteServiceZone();

  const handleDelete = async () => {
    try {
      await deleteServiceZoneMutation.mutateAsync(zone.id);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error deleting service zone:', error);
    }
  };

  const isLoading = deleteServiceZoneMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Eliminar Zona de Servicio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta acción no se puede deshacer. La zona será eliminada permanentemente.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-medium">¿Estás seguro de que quieres eliminar esta zona?</h4>
            <div className="p-3 bg-gray-50 rounded border">
              <div className="font-medium">{zone.name}</div>
              <div className="text-sm text-gray-600">
                {zone.cityName}, {zone.stateName}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Tipo: {zone.zoneType} | Pricing: {zone.pricingMultiplier}x | Demanda: {zone.demandMultiplier}x
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar Zona
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

