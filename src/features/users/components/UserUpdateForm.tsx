import React, { useState, useEffect } from 'react';
import { useUserByEmail, useUpdateUserLegacy } from '../hooks';
import { toast } from 'sonner';

interface UserUpdateFormProps {
  userId?: string; // Ahora es opcional
  onClose: () => void;
  onUserUpdated: () => void;
  initialUserData?: { // Ahora es opcional
    name?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    profileImage?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    preferredLanguage?: string;
    timezone?: string;
    currency?: string;
  };
}

const UserUpdateForm: React.FC<UserUpdateFormProps> = ({
  userId: propUserId, // Renombrar prop para evitar conflicto con estado
  onClose,
  onUserUpdated,
  initialUserData: propInitialUserData,
}) => {
  const [currentStep, setCurrentStep] = useState<'identifyUser' | 'updateFields'>(propUserId && propInitialUserData ? 'updateFields' : 'identifyUser');
  const [emailToSearch, setEmailToSearch] = useState('');
  const [formData, setFormData] = useState<any>(propInitialUserData || {});
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(propUserId);

  // React Query hooks
  const { data: searchResults, isLoading: isSearching } = useUserByEmail(emailToSearch, !!emailToSearch && currentStep === 'identifyUser');
  const updateUserMutation = useUpdateUserLegacy();

  useEffect(() => {
    if (propUserId && propInitialUserData) {
      setCurrentStep('updateFields');
      setFormData(propInitialUserData);
      setCurrentUserId(propUserId);
    } else {
      setCurrentStep('identifyUser');
      setFormData({});
      setCurrentUserId(undefined);
    }
  }, [propUserId, propInitialUserData]);

  // Handle search results from React Query
  useEffect(() => {
    if (searchResults && searchResults.users && searchResults.users.length > 0) {
      const user = searchResults.users[0];
      setCurrentUserId(user.id.toString());
      setFormData(user);
      setCurrentStep('updateFields');
      setEmailToSearch(''); // Clear search after finding result
    }
  }, [searchResults]);

  const handleEmailSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailToSearch.trim()) {
      toast.error('Por favor ingrese un email para buscar');
      return;
    }

    // The search will be triggered by the useEffect when emailToSearch changes
    // For now, we'll trigger it manually by setting the state
    // This is handled by the useUserByEmail hook above
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      toast.error('No hay usuario seleccionado para actualizar.');
      return;
    }

    updateUserMutation.mutate(
      {
        userId: currentUserId,
        userData: formData,
      },
      {
        onSuccess: () => {
          toast.success('Usuario actualizado exitosamente');
          onUserUpdated();
          onClose();
        },
        onError: (error: any) => {
          toast.error(`Error al actualizar usuario: ${error.message || 'Error desconocido'}`);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Actualizar Usuario</h2>
        
        {/* Este div es el único que hará scroll, envolviendo ambos formularios. min-h-0 es crucial aquí. */}
        <div className="flex-1 overflow-y-auto min-h-0"> {/* Este div es el único que hará scroll y se asegura de encogerse */ }
          {currentStep === 'identifyUser' && (
            <form onSubmit={handleEmailSearch} className="flex flex-col px-2"> {/* El formulario de búsqueda, ahora con flex-col y px-2 */ }
              <div className="mb-4">
                <label htmlFor="emailToSearch" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email del Usuario a Actualizar
                </label>
                <input
                  type="email"
                  id="emailToSearch"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={emailToSearch}
                  onChange={(e) => setEmailToSearch(e.target.value)}
                  required
                />
              </div>
              {error && <p className="mb-4 text-sm text-red-500">Formulario de búsqueda: {error}</p>}
              <div className="mt-4 flex justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  disabled={updateUserMutation.isPending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  disabled={updateUserMutation.isPending}
                >
                  {isSearching ? 'Buscando...' : 'Buscar Usuario'}
                </button>
              </div>
            </form>
          )}

          {currentStep === 'updateFields' && (
            <form onSubmit={handleSubmit} className="flex flex-col px-2"> {/* El formulario de actualización de campos, ahora con flex-col y px-2 */ }
              {/* Campo: Nombre */ }
              <div className="mb-4">
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.name || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Campo: Email (deshabilitado porque es el identificador) */ }
              <div className="mb-4">
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="block w-full rounded-md border-gray-300 bg-gray-200 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white cursor-not-allowed"
                  value={formData.email || ''}
                  disabled // No se puede cambiar el email que identifica al usuario
                />
              </div>

              {/* Campo: Teléfono */ }
              <div className="mb-4">
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Teléfono
                </label>
                <input
                  type="text"
                  id="phone"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.phone || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Campo: Fecha de Nacimiento */ }
              <div className="mb-4">
                <label htmlFor="dateOfBirth" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''} // Formatear fecha
                  onChange={handleChange}
                />
              </div>

              {/* Campo: Género */ }
              <div className="mb-4">
                <label htmlFor="gender" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Género
                </label>
                <select
                  id="gender"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.gender || ''}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                  <option value="prefer_not_to_say">Prefiero no decir</option>
                </select>
              </div>

              {/* Campo: URL de Imagen de Perfil */ }
              <div className="mb-4">
                <label htmlFor="profileImage" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Imagen de Perfil (URL)
                </label>
                <input
                  type="text"
                  id="profileImage"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.profileImage || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Campo: Dirección */ }
              <div className="mb-4">
                <label htmlFor="address" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dirección
                </label>
                <input
                  type="text"
                  id="address"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.address || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Campo: Ciudad */ }
              <div className="mb-4">
                <label htmlFor="city" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ciudad
                </label>
                <input
                  type="text"
                  id="city"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.city || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Campo: Estado/Provincia */ }
              <div className="mb-4">
                <label htmlFor="state" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado/Provincia
                </label>
                <input
                  type="text"
                  id="state"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.state || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Campo: País */ }
              <div className="mb-4">
                <label htmlFor="country" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  País
                </label>
                <input
                  type="text"
                  id="country"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.country || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Campo: Código Postal */ }
              <div className="mb-4">
                <label htmlFor="postalCode" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Código Postal
                </label>
                <input
                  type="text"
                  id="postalCode"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.postalCode || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Campo: Idioma Preferido */ }
              <div className="mb-4">
                <label htmlFor="preferredLanguage" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Idioma Preferido
                </label>
                <select
                  id="preferredLanguage"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.preferredLanguage || ''}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar</option>
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                </select>
              </div>

              {/* Campo: Zona Horaria */ }
              <div className="mb-4">
                <label htmlFor="timezone" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Zona Horaria
                </label>
                <input
                  type="text"
                  id="timezone"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.timezone || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Campo: Moneda */ }
              <div className="mb-4">
                <label htmlFor="currency" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Moneda
                </label>
                <select
                  id="currency"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.currency || ''}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="VES">VES</option>
                </select>
              </div>

              {error && <p className="mb-4 text-sm text-red-500">Formulario de actualización: {error}</p>}
              <div className="mt-4 flex justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  disabled={updateUserMutation.isPending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          )}
        </div> {/* Cierre del div que hará scroll para todo el contenido del formulario */ }

        {/* Botones de acción comunes y fijos para ambas etapas, siempre visibles */ }
        
      </div>
    </div>
  );
};

export default UserUpdateForm;
