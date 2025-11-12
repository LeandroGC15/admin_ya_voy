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

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { rejectionReason: string; notes?: string }) => void;
  title: string;
  description?: string;
  isLoading?: boolean;
}

const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    if (!rejectionReason && !customReason) {
      return; // Validation
    }

    onConfirm({
      rejectionReason: rejectionReason === 'custom' ? customReason : rejectionReason,
      notes: notes || undefined,
    });

    // Reset form
    setRejectionReason('');
    setCustomReason('');
    setNotes('');
  };

  const handleClose = () => {
    setRejectionReason('');
    setCustomReason('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-red-600">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selector de razón */}
          <div className="p-4 bg-red-50 rounded-md border border-red-200">
            <Label className="text-base font-medium text-red-800 mb-3 block">
              Razón de rechazo (requerida) *
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
                  required
                />
              )}
            </div>
          </div>

          {/* Campo de notas adicionales */}
          <div>
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales sobre el rechazo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || (!rejectionReason && !customReason)}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Rechazando...' : 'Confirmar Rechazo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectionModal;



