'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  useDriverOnboardingDetails,
  useApproveDriver,
  useVerifyDocument,
  useRejectDocument,
  useVerifyVehicle,
  useRejectVehicle,
  useAllDocuments,
  usePendingDocuments,
} from '@/features/drivers-verifications/hooks/use-verifications';
import OnboardingProgressBar from '@/features/drivers-verifications/components/OnboardingProgressBar';
import DocumentCard from '@/features/drivers-verifications/components/DocumentCard';
import VehicleCard from '@/features/drivers-verifications/components/VehicleCard';
import VerificationModal from '@/features/drivers-verifications/components/VerificationModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { VerificationStatus, DocumentVerificationResponse, VehicleVerificationResponse } from '@/features/drivers-verifications/interfaces/verifications';

export default function DriverVerificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = params?.id as string;
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('pending');

  const { data: driverData, isLoading, refetch } = useDriverOnboardingDetails(driverId);
  const approveDriverMutation = useApproveDriver();
  const verifyDocumentMutation = useVerifyDocument();
  const rejectDocumentMutation = useRejectDocument();
  const verifyVehicleMutation = useVerifyVehicle();
  const rejectVehicleMutation = useRejectVehicle();
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [isVerifyingDocument, setIsVerifyingDocument] = useState(false);

  // Queries for documents
  const { data: allDocumentsData, isLoading: isLoadingAllDocuments } = useAllDocuments({
    driverId: parseInt(driverId),
    page: 1,
    limit: 100,
  });

  const { data: pendingDocumentsData, isLoading: isLoadingPendingDocuments } = usePendingDocuments({
    driverId: parseInt(driverId),
    page: 1,
    limit: 100,
  });

  const handleApproveDriver = async () => {
    if (!driverId) return;

    try {
      await approveDriverMutation.mutateAsync({
        driverId: parseInt(driverId),
        data: { notes: 'Aprobación manual desde vista de detalle' },
      });
      toast.success('Conductor aprobado exitosamente');
      refetch();
    } catch (error: any) {
      toast.error(`Error al aprobar conductor: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleViewDocument = (documentId: number) => {
    router.push(`/dashboard/drivers/verifications/${driverId}/document/${documentId}`);
  };

  const handleViewVehicle = (vehicleId: number) => {
    router.push(`/dashboard/drivers/verifications/${driverId}/vehicle/${vehicleId}`);
  };

  const handleApproveDocument = (documentId: number) => {
    setSelectedDocumentId(documentId);
    setIsVerifyingDocument(true);
    setVerificationModalOpen(true);
  };

  const handleRejectDocument = (documentId: number) => {
    setSelectedDocumentId(documentId);
    setIsVerifyingDocument(true);
    setVerificationModalOpen(true);
  };

  const handleApproveVehicle = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    setIsVerifyingDocument(false);
    setVerificationModalOpen(true);
  };

  const handleRejectVehicle = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    setIsVerifyingDocument(false);
    setVerificationModalOpen(true);
  };

  const handleVerifyConfirm = async (data: {
    verificationStatus: VerificationStatus;
    notes?: string;
    rejectionReason?: string;
  }) => {
    try {
      if (isVerifyingDocument && selectedDocumentId) {
        if (data.verificationStatus === VerificationStatus.VERIFIED) {
          await verifyDocumentMutation.mutateAsync({
            documentId: selectedDocumentId,
            data: {
              verificationStatus: data.verificationStatus,
              notes: data.notes,
            },
          });
          toast.success('Documento verificado exitosamente');
        } else {
          await rejectDocumentMutation.mutateAsync({
            documentId: selectedDocumentId,
            data: {
              verificationStatus: data.verificationStatus,
              notes: data.notes,
              rejectionReason: data.rejectionReason,
            },
          });
          toast.success('Documento rechazado');
        }
      } else if (selectedVehicleId) {
        if (data.verificationStatus === VerificationStatus.VERIFIED) {
          await verifyVehicleMutation.mutateAsync({
            vehicleId: selectedVehicleId,
            data: {
              verificationStatus: data.verificationStatus,
              notes: data.notes,
            },
          });
          toast.success('Vehículo verificado exitosamente');
        } else {
          await rejectVehicleMutation.mutateAsync({
            vehicleId: selectedVehicleId,
            data: {
              verificationStatus: data.verificationStatus,
              notes: data.notes,
              rejectionReason: data.rejectionReason,
            },
          });
          toast.success('Vehículo rechazado');
        }
      }
      setVerificationModalOpen(false);
      setSelectedDocumentId(null);
      setSelectedVehicleId(null);
      setIsVerifyingDocument(false);
      refetch();
      // Invalidate document queries to refresh the tabs
      // The hooks will automatically refetch when queries are invalidated
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'Error desconocido'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Cargando información del conductor...</div>
      </div>
    );
  }

  if (!driverData) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-red-500">No se pudo cargar la información del conductor</div>
      </div>
    );
  }

  const { driver, onboardingProgress, pendingDocuments, pendingVehicles, vehicles } = driverData;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/drivers/verifications')}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {driver.firstName} {driver.lastName}
            </h1>
            <p className="text-gray-500">{driver.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleApproveDriver}
            disabled={approveDriverMutation.isPending || driver.verificationStatus === 'VERIFIED'}
            className="bg-green-600 hover:bg-green-700"
          >
            {approveDriverMutation.isPending ? 'Aprobando...' : 'Aprobar Conductor'}
          </Button>
        </div>
      </div>

      {/* Información del Conductor */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Información del Conductor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nombre completo</p>
            <p className="font-medium">
              {driver.firstName} {driver.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{driver.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Teléfono</p>
            <p className="font-medium">{driver.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estado de verificación</p>
            <Badge
              className={
                driver.verificationStatus === 'VERIFIED'
                  ? 'bg-green-100 text-green-800'
                  : driver.verificationStatus === 'REJECTED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }
            >
              {driver.verificationStatus === 'VERIFIED' && '✅ Verificado'}
              {driver.verificationStatus === 'REJECTED' && '❌ Rechazado'}
              {driver.verificationStatus === 'PENDING' && '⚠️ Pendiente'}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha de registro</p>
            <p className="font-medium">
              {new Date(driver.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {driver.profileImageUrl && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Foto de perfil</p>
            <img
              src={driver.profileImageUrl}
              alt={`${driver.firstName} ${driver.lastName}`}
              className="w-32 h-32 rounded-full object-cover"
            />
          </div>
        )}
      </Card>

      {/* Progreso de Onboarding */}
      <OnboardingProgressBar
        overallProgress={onboardingProgress.overallProgress}
        stages={onboardingProgress.stages}
      />

      {/* Documentos Personales */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Documentos Personales</h2>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'pending')}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Documentos Pendientes</TabsTrigger>
            <TabsTrigger value="all">Todos los Documentos</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            {isLoadingPendingDocuments ? (
              <div className="text-center py-8">Cargando documentos pendientes...</div>
            ) : pendingDocumentsData && pendingDocumentsData.documents.length > 0 ? (
              <div className="space-y-3">
                {pendingDocumentsData.documents.map((doc) => {
                  const documentWithDriver: DocumentVerificationResponse = {
                    ...doc,
                    driver: {
                      id: driver.id,
                      firstName: driver.firstName,
                      lastName: driver.lastName,
                      email: driver.email,
                      phone: driver.phone,
                    },
                  };
                  return (
                    <DocumentCard
                      key={doc.id}
                      document={documentWithDriver}
                      onView={() => handleViewDocument(doc.id)}
                      onApprove={() => handleApproveDocument(doc.id)}
                      onReject={() => handleRejectDocument(doc.id)}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No hay documentos pendientes</p>
            )}
          </TabsContent>
          <TabsContent value="all">
            {isLoadingAllDocuments ? (
              <div className="text-center py-8">Cargando todos los documentos...</div>
            ) : allDocumentsData && allDocumentsData.documents.length > 0 ? (
              <div className="space-y-3">
                {allDocumentsData.documents.map((doc) => {
                  const documentWithDriver: DocumentVerificationResponse = {
                    ...doc,
                    driver: {
                      id: driver.id,
                      firstName: driver.firstName,
                      lastName: driver.lastName,
                      email: driver.email,
                      phone: driver.phone,
                    },
                  };
                  return (
                    <DocumentCard
                      key={doc.id}
                      document={documentWithDriver}
                      onView={() => handleViewDocument(doc.id)}
                      onApprove={() => handleApproveDocument(doc.id)}
                      onReject={() => handleRejectDocument(doc.id)}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No hay documentos registrados</p>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Vehículos */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Vehículos</h2>
        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((vehicle) => {
              const vehicleWithDriver: VehicleVerificationResponse = {
                ...vehicle,
                driver: {
                  id: driver.id,
                  firstName: driver.firstName,
                  lastName: driver.lastName,
                  email: driver.email,
                  phone: driver.phone,
                },
                createdAt: driver.createdAt,
              };
              return (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicleWithDriver}
                  onView={() => handleViewVehicle(vehicle.id)}
                  onApprove={() => handleApproveVehicle(vehicle.id)}
                  onReject={() => handleRejectVehicle(vehicle.id)}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No hay vehículos registrados</p>
        )}
      </Card>

      {/* Modal de Verificación */}
      {verificationModalOpen && (
        <VerificationModal
          isOpen={verificationModalOpen}
          onClose={() => {
            setVerificationModalOpen(false);
            setSelectedDocumentId(null);
            setSelectedVehicleId(null);
          }}
          onConfirm={handleVerifyConfirm}
          isLoading={
            verifyDocumentMutation.isPending ||
            rejectDocumentMutation.isPending ||
            verifyVehicleMutation.isPending ||
            rejectVehicleMutation.isPending
          }
          title={
            selectedDocumentId
              ? 'Verificar Documento'
              : selectedVehicleId
              ? 'Verificar Vehículo'
              : 'Verificar'
          }
          description="Selecciona la acción a realizar"
        />
      )}
    </div>
  );
}

