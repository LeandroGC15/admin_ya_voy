'use client';

import React from 'react';
import { FormProvider, CrudModal } from '@/components/forms';
import { userDeleteFormConfig } from '../config/user-form-config';
import { useDeleteUser } from '../hooks';
import { toast } from 'sonner';

interface UserDeleteFormProps {
  isOpen: boolean;
  userId?: string;
  userName?: string;
  onClose: () => void;
  onUserDeleted: () => void;
}

const UserDeleteForm: React.FC<UserDeleteFormProps> = ({
  isOpen,
  userId,
  userName,
  onClose,
  onUserDeleted
}) => {
  const deleteUserMutation = useDeleteUser();

  if (!isOpen) return null;

  const customConfig = {
    ...userDeleteFormConfig,
    title: `Eliminar Usuario${userName ? ` - ${userName}` : ''}`,
    ui: {
      ...userDeleteFormConfig.ui,
      submitButtonText: 'Confirmar Eliminación',
    },
    operations: {
      delete: deleteUserMutation,
    },
  };

  return (
    <FormProvider config={customConfig}>
      <CrudModal config={customConfig} />
    </FormProvider>
  );
};

export default UserDeleteForm;
