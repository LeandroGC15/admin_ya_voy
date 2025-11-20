'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  useDocumentDetails,
  useVerifyDocument,
  useRejectDocument,
} from '@/features/drivers-verifications/hooks/use-verifications';
import VerificationModal from '@/features/drivers-verifications/components/VerificationModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { VerificationStatus } from '@/features/drivers-verifications/interfaces/verifications';

export default function DocumentVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = params?.id as string;
  const documentId = params?.documentId as string;

  const { data: documentData, isLoading, refetch } = useDocumentDetails(documentId);
  const verifyDocumentMutation = useVerifyDocument();
  const rejectDocumentMutation = useRejectDocument();
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  const handleVerify = async (data: {
    verificationStatus: VerificationStatus;
    notes?: string;
    rejectionReason?: string;
  }) => {
    if (!documentId) return;

    try {
      if (data.verificationStatus === VerificationStatus.VERIFIED) {
        await verifyDocumentMutation.mutateAsync({
          documentId: parseInt(documentId),
          data: {
            verificationStatus: data.verificationStatus,
            notes: data.notes,
          },
        });
        toast.success('Documento verificado exitosamente');
      } else {
        await rejectDocumentMutation.mutateAsync({
          documentId: parseInt(documentId),
          data: {
            verificationStatus: data.verificationStatus,
            notes: data.notes,
            rejectionReason: data.rejectionReason,
          },
        });
        toast.success('Documento rechazado');
      }
      setVerificationModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'Error desconocido'}`);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'driver-photo': 'Foto Conductor',
      'license': 'Licencia',
      'identity-card': 'Cédula',
      'medical-certificate': 'Certificado Médico',
      'rif': 'RIF',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Cargando documento...</div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-red-500">No se pudo cargar el documento</div>
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
            <h1 className="text-3xl font-bold">{getDocumentTypeLabel(documentData.documentType)}</h1>
            <p className="text-gray-500">
              {documentData.driver.firstName} {documentData.driver.lastName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {documentData.verificationStatus === 'PENDING' && (
            <>
              <Button
                onClick={() => setVerificationModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Verificar Documento
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Información del Documento */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Tipo de documento</p>
            <p className="font-medium">{getDocumentTypeLabel(documentData.documentType)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <Badge
              className={
                documentData.verificationStatus === 'VERIFIED'
                  ? 'bg-green-100 text-green-800'
                  : documentData.verificationStatus === 'REJECTED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }
            >
              {documentData.verificationStatus === 'VERIFIED' && '✅ Verificado'}
              {documentData.verificationStatus === 'REJECTED' && '❌ Rechazado'}
              {documentData.verificationStatus === 'PENDING' && '⚠️ Pendiente'}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha de subida</p>
            <p className="font-medium">
              {new Date(documentData.uploadedAt).toLocaleDateString()}
            </p>
          </div>
          {documentData.verifiedAt && (
            <div>
              <p className="text-sm text-gray-500">Fecha de verificación</p>
              <p className="font-medium">
                {new Date(documentData.verifiedAt).toLocaleDateString()}
              </p>
            </div>
          )}
          {documentData.rejectionReason && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Razón de rechazo</p>
              <p className="font-medium text-red-600">{documentData.rejectionReason}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Visor de Imagen */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Documento</h2>
        <div className="flex justify-center">
          <img
            src={documentData.documentUrl}
            alt={getDocumentTypeLabel(documentData.documentType)}
            className="max-w-full h-auto rounded-lg shadow-lg"
            style={{ maxHeight: '600px' }}
          />
        </div>
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(documentData.documentUrl, '_blank')}
          >
            Abrir en nueva pestaña
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const link = document.createElement('a');
              link.href = documentData.documentUrl;
              link.download = `${documentData.documentType}.jpg`;
              link.click();
            }}
          >
            Descargar
          </Button>
        </div>
      </Card>

      {/* Modal de Verificación */}
      {verificationModalOpen && (
        <VerificationModal
          isOpen={verificationModalOpen}
          onClose={() => setVerificationModalOpen(false)}
          onConfirm={handleVerify}
          title="Verificar Documento"
          description="Selecciona aprobar o rechazar este documento"
          isLoading={verifyDocumentMutation.isPending || rejectDocumentMutation.isPending}
        />
      )}
    </div>
  );
}

