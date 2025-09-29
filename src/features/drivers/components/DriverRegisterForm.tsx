'use client';

import React from 'react';
import { FormProvider, CrudModal, CrudForm } from '@/components/forms';
import { driverFormConfigs } from '../config/driver-form-config';

interface DriverRegisterFormProps {
  onClose?: () => void;
  onDriverRegistered?: () => void;
}

const DriverRegisterForm: React.FC<DriverRegisterFormProps> = () => {
  return (
    <FormProvider config={driverFormConfigs.create}>
      <CrudModal config={driverFormConfigs.create}>
        <CrudForm config={driverFormConfigs.create} />
      </CrudModal>
    </FormProvider>
  );
};

export default DriverRegisterForm;
