'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { DocumentVerificationResponse } from '../interfaces/verifications';

interface DocumentCardProps {
  document: DocumentVerificationResponse;
  onView?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
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

  const isPending = document.verificationStatus === 'PENDING';

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium">{getDocumentTypeLabel(document.documentType)}</h4>
            {getStatusBadge(document.verificationStatus)}
          </div>
          <p className="text-sm text-gray-500">
            Subido: {new Date(document.uploadedAt).toLocaleDateString()}
          </p>
          {document.rejectionReason && (
            <p className="text-sm text-red-600 mt-1">
              Razón: {document.rejectionReason}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              disabled={isLoading}
            >
              Ver
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
                  Aprobar
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

export default DocumentCard;


