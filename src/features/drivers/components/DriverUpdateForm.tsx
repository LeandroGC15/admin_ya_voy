
'use client';

import React from 'react';
import { FormProvider, CrudModal, CrudForm } from '@/components/forms';
import { driverFormConfigs } from '../config/driver-form-config';

interface DriverUpdateFormProps {
  driverId?: string;
  onClose?: () => void;
  onDriverUpdated?: () => void;
  initialDriverData?: any;
}

const DriverUpdateForm: React.FC<DriverUpdateFormProps> = () => {
  return (
    <FormProvider config={driverFormConfigs.update}>
      <CrudModal config={driverFormConfigs.update}>
        <CrudForm config={driverFormConfigs.update} />
      </CrudModal>
    </FormProvider>
  );
};

export default DriverUpdateForm;
