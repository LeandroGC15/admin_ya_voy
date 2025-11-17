'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/features/core/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import {
  usePendingIdentityVerifications,
  useIdentityVerificationStats,
  useApproveIdentityVerification,
  useRejectIdentityVerification,
  type IdentityVerification,
} from '@/features/users/hooks';
import { invalidateQueries } from '@/lib/api/react-query-client';
import Loader from '@/components/ui/loader';
import { toast } from 'sonner';

export default function IdentityVerificationsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVerification, setSelectedVerification] = useState<IdentityVerification | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: verificationsData, isLoading, refetch } = usePendingIdentityVerifications(
    currentPage,
    20
  );
  const { data: stats, isLoading: isLoadingStats } = useIdentityVerificationStats();
  const approveMutation = useApproveIdentityVerification();
  const rejectMutation = useRejectIdentityVerification();

  const verifications = verificationsData?.verifications || [];
  const pagination = verificationsData
    ? {
        currentPage: verificationsData.page,
        totalPages: verificationsData.totalPages,
        totalItems: verificationsData.total,
      }
    : null;

  const handleView = (verification: IdentityVerification) => {
    router.push(`/dashboard/users/${verification.userId}/identity-verification`);
  };

  const handleApprove = (verification: IdentityVerification) => {
    setSelectedVerification(verification);
    setShowApproveModal(true);
  };

  const handleReject = (verification: IdentityVerification) => {
    setSelectedVerification(verification);
    setShowRejectModal(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedVerification) return;

    try {
      await approveMutation.mutateAsync({
        userId: selectedVerification.userId,
        data: {},
      });
      setShowApproveModal(false);
      setSelectedVerification(null);
      refetch();
      invalidateQueries(['users']);
    } catch (error: any) {
      console.error('Error approving verification:', error);
    }
  };

  const handleConfirmReject = async (rejectionReason: string) => {
    if (!selectedVerification) return;

    try {
      await rejectMutation.mutateAsync({
        userId: selectedVerification.userId,
        data: {
          rejectionReason,
        },
      });
      setShowRejectModal(false);
      setSelectedVerification(null);
      refetch();
      invalidateQueries(['users']);
    } catch (error: any) {
      console.error('Error rejecting verification:', error);
    }
  };

  const columns = [
    {
      key: 'userName' as keyof IdentityVerification,
      header: 'Usuario',
    },
    {
      key: 'userEmail' as keyof IdentityVerification,
      header: 'Email',
    },
    {
      key: 'dniNumber' as keyof IdentityVerification,
      header: 'DNI',
    },
    {
      key: 'status' as keyof IdentityVerification,
      header: 'Estado',
      render: (value: string) => (
        <Badge
          className={
            value === 'PENDING'
              ? 'bg-yellow-100 text-yellow-800'
              : value === 'VERIFIED'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }
        >
          {value === 'PENDING' ? 'Pendiente' : value === 'VERIFIED' ? 'Verificado' : 'Rechazado'}
        </Badge>
      ),
    },
    {
      key: 'createdAt' as keyof IdentityVerification,
      header: 'Fecha de Solicitud',
      render: (value: Date) => (value ? new Date(value).toLocaleDateString() : '-'),
    },
  ];

  const renderActions = (verification: IdentityVerification) => {
    return (
      <div className="flex gap-2 items-center">
        <Button
          onClick={() => handleView(verification)}
          variant="outline"
          size="sm"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver
        </Button>
        <Button
          onClick={() => handleApprove(verification)}
          variant="default"
          size="sm"
          className="bg-green-600 hover:bg-green-700"
          disabled={approveMutation.isPending}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Aprobar
        </Button>
        <Button
          onClick={() => handleReject(verification)}
          variant="destructive"
          size="sm"
          disabled={rejectMutation.isPending}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Rechazar
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verificaciones de Identidad</h1>
          <p className="text-muted-foreground">
            Revisa y aprueba las verificaciones de identidad pendientes
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aprobadas Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approvedToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rechazadas Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejectedToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tasa de Aprobación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvalRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <DataTable
        data={verifications}
        columns={columns}
        loading={isLoading || isLoadingStats}
        pagination={
          pagination
            ? {
                ...pagination,
                onPageChange: setCurrentPage,
              }
            : undefined
        }
        actions={renderActions}
        emptyMessage="No hay verificaciones pendientes"
      />

      {/* Approve Modal */}
      {showApproveModal && selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirmar Aprobación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                ¿Estás seguro de que deseas aprobar la verificación de identidad de{' '}
                <strong>{selectedVerification.userName}</strong>?
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedVerification(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmApprove}
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
      {showRejectModal && selectedVerification && (
        <RejectModal
          verification={selectedVerification}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedVerification(null);
          }}
          onConfirm={handleConfirmReject}
          isPending={rejectMutation.isPending}
        />
      )}

      <Loader isVisible={isLoading || isLoadingStats} showBackground={true} />
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
  verification: IdentityVerification;
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

