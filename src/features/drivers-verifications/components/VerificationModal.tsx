'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { VerificationStatus } from '../interfaces/verifications';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { verificationStatus: VerificationStatus; notes?: string; rejectionReason?: string }) => void;
  title: string;
  description?: string;
  isLoading?: boolean;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}) => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(VerificationStatus.VERIFIED);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleConfirm = () => {
    if (verificationStatus === VerificationStatus.REJECTED && !rejectionReason && !customReason) {
      return; // Validation should be handled by form
    }

    onConfirm({
      verificationStatus,
      notes: notes || undefined,
      rejectionReason: rejectionReason || customReason || undefined,
    });

    // Reset form
    setVerificationStatus(VerificationStatus.VERIFIED);
    setNotes('');
    setRejectionReason('');
    setCustomReason('');
  };

  const handleClose = () => {
    setVerificationStatus(VerificationStatus.VERIFIED);
    setNotes('');
    setRejectionReason('');
    setCustomReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Radio buttons para Aprobar/Rechazar */}
          <div>
            <Label className="text-base font-medium mb-3 block">Verificación</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="verificationStatus"
                  value={VerificationStatus.VERIFIED}
                  checked={verificationStatus === VerificationStatus.VERIFIED}
                  onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                  className="w-4 h-4"
                />
                <span>Aprobar</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="verificationStatus"
                  value={VerificationStatus.REJECTED}
                  checked={verificationStatus === VerificationStatus.REJECTED}
                  onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                  className="w-4 h-4"
                />
                <span>Rechazar</span>
              </label>
            </div>
          </div>

          {/* Campo de notas */}
          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales sobre la verificación..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Si rechaza, mostrar selector de razón */}
          {verificationStatus === VerificationStatus.REJECTED && (
            <div className="space-y-3 p-4 bg-red-50 rounded-md border border-red-200">
              <Label className="text-base font-medium text-red-800">
                Razón de rechazo (requerida)
              </Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rejectionReason"
                    value="Documento ilegible"
                    checked={rejectionReason === 'Documento ilegible'}
                    onChange={(e) => {
                      setRejectionReason(e.target.value);
                      setCustomReason('');
                    }}
                    className="w-4 h-4"
                  />
                  <span>Documento ilegible</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rejectionReason"
                    value="Documento vencido"
                    checked={rejectionReason === 'Documento vencido'}
                    onChange={(e) => {
                      setRejectionReason(e.target.value);
                      setCustomReason('');
                    }}
                    className="w-4 h-4"
                  />
                  <span>Documento vencido</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rejectionReason"
                    value="Información no coincide"
                    checked={rejectionReason === 'Información no coincide'}
                    onChange={(e) => {
                      setRejectionReason(e.target.value);
                      setCustomReason('');
                    }}
                    className="w-4 h-4"
                  />
                  <span>Información no coincide</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rejectionReason"
                    value="custom"
                    checked={rejectionReason === 'custom'}
                    onChange={(e) => {
                      setRejectionReason('custom');
                    }}
                    className="w-4 h-4"
                  />
                  <span>Otro</span>
                </label>
                {rejectionReason === 'custom' && (
                  <Input
                    placeholder="Especificar razón..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              isLoading ||
              (verificationStatus === VerificationStatus.REJECTED && !rejectionReason && !customReason)
            }
            className={verificationStatus === VerificationStatus.REJECTED ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isLoading ? 'Guardando...' : 'Guardar Verificación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationModal;

