'use client';

import React from 'react';
import { FormProvider, CrudModal } from '@/components/forms';
import { userCreationFormConfig } from '../config/user-form-config';
import { useCreateUser } from '../hooks';
import { toast } from 'sonner';

interface UserCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const UserCreationForm: React.FC<UserCreationFormProps> = ({ isOpen, onClose, onUserCreated }) => {
  const createUserMutation = useCreateUser();

  if (!isOpen) return null;

  // Create config with operations
  const configWithOps = {
    ...userCreationFormConfig,
    operations: {
      create: createUserMutation,
    },
  };

  return (
    <FormProvider config={configWithOps}>
      <CrudModal config={configWithOps} />
    </FormProvider>
  );
};

export default UserCreationForm;
