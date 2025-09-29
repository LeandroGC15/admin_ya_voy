'use client';

import React, { useState } from 'react';
import { FormProvider, CrudSearchForm } from '@/components/forms';
import { userSearchFormConfig } from '../config/user-form-config';
import { useUsers } from '../hooks';

interface UserSearchFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUserForUpdate?: (user: any) => void;
}

const UserSearchForm: React.FC<UserSearchFormProps> = ({
  isOpen,
  onClose,
  onSelectUserForUpdate
}) => {
  const [searchFilters, setSearchFilters] = useState<any>({});
  const { data: searchResults, isLoading } = useUsers(searchFilters);

  if (!isOpen) return null;

  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
  };

  return (
    <FormProvider config={userSearchFormConfig}>
      <div className="p-6">
        <CrudSearchForm
          config={userSearchFormConfig}
          onSearch={handleSearch}
        />

        {/* Display search results */}
        {searchResults && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Resultados ({searchResults.users?.length || 0})</h3>
            <div className="space-y-2">
              {searchResults.users?.map((user: any) => (
                <div key={user.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => onSelectUserForUpdate?.(user)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && <div className="mt-4 text-center">Buscando...</div>}
      </div>
    </FormProvider>
  );
};

export default UserSearchForm;