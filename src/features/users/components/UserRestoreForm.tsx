'use client';

import React, { useEffect } from 'react';
import { FormProvider, CrudModal, CrudForm } from '@/components/forms';
import { userRestoreFormConfig } from '../config/user-form-config';
import { useRestoreUser } from '../hooks';
import { toast } from 'sonner';

interface UserRestoreFormProps {
  isOpen: boolean;
  userId?: string;
  userName?: string;
  onClose: () => void;
  onUserRestored: () => void;
}

const UserRestoreForm: React.FC<UserRestoreFormProps> = ({
  isOpen,
  userId,
  userName,
  onClose,
  onUserRestored
}) => {
  const restoreUserMutation = useRestoreUser();

  // Handle successful restoration
  useEffect(() => {
    if (restoreUserMutation.isSuccess) {
      onUserRestored();
      onClose();
    }
  }, [restoreUserMutation.isSuccess, onUserRestored, onClose]);

  if (!isOpen) return null;

  // Create a wrapper mutation that adapts the form data to the hook expectations
  const wrappedRestoreMutation = {
    ...restoreUserMutation,
    mutateAsync: async (formData: { reason?: string }) => {
      if (!userId) {
        throw new Error('ID de usuario no proporcionado');
      }
      return restoreUserMutation.mutateAsync({
        userId,
        reason: formData.reason
      });
    },
  };

  const customConfig = {
    ...userRestoreFormConfig,
    title: `Restaurar Usuario${userName ? ` - ${userName}` : ''}`,
    ui: {
      ...userRestoreFormConfig.ui,
      submitButtonText: 'Confirmar Restauración',
    },
    operations: {
      update: wrappedRestoreMutation,
    },
  };

  return (
    <FormProvider config={customConfig}>
      <CrudModal config={customConfig}>
        <CrudForm config={customConfig} />
      </CrudModal>
    </FormProvider>
  );
};

export default UserRestoreForm;
