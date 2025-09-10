import React, { useState } from 'react';
import axios from 'axios';

interface DriverSearchFormProps {
  onClose: () => void; 
}

interface DriverData {
  id: number;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  carModel?: string;
  licensePlate?: string;
  carSeats?: number;
  status?: string; // 'online', 'offline', 'busy', 'unavailable'
  verificationStatus?: string; // 'pending', 'approved', 'rejected', 'under_review'
  canDoDeliveries?: boolean;
  createdAt?: string;
  updatedAt?: string;
  vehicleType?: {
    id: number;
    name: string;
    displayName: string;
  };
  documents?: Array<{
    id: number;
    documentType: string;
    verificationStatus: string;
    uploadedAt: string;
  }>;
  _count?: {
    rides?: number;
    deliveryOrders?: number;
  };
}

interface DriverListWithPagination {
  data: DriverData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    applied: string[];
    searchTerm: string;
  };
}

interface ApiResponseData {
  data: DriverListWithPagination;
}

const DriverSearchForm: React.FC<DriverSearchFormProps> = ({ onClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [carModel, setCarModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [status, setStatus] = useState<string>(''); // 'online', 'offline', 'busy', 'unavailable'
  const [verificationStatus, setVerificationStatus] = useState<string>(''); // 'pending', 'approved', 'rejected', 'under_review'
  const [canDoDeliveries, setCanDoDeliveries] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<DriverData[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSubmit = async (e: React.FormEvent, page: number = 1) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        throw new Error('La URL de la API no está configurada en las variables de entorno.');
      }

      const params = new URLSearchParams();
      if (firstName) params.append('firstName', firstName);
      if (lastName) params.append('lastName', lastName);
      if (carModel) params.append('carModel', carModel);
      if (licensePlate) params.append('licensePlate', licensePlate);
      if (status) params.append('status', status);
      if (verificationStatus) params.append('verificationStatus', verificationStatus);
      if (canDoDeliveries !== undefined) params.append('canDoDeliveries', canDoDeliveries.toString());
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      let url = `${API_URL}api/driver`; // CAMBIO DE ENDPOINT
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get<ApiResponseData>(url);
      
      if (response.status === 200 && response.data && response.data.data && response.data.data.data) {
        console.log('Datos de conductores recibidos (solo array de data):', response.data.data.data);
        setDrivers(response.data.data.data);
        setCurrentPage(response.data.data.pagination.page);
        setTotalPages(response.data.data.pagination.totalPages);

        if (response.data.data.data.length > 0) {
          setSearchPerformed(true);
        } else {
          setSearchPerformed(false);
          setError('No se encontraron conductores con los criterios de búsqueda.');
        }
      } else {
        setSearchPerformed(false);
        setError(`Error inesperado: ${response.statusText || 'Respuesta vacía o inválida'}`);
      }
    } catch (err) {
      setSearchPerformed(false);
      if (axios.isAxiosError(err) && err.response) {
        setError(`Error al buscar conductores: ${err.response.data.message || err.message}`);
      } else {
        setError(`Error al buscar conductores: ${err instanceof Error ? err.message : String(err)}`);
      }
      console.error('Error searching drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      handleSubmit(new Event('submit') as unknown as React.FormEvent, newPage);
    }
  };

  const handleClose = () => {
    setSearchPerformed(false);
    setDrivers(null);
    setError(null);
    setFirstName('');
    setLastName('');
    setCarModel('');
    setLicensePlate('');
    setStatus('');
    setVerificationStatus('');
    setCanDoDeliveries(undefined);
    onClose();
  };

  const mainContainerClasses = `h-screen flex p-4 bg-gray-100 dark:bg-gray-900 ${searchPerformed ? 'flex-row items-center justify-center max-w-screen-xl mx-auto' : 'items-center justify-center'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"> 
      <div className={`flex p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-xl ${searchPerformed ? 'flex-row items-center justify-center max-w-screen-xl mx-auto' : 'items-center justify-center w-full max-w-md'}`}> 
        {searchPerformed && (
          <div className="flex-1 mr-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-h-[calc(100vh-32px)] overflow-y-auto"> 
            {drivers && drivers.length > 0 ? (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Conductores Encontrados ({drivers.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> 
                  {drivers.map((driver) => (
                    <div key={driver.id} className="rounded-md bg-gray-100 p-3 shadow-sm dark:bg-gray-700 text-sm"> 
                      <p><strong>ID:</strong> {driver.id}</p>
                      <p><strong>Nombre:</strong> {driver.firstName} {driver.lastName}</p>
                      <p><strong>Modelo Auto:</strong> {driver.carModel}</p>
                      <p><strong>Placa:</strong> {driver.licensePlate}</p>
                      {driver.status && <p><strong>Estado:</strong> {driver.status}</p>}
                      {driver.verificationStatus && <p><strong>Verificación:</strong> {driver.verificationStatus}</p>}
                      {driver.canDoDeliveries !== undefined && <p><strong>Entrega:</strong> {driver.canDoDeliveries ? 'Sí' : 'No'}</p>}
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 space-x-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                      Anterior
                    </button>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 py-2">Página {currentPage} de {totalPages}</span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300">No hay conductores para mostrar. Realiza una búsqueda.</p>
            )}
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          </div>
        )}

        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"> 
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Buscar Conductores</h2>
          <form onSubmit={(e) => handleSubmit(e, 1)}> 
            <div className="mb-4">
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre del Conductor
              </label>
              <input
                type="text"
                id="firstName"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Apellido del Conductor
              </label>
              <input
                type="text"
                id="lastName"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="carModel" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Modelo de Auto
              </label>
              <input
                type="text"
                id="carModel"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="licensePlate" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Placa del Vehículo
              </label>
              <input
                type="text"
                id="licensePlate"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="status" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado del Conductor
              </label>
              <select
                id="status"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="busy">Ocupado</option>
                <option value="unavailable">No Disponible</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="verificationStatus" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado de Verificación
              </label>
              <select
                id="verificationStatus"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
                <option value="under_review">En Revisión</option>
              </select>
            </div>

            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="canDoDeliveries"
                checked={canDoDeliveries || false}
                onChange={(e) => setCanDoDeliveries(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
              />
              <label htmlFor="canDoDeliveries" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Puede Hacer Entregas
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                disabled={loading}
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                disabled={loading}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverSearchForm;
