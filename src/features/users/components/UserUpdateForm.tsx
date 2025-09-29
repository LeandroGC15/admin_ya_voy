'use client';

import React from 'react';
import { FormProvider, CrudModal } from '@/components/forms';
import { userUpdateFormConfig } from '../config/user-form-config';
import { useUpdateUser } from '../hooks';
import { toast } from 'sonner';

interface UserUpdateFormProps {
  isOpen: boolean;
  userId?: string;
  initialData?: any;
  onClose: () => void;
  onUserUpdated: () => void;
}

const UserUpdateForm: React.FC<UserUpdateFormProps> = ({
  isOpen,
  userId,
  initialData,
  onClose,
  onUserUpdated
}) => {
  const updateUserMutation = useUpdateUser();

  if (!isOpen) return null;

  // Create config with operations
  const configWithOps = {
    ...userUpdateFormConfig,
    operations: {
      update: updateUserMutation,
    },
  };

  return (
    <FormProvider config={configWithOps}>
      <CrudModal config={configWithOps} />
    </FormProvider>
  );
};

export default UserUpdateForm;
