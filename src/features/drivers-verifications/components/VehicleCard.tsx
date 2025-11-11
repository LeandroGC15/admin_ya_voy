'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { VehicleVerificationResponse } from '../interfaces/verifications';

interface VehicleCardProps {
  vehicle: VehicleVerificationResponse;
  onView?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onView,
  onApprove,
  onReject,
  isLoading = false,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            ✅ Verificado
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            ❌ Rechazado
          </Badge>
        );
      case 'PENDING':
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            ⚠️ Pendiente
          </Badge>
        );
    }
  };

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return '✅';
      case 'REJECTED':
        return '❌';
      case 'PENDING':
      default:
        return '⚠️';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'circulation-card': 'Carnet',
      'rcv': 'RCV',
    };
    return labels[type] || type;
  };

  const isPending = vehicle.verificationStatus === 'PENDING';
  const pendingDocuments = vehicle.documents.filter((doc) => doc.verificationStatus === 'PENDING');

  return (
    <Card className="p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">
                {vehicle.vehicleType === 'carro' ? '🚗' : '🏍️'}
              </span>
              <h4 className="font-semibold">
                {vehicle.make} {vehicle.model} {vehicle.year}
              </h4>
            </div>
            <p className="text-sm text-gray-600">Placa: {vehicle.licensePlate}</p>
            {vehicle.color && (
              <p className="text-sm text-gray-600">Color: {vehicle.color}</p>
            )}
          </div>
          <div>
            {getStatusBadge(vehicle.verificationStatus)}
          </div>
        </div>

        {/* Documentos del vehículo */}
        {vehicle.documents.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Documentos:</p>
            <div className="flex gap-2 flex-wrap">
              {vehicle.documents.map((doc) => (
                <span
                  key={doc.id}
                  className="text-xs px-2 py-1 bg-gray-100 rounded"
                >
                  {getDocumentStatusBadge(doc.verificationStatus)}{' '}
                  {getDocumentTypeLabel(doc.documentType)}
                </span>
              ))}
            </div>
            {pendingDocuments.length > 0 && (
              <p className="text-xs text-yellow-600 mt-1">
                ⚠️ {pendingDocuments.length} documento(s) pendiente(s)
              </p>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 pt-2 border-t">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              disabled={isLoading}
            >
              Ver Detalles
            </Button>
          )}
          {isPending && (
            <>
              {onApprove && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onApprove}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Aprobar Vehículo
                </Button>
              )}
              {onReject && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onReject}
                  disabled={isLoading}
                >
                  Rechazar
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VehicleCard;


