'use client';

import React from 'react';
import { FormProvider, CrudModal, CrudForm } from '@/components/forms';
import { driverFormConfigs } from '../config/driver-form-config';

interface DriverDeleteFormProps {
  onClose?: () => void;
  onDriverDeleted?: () => void;
}

const DriverDeleteForm: React.FC<DriverDeleteFormProps> = () => {
  return (
    <FormProvider config={driverFormConfigs.delete}>
      <CrudModal config={driverFormConfigs.delete}>
        <CrudForm config={driverFormConfigs.delete} />
      </CrudModal>
    </FormProvider>
  );
};

export default DriverDeleteForm;



