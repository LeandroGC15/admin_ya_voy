'use client';

import React from 'react';
import { UserEditModal } from './UserEditModal';
import { type User } from '../schemas/user-schemas';

interface UserUpdateFormProps {
  isOpen: boolean;
  user?: User | null;
  onClose: () => void;
  onUserUpdated: () => void;
}

const UserUpdateForm: React.FC<UserUpdateFormProps> = ({
  isOpen,
  user,
  onClose,
  onUserUpdated
}) => {
  return (
    <UserEditModal
      isOpen={isOpen}
      onClose={onClose}
      user={user}
      onSuccess={onUserUpdated}
    />
  );
};

export default UserUpdateForm;
