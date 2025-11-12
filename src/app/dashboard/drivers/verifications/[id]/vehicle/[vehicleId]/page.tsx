'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  useVehicleDetails,
  useVerifyVehicle,
  useRejectVehicle,
  useVerifyVehicleDocument,
} from '@/features/drivers-verifications/hooks/use-verifications';
import VerificationModal from '@/features/drivers-verifications/components/VerificationModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { VerificationStatus } from '@/features/drivers-verifications/interfaces/verifications';

export default function VehicleVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = params?.id as string;
  const vehicleId = params?.vehicleId as string;

  const { data: vehicle, isLoading, refetch } = useVehicleDetails(vehicleId);
  const verifyVehicleMutation = useVerifyVehicle();
  const rejectVehicleMutation = useRejectVehicle();
  const verifyVehicleDocumentMutation = useVerifyVehicleDocument();
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);

  const handleVerifyVehicle = async (data: {
    verificationStatus: VerificationStatus;
    notes?: string;
    rejectionReason?: string;
    verifyDocuments?: boolean;
  }) => {
    if (!vehicleId) return;

    try {
      if (data.verificationStatus === VerificationStatus.VERIFIED) {
        await verifyVehicleMutation.mutateAsync({
          vehicleId: parseInt(vehicleId),
          data: {
            verificationStatus: data.verificationStatus,
            notes: data.notes,
            verifyDocuments: data.verifyDocuments || false,
          },
        });
        toast.success('Vehículo verificado exitosamente');
      } else {
        await rejectVehicleMutation.mutateAsync({
          vehicleId: parseInt(vehicleId),
          data: {
            verificationStatus: data.verificationStatus,
            notes: data.notes,
            rejectionReason: data.rejectionReason,
          },
        });
        toast.success('Vehículo rechazado');
      }
      setVerificationModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleVerifyDocument = async (documentId: number, data: {
    verificationStatus: VerificationStatus;
    notes?: string;
    rejectionReason?: string;
  }) => {
    if (!vehicleId) return;

    try {
      await verifyVehicleDocumentMutation.mutateAsync({
        vehicleId: parseInt(vehicleId),
        documentId,
        data,
      });
      toast.success('Documento del vehículo verificado exitosamente');
      setSelectedDocumentId(null);
      refetch();
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'Error desconocido'}`);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'circulation-card': 'Carnet de Circulación',
      'rcv': 'RCV',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Cargando vehículo...</div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-red-500">No se pudo cargar el vehículo</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/drivers/verifications/${driverId}`)}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {vehicle.make} {vehicle.model} {vehicle.year}
            </h1>
            <p className="text-gray-500">Placa: {vehicle.licensePlate}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {vehicle.verificationStatus === 'PENDING' && (
            <Button
              onClick={() => setVerificationModalOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Verificar Vehículo
            </Button>
          )}
        </div>
      </div>

      {/* Información del Vehículo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Información del Vehículo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Marca</p>
            <p className="font-medium">{vehicle.make}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Modelo</p>
            <p className="font-medium">{vehicle.model}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Año</p>
            <p className="font-medium">{vehicle.year}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Color</p>
            <p className="font-medium">{vehicle.color || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Placa</p>
            <p className="font-medium">{vehicle.licensePlate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tipo</p>
            <p className="font-medium">
              {vehicle.vehicleType === 'carro' ? '🚗 Carro' : '🏍️ Moto'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <Badge
              className={
                vehicle.verificationStatus === 'VERIFIED'
                  ? 'bg-green-100 text-green-800'
                  : vehicle.verificationStatus === 'REJECTED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }
            >
              {vehicle.verificationStatus === 'VERIFIED' && '✅ Verificado'}
              {vehicle.verificationStatus === 'REJECTED' && '❌ Rechazado'}
              {vehicle.verificationStatus === 'PENDING' && '⚠️ Pendiente'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Documentos del Vehículo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Documentos del Vehículo</h2>
        {vehicle.documents.length > 0 ? (
          <div className="space-y-3">
            {vehicle.documents.map((doc) => (
              <div key={doc.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{getDocumentTypeLabel(doc.documentType)}</p>
                    <p className="text-sm text-gray-500">
                      Subido: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    className={
                      doc.verificationStatus === 'VERIFIED'
                        ? 'bg-green-100 text-green-800'
                        : doc.verificationStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {doc.verificationStatus === 'VERIFIED' && '✅ Verificado'}
                    {doc.verificationStatus === 'REJECTED' && '❌ Rechazado'}
                    {doc.verificationStatus === 'PENDING' && '⚠️ Pendiente'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.documentUrl, '_blank')}
                  >
                    Ver Documento
                  </Button>
                  {doc.verificationStatus === 'PENDING' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedDocumentId(doc.id);
                        setVerificationModalOpen(true);
                      }}
                    >
                      Verificar
                    </Button>
                  )}
                </div>
                {doc.rejectionReason && (
                  <p className="text-sm text-red-600 mt-2">
                    Razón: {doc.rejectionReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay documentos registrados</p>
        )}
      </Card>

      {/* Modal de Verificación */}
      {verificationModalOpen && (
        <VerificationModal
          isOpen={verificationModalOpen}
          onClose={() => {
            setVerificationModalOpen(false);
            setSelectedDocumentId(null);
          }}
          onConfirm={async (data) => {
            if (selectedDocumentId) {
              await handleVerifyDocument(selectedDocumentId, data);
            } else {
              await handleVerifyVehicle(data);
            }
            setVerificationModalOpen(false);
            setSelectedDocumentId(null);
          }}
          title={
            selectedDocumentId
              ? 'Verificar Documento del Vehículo'
              : 'Verificar Vehículo'
          }
          description={
            selectedDocumentId
              ? 'Selecciona aprobar o rechazar este documento'
              : 'Selecciona aprobar o rechazar este vehículo'
          }
          isLoading={
            verifyVehicleMutation.isPending ||
            rejectVehicleMutation.isPending ||
            verifyVehicleDocumentMutation.isPending
          }
        />
      )}
    </div>
  );
}



