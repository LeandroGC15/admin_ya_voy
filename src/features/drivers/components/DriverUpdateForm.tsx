
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DriverUpdateFormProps {
  driverId?: string;
  onClose: () => void;
  onDriverUpdated: () => void;
  initialDriverData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    licensePlate?: string;
    status?: string;
  };
}

const DriverUpdateForm: React.FC<DriverUpdateFormProps> = ({
  driverId: propDriverId, // Renombrar prop para evitar conflicto con estado
  onClose,
  onDriverUpdated,
  initialDriverData: propInitialDriverData,
}) => {
  const [currentStep, setCurrentStep] = useState<'identifyDriver' | 'updateFields'>(propDriverId && propInitialDriverData ? 'updateFields' : 'identifyDriver');
  const [emailToSearch, setEmailToSearch] = useState(''); // Se usará para buscar por email o license plate
  const [formData, setFormData] = useState<any>(propInitialDriverData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDriverId, setCurrentDriverId] = useState<string | undefined>(propDriverId);

  useEffect(() => {
    if (propDriverId && propInitialDriverData) {
      setCurrentStep('updateFields');
      setFormData(propInitialDriverData);
      setCurrentDriverId(propDriverId);
    } else {
      setCurrentStep('identifyDriver');
      setFormData({});
      setCurrentDriverId(undefined);
    }
  }, [propDriverId, propInitialDriverData]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        throw new Error('La URL de la API no está configurada en las variables de entorno.');
      }

      let queryParam = '';
      // Simple heuristic to guess if it's a license plate (e.g., contains a hyphen, or is short and alphanumeric)
      if (emailToSearch.includes('-') || (emailToSearch.length <= 10 && /^[a-zA-Z0-9]+$/.test(emailToSearch))) {
        queryParam = `licensePlate=${emailToSearch}`;
      } else if (emailToSearch.includes('@') && emailToSearch.includes('.')) {
        // Si parece un email, por ahora lo dejamos sin un filtro específico en el backend
        // Asumimos que el backend podría manejarlo en el futuro o se ignorará si no hay un filtro de email.
        // Para este caso, vamos a buscar por firstName/lastName si el emailToSearch no es una placa.
        queryParam = `firstName=${emailToSearch}`;
      } else {
        queryParam = `firstName=${emailToSearch}`;
      }

      const response = await axios.get(`${API_URL}api/driver?${queryParam}`);

      if (response.status === 200 && response.data && response.data.data && response.data.data.data.length > 0) {
        const driver = response.data.data.data[0];
        setCurrentDriverId(driver.id);
        setFormData(driver);
        setCurrentStep('updateFields');
      } else {
        setError('Conductor no encontrado con los criterios de búsqueda.');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || err.message);
      } else {
        setError(`Error al buscar conductor: ${err instanceof Error ? err.message : String(err)}`);
      }
      console.error('Error searching driver:', err);
    } finally {
      setLoading(false);
    }
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
    setLoading(true);
    setError(null);

    if (!currentDriverId) {
      setError('No hay conductor seleccionado para actualizar.');
      setLoading(false);
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        throw new Error('La URL de la API no está configurada en las variables de entorno.');
      }

      // Envía solo el campo 'status' al endpoint de actualización de estado.
      const response = await axios.put(`${API_URL}api/driver/${currentDriverId}/status`, {
        status: formData.status,
      });

      if (response.status === 200) {
        onDriverUpdated();
        onClose();
      } else {
        setError(response.data.message || 'Error al actualizar el conductor.');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || err.message);
      } else {
        setError(`Error al actualizar conductor: ${err instanceof Error ? err.message : String(err)}`);
      }
      console.error('Error updating driver:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Actualizar Conductor</h2>
        
        <div className="flex-1 overflow-y-auto min-h-0">
          {currentStep === 'identifyDriver' && (
            <form onSubmit={handleSearch} className="flex flex-col px-2">
              <div className="mb-4">
                <label htmlFor="emailToSearch" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email, Placa o Nombre del Conductor a Actualizar
                </label>
                <input
                  type="text"
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
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  disabled={loading}
                >
                  {loading ? 'Buscando...' : 'Buscar Conductor'}
                </button>
              </div>
            </form>
          )}

          {currentStep === 'updateFields' && (
            <form onSubmit={handleSubmit} className="flex flex-col px-2">
              <p className="mb-4 text-sm text-yellow-600 dark:text-yellow-400">
                **Nota:** Debido a las limitaciones de la API actual, solo el **Estado** del conductor puede ser actualizado mediante este formulario.
              </p>
              {/* Campo: Nombre (Solo lectura) */}
              <div className="mb-4">
                <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white cursor-not-allowed"
                  value={formData.firstName || ''}
                  readOnly
                />
              </div>

              {/* Campo: Apellido (Solo lectura) */}
              <div className="mb-4">
                <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Apellido
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white cursor-not-allowed"
                  value={formData.lastName || ''}
                  readOnly
                />
              </div>

              {/* Campo: Email (Solo lectura) */}
              <div className="mb-4">
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white cursor-not-allowed"
                  value={formData.email || ''}
                  readOnly
                />
              </div>

              {/* Campo: Placa (Solo lectura) */}
              <div className="mb-4">
                <label htmlFor="licensePlate" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Placa
                </label>
                <input
                  type="text"
                  id="licensePlate"
                  className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white cursor-not-allowed"
                  value={formData.licensePlate || ''}
                  readOnly
                />
              </div>

              {/* Campo: Estatus del Conductor (Editable) */}
              <div className="mb-4">
                <label htmlFor="status" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estatus
                </label>
                <select
                  id="status"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.status || ''}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="busy">Ocupado</option>
                  <option value="unavailable">No Disponible</option>
                </select>
              </div>

              {error && <p className="mb-4 text-sm text-red-500">Formulario de actualización: {error}</p>}
              <div className="mt-4 flex justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  disabled={loading}
                >
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverUpdateForm;
