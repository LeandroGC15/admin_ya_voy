'use client';

import React, { useState } from 'react';
import { useUserSearch } from '../hooks';
import UserUpdateForm from './UserUpdateForm'; // Importar el nuevo componente
import { toast } from 'sonner';

interface UserSearchFormProps {
  onClose: () => void; // Mantener onClose si el formulario se puede cerrar
  onSelectUserForUpdate: (user: UserData) => void; // Nueva prop para seleccionar usuario y actualizar
}

interface UserData {
  id: string; // Cambiado a string para reflejar el tipo de ID de Prisma
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  isActive?: boolean;
  userType?: string;
  adminRole?: string;
  createdAt?: string;
  wallet?: {
    balance: number;
  };
  _count?: {
    rides?: number;
    deliveryOrders?: number;
    ratings?: number;
  };
  clerkId?: string;
}

// Esta interfaz representa el objeto que contiene el array de UserData y la paginación
// Este es el tipo de `response.data.data`
interface UserListWithPagination {
  data: UserData[];
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

// Esta interfaz representa el objeto que está un nivel por encima de `UserListWithPagination` en la respuesta.
// Es el tipo de `response.data`.
interface ApiResponseData {
  data: UserListWithPagination;
}

const UserSearchForm: React.FC<UserSearchFormProps> = ({ onClose, onSelectUserForUpdate }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [userType, setUserType] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [searchTriggered, setSearchTriggered] = useState(false);

  // React Query hook
  const { data: searchResult, isLoading, error } = useUserSearch(
    {
      email: email || undefined,
      name: name || undefined,
      phone: phone || undefined,
      city: city || undefined,
      userType: userType as 'passenger' | 'driver' || undefined,
      isActive,
      limit: 50,
    },
    searchTriggered
  );
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [totalPages, setTotalPages] = useState(1); // Estado para el total de páginas
  const limit = 5; // Definir un límite por página
  const [searchPerformed, setSearchPerformed] = useState(false); // Nuevo estado para controlar el layout
  // Handle search results from React Query
  React.useEffect(() => {
    if (searchResult) {
      if (searchResult.users && searchResult.users.length > 0) {
        setUsers(searchResult.users);
        setCurrentPage(searchResult.page);
        setTotalPages(searchResult.totalPages);
        setSearchPerformed(true);
      } else {
        setUsers([]);
        setSearchPerformed(false);
      }
    }
  }, [searchResult]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      setSearchPerformed(false);
      toast.error('Error al buscar usuarios');
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTriggered(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      handleSubmit(new Event('submit') as unknown as React.FormEvent, newPage);
    }
  };

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>, user: UserData) => {
    const action = e.target.value;
    // setSelectedUserId(user.id); // Eliminado
    // setSelectedAction(action); // Eliminado

    if (action === 'update') {
      onSelectUserForUpdate(user); // Llamar a la prop para comunicar al padre
      onClose(); // Cerrar el formulario de búsqueda
      // setInitialUpdateData({ // Eliminado
      //   name: user.name,
      //   email: user.email,
      //   phone: user.phone,
      // });
    } else if (action === 'delete') {
      // Lógica para eliminar usuario (abrir modal de confirmación, etc.)
      console.log(`Acción: ${action} para el usuario ID: ${user.id}`);
    }
    // Restablecer el select para que no quede seleccionada la acción después de ejecutarla
    e.target.value = '';
  };

  // const handleUserUpdated = () => { // Eliminado
  //   handleSubmit(new Event('submit') as unknown as React.FormEvent, currentPage); 
  // };

  // const handleCloseUpdateForm = () => { // Eliminado
  //   setSelectedAction('');
  //   setSelectedUserId(null);
  //   setInitialUpdateData(null);
  // };

  const handleClose = () => {
    setSearchPerformed(false);
    setUsers(null);
    setError(null);
    setEmail('');
    setName('');
    setPhone('');
    setCity('');
    setUserType('');
    setIsActive(undefined);
    // setSelectedAction(''); // Eliminado
    // setSelectedUserId(null); // Eliminado
    // setInitialUpdateData(null); // Eliminado
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"> {/* Overlay fijo */}
      <div className={`flex p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-xl ${searchPerformed ? 'flex-row items-center justify-center max-w-screen-xl mx-auto' : 'items-center justify-center w-full max-w-md'}`}> {/* Contenedor principal con clases dinámicas */}
        {searchPerformed && (
          // Columna Izquierda: Resultados de Usuarios - SOLO SE RENDERIZA SI SE HA REALIZADO UNA BÚSQUEDA
          <div className="flex-1 mr-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-h-[calc(100vh-32px)] overflow-y-auto"> {/* Ajustado: max-h para ocupar la altura disponible */}
            {users && users.length > 0 ? (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Usuarios Encontrados ({users.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Grid para las tarjetas */}
                  {users.map((user) => (
                    <div key={user.id} className="rounded-md bg-gray-100 p-3 shadow-sm dark:bg-gray-700 text-sm"> {/* Tarjeta de usuario más pequeña */}
                      <p><strong>ID:</strong> {user.id}</p>
                      <p><strong>Nombre:</strong> {user.name}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      {/* Mostrar menos detalles para mantener la tarjeta pequeña */}
                      {user.phone && <p><strong>Teléfono:</strong> {user.phone}</p>}
                      {user.userType && <p><strong>Tipo:</strong> {user.userType}</p>}
                      
                      {/* Dropdown para acciones de CRUD */}
                      <div className="mt-2">
                        <label htmlFor={`action-${user.id}`} className="sr-only">Acciones</label>
                        <select
                          id={`action-${user.id}`}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                          onChange={(e) => handleActionChange(e, user)}
                          value={''} // Siempre vacío para forzar la selección cada vez
                        >
                          <option value="">Seleccionar Acción</option>
                          <option value="update">Actualizar</option>
                          <option value="delete">Eliminar</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Controles de Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 space-x-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                      Anterior
                    </button>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 py-2">Página {currentPage} de {totalPages}</span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoading}
                      className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            ) : ( 
              <p className="text-gray-700 dark:text-gray-300">No hay usuarios para mostrar. Realiza una búsqueda.</p>
            )}
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          </div>
        )}

        {/* Formulario de Búsqueda (siempre visible, su posición depende del contenedor padre) */}
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"> {/* Formulario */}
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Buscar Usuarios</h2>
          <form onSubmit={(e) => handleSubmit(e, 1)}> {/* Asegurarse de que al enviar el formulario siempre se vaya a la página 1 */}
            <div className="mb-4">
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email del Usuario
              </label>
              <input
                type="email"
                id="email"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre del Usuario
              </label>
              <input
                type="text"
                id="name"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Teléfono del Usuario
              </label>
              <input
                type="text"
                id="phone"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="city" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ciudad del Usuario
              </label>
              <input
                type="text"
                id="city"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="userType" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de Usuario
              </label>
              <select
                id="userType"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive || false} // Asegurar que no sea undefined para el checkbox
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Usuario Activo
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                disabled={isLoading}
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                disabled={isLoading}
              >
                {isLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Eliminado: Renderizado condicional de UserUpdateForm */}
    </div>
  );
};

export default UserSearchForm;
