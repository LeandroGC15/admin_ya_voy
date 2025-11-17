'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserIdentityVerification, useApproveIdentityVerification, useRejectIdentityVerification } from '@/features/users/hooks';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, ZoomIn } from 'lucide-react';
import Loader from '@/components/ui/loader';
import { toast } from 'sonner';
import Image from 'next/image';

export default function IdentityVerificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: verification, isLoading, refetch } = useUserIdentityVerification(userId);
  const approveMutation = useApproveIdentityVerification();
  const rejectMutation = useRejectIdentityVerification();

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleBack = () => {
    router.push('/dashboard/users/identity-verifications');
  };

  const handleApprove = async () => {
    if (!userId) return;

    try {
      await approveMutation.mutateAsync({
        userId,
        data: {},
      });
      setShowApproveModal(false);
      refetch();
      invalidateQueries(['users']);
      router.push('/dashboard/users/identity-verifications');
    } catch (error: any) {
      console.error('Error approving verification:', error);
    }
  };

  const handleReject = async (rejectionReason: string) => {
    if (!userId) return;

    try {
      await rejectMutation.mutateAsync({
        userId,
        data: {
          rejectionReason,
        },
      });
      setShowRejectModal(false);
      refetch();
      invalidateQueries(['users']);
      router.push('/dashboard/users/identity-verifications');
    } catch (error: any) {
      console.error('Error rejecting verification:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Loader isVisible={true} showBackground={true} />
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-600">
              <h3 className="text-lg font-semibold mb-2">Verificación no encontrada</h3>
              <p>No se encontró una verificación de identidad para este usuario.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className="bg-green-100 text-green-800">Verificado</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rechazado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verificación de Identidad</h1>
          <p className="text-muted-foreground">
            Detalles de la verificación de {verification.userName}
          </p>
        </div>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre</label>
              <p className="text-sm font-medium">{verification.userName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm font-medium">{verification.userEmail}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">DNI</label>
              <p className="text-sm font-medium">{verification.dniNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado</label>
              <div className="mt-1">{getStatusBadge(verification.status)}</div>
            </div>
            {verification.verifiedAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Fecha de Verificación
                </label>
                <p className="text-sm font-medium">
                  {new Date(verification.verifiedAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {verification.verifiedByName && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Verificado por
                </label>
                <p className="text-sm font-medium">{verification.verifiedByName}</p>
              </div>
            )}
            {verification.rejectionReason && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Razón de Rechazo
                </label>
                <p className="text-sm font-medium text-red-600">{verification.rejectionReason}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Front Photo */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Frente del Documento
              </label>
              <div className="relative aspect-[3/4] border rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={verification.frontPhotoUrl}
                  alt="Frente del documento"
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => setSelectedImage(verification.frontPhotoUrl)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setSelectedImage(verification.frontPhotoUrl)}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Back Photo */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Reverso del Documento
              </label>
              <div className="relative aspect-[3/4] border rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={verification.backPhotoUrl}
                  alt="Reverso del documento"
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => setSelectedImage(verification.backPhotoUrl)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setSelectedImage(verification.backPhotoUrl)}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {verification.status === 'PENDING' && (
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={() => setShowApproveModal(true)}
                className="bg-green-600 hover:bg-green-700"
                disabled={approveMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprobar Verificación
              </Button>
              <Button
                onClick={() => setShowRejectModal(true)}
                variant="destructive"
                disabled={rejectMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rechazar Verificación
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <Button
              variant="outline"
              className="absolute top-4 right-4 z-10"
              onClick={() => setSelectedImage(null)}
            >
              Cerrar
            </Button>
            <img
              src={selectedImage}
              alt="Documento ampliado"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirmar Aprobación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                ¿Estás seguro de que deseas aprobar la verificación de identidad de{' '}
                <strong>{verification.userName}</strong>?
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowApproveModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {approveMutation.isPending ? 'Aprobando...' : 'Aprobar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <RejectModal
          verification={verification}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleReject}
          isPending={rejectMutation.isPending}
        />
      )}
    </div>
  );
}

// Reject Modal Component
function RejectModal({
  verification,
  onClose,
  onConfirm,
  isPending,
}: {
  verification: any;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = () => {
    if (!rejectionReason.trim()) {
      toast.error('Por favor, proporciona una razón de rechazo');
      return;
    }
    onConfirm(rejectionReason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Rechazar Verificación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            ¿Estás seguro de que deseas rechazar la verificación de identidad de{' '}
            <strong>{verification.userName}</strong>?
          </p>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Razón de rechazo <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={4}
              placeholder="Ej: Las fotos del documento no son claras o legibles"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || !rejectionReason.trim()}
              variant="destructive"
            >
              {isPending ? 'Rechazando...' : 'Rechazar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

