'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { useToggleServiceZoneStatus } from '@/features/config/hooks/use-service-zones';
import { getZoneStatusLabel, getZoneStatusColor } from '@/lib/maps/zone-colors';
import type { ServiceZoneListItem } from '@/features/config/schemas/service-zones.schemas';

interface ServiceZonesToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  zone: ServiceZoneListItem;
}

export function ServiceZonesToggleModal({
  isOpen,
  onClose,
  onSuccess,
  zone,
}: ServiceZonesToggleModalProps) {
  const toggleServiceZoneMutation = useToggleServiceZoneStatus();

  const handleToggle = async () => {
    try {
      await toggleServiceZoneMutation.mutateAsync(zone.id);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error toggling service zone status:', error);
    }
  };

  const isLoading = toggleServiceZoneMutation.isPending;
  const newStatus = !zone.isActive;
  const newStatusLabel = getZoneStatusLabel(newStatus);
  const newStatusColor = getZoneStatusColor(newStatus);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {newStatus ? (
              <ToggleRight className="h-5 w-5 text-green-600" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-gray-400" />
            )}
            {newStatus ? 'Activar' : 'Desactivar'} Zona de Servicio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {newStatus 
                ? 'La zona será activada y estará disponible para el servicio.'
                : 'La zona será desactivada y no estará disponible para el servicio.'
              }
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-medium">Zona de Servicio:</h4>
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

          <div className="space-y-2">
            <h4 className="font-medium">Cambio de Estado:</h4>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Estado actual:</span>
              <span 
                className="text-sm font-medium px-2 py-1 rounded"
                style={{ backgroundColor: getZoneStatusColor(zone.isActive), color: 'white' }}
              >
                {getZoneStatusLabel(zone.isActive)}
              </span>
              <span className="text-sm text-gray-400">→</span>
              <span 
                className="text-sm font-medium px-2 py-1 rounded"
                style={{ backgroundColor: newStatusColor, color: 'white' }}
              >
                {newStatusLabel}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleToggle} 
              disabled={isLoading}
              style={{ backgroundColor: newStatusColor }}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {newStatus ? 'Activar' : 'Desactivar'} Zona
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

