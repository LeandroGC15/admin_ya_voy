'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { driverSearchSchema, type DriverSearchValues } from '../schemas/driver-search.schema';
import { searchDrivers, type SearchDriversData } from '../services/drivers.service';
import type { ApiResponse } from '@/interfaces/ApiResponse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { type DriverData } from '../interfaces/drivers';

interface SearchResults {
  drivers: DriverData[];
  total: number;
  page: number;
  totalPages: number;
}

interface DriverSearchFormProps {
  onClose: () => void;
  onSearchResults: (results: SearchResults) => void;
}

const statusOptions = [
  { value: 'online', label: 'En línea' },
  { value: 'offline', label: 'Desconectado' },
  { value: 'busy', label: 'Ocupado' },
  { value: 'unavailable', label: 'No disponible' },
];

const verificationOptions = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'approved', label: 'Aprobado' },
  { value: 'rejected', label: 'Rechazado' },
  { value: 'under_review', label: 'En revisión' },
];

export default function DriverSearchForm({ onClose, onSearchResults }: DriverSearchFormProps) {
  const form = useForm<DriverSearchValues>({
    resolver: zodResolver(driverSearchSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      carModel: '',
      licensePlate: '',
      status: undefined,
      verificationStatus: undefined,
      canDoDeliveries: undefined,
      carSeats: undefined,
      vehicleTypeId: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      createdFrom: '',
      createdTo: '',
      updatedFrom: '',
      updatedTo: '',
      search: '',
      page: 1,
      limit: 10,
    },
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTrigger, setSearchTrigger] = useState(0); // Para forzar re-fetch
  const [hasSearched, setHasSearched] = useState(false);

  // Query key que incluye el trigger para forzar refetch
  const queryKey = ['drivers', { ...form.watch(), page: currentPage }, searchTrigger];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<SearchDriversData> => {
      console.log('Ejecutando query con página:', currentPage);
      const values = form.getValues();
      const searchParams = {
        ...values,
        page: currentPage,
        limit: values.limit || 10,
      };

      // Limpiar parámetros undefined/null pero mantener strings vacíos
      const cleanedParams = Object.fromEntries(
        Object.entries(searchParams).filter(([_, v]) => v !== undefined && v !== null)
      );

      console.log('Parámetros de búsqueda:', cleanedParams);
      const response = await searchDrivers(cleanedParams);
      console.log('Respuesta del servicio:', response);
      return response;
    },
    enabled: hasSearched, // Solo ejecuta si se ha realizado una búsqueda
    staleTime: 0, // Siempre refresca
    gcTime: 0, // No cachea (antes era cacheTime)
  });

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    const loadInitialData = () => {
      console.log('Cargando datos iniciales...');
      setHasSearched(true);
      setSearchTrigger(prev => prev + 1);
    };
    
    loadInitialData();
  }, []);

  // Manejar cambios en los datos de la query
  useEffect(() => {
    console.log('Data cambió:', data);
    if (data) {
      // La respuesta ya es SearchDriversData directamente
      const results = {
        drivers: data.drivers || [],
        total: data.total || 0,
        page: data.page || currentPage,
        totalPages: data.totalPages || 1,
      };

      console.log('Enviando resultados al padre:', results);
      onSearchResults(results);
    }
  }, [data, onSearchResults, currentPage]);

  // Manejar errores
  useEffect(() => {
    if (error) {
      console.error('Error en la query:', error);
      toast.error('Error al buscar conductores');
    }
  }, [error]);

  const onSubmit = async (formData: DriverSearchValues) => {
    try {
      console.log('Formulario enviado con datos:', formData);
      
      // Resetear a página 1 para nueva búsqueda
      setCurrentPage(1);
      form.setValue('page', 1);
      
      // Marcar que se ha realizado una búsqueda y forzar refetch
      setHasSearched(true);
      setSearchTrigger(prev => prev + 1);
      
      console.log('Búsqueda iniciada...');
    } catch (error) {
      console.error('Error al enviar búsqueda:', error);
      toast.error('Error al realizar la búsqueda');
    }
  };

  const handleReset = () => {
    console.log('Reseteando formulario...');
    
    form.reset({
      firstName: '',
      lastName: '',
      carModel: '',
      licensePlate: '',
      status: undefined,
      verificationStatus: undefined,
      canDoDeliveries: undefined,
      carSeats: undefined,
      vehicleTypeId: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      createdFrom: '',
      createdTo: '',
      updatedFrom: '',
      updatedTo: '',
      search: '',
      page: 1,
      limit: 10,
    });
    
    setCurrentPage(1);
    setSearchTrigger(prev => prev + 1);
  };

  const handlePageChange = (newPage: number) => {
    const totalPages = data ? data.totalPages : 1;

    if (newPage > 0 && newPage <= totalPages) {
      console.log('Cambiando a página:', newPage);
      setCurrentPage(newPage);
      form.setValue('page', newPage);
      setSearchTrigger(prev => prev + 1);
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.reset();
    onClose();
  };

  // Debug: mostrar estado actual
  console.log('Estado actual:', {
    isLoading,
    hasSearched,
    currentPage,
    dataExists: !!data,
    driversCount: data?.drivers?.length || 0,
    searchTrigger
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 bg-opacity-50">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Buscar Conductores</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Buscar por nombre" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input placeholder="Buscar por apellido" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa del vehículo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: ABC-123" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo del vehículo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Toyota Corolla" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Búsqueda general</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Buscar por nombre, apellido o placa..." 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select 
                      onValueChange={(value: string) => field.onChange(value === 'all' ? undefined : value)} 
                      value={field.value || 'all'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="verificationStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado de verificación</FormLabel>
                    <Select 
                      onValueChange={(value: string) => field.onChange(value === 'all' ? undefined : value)} 
                      value={field.value || 'all'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado de verificación" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {verificationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                <X className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
              <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Sección de resultados */}
        {isLoading && hasSearched && (
          <div className="mt-8 flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Cargando resultados...</span>
          </div>
        )}

        {!isLoading && hasSearched && data && (
          <div className="mt-8">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Resultados de búsqueda</h3>
              <p className="text-sm text-gray-500">
                {data.total > 0
                  ? `Se encontraron ${data.total} conductor(es)`
                  : 'No se encontraron resultados'
                }
              </p>
            </div>

            {data.drivers && data.drivers.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Modelo del Auto
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Placa
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.drivers.map((driver: DriverData) => (
                        <tr key={driver.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {driver.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {driver.firstName} {driver.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{driver.carModel || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{driver.licensePlate || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              driver.status === 'online' ? 'bg-green-100 text-green-800' :
                              driver.status === 'offline' ? 'bg-gray-100 text-gray-800' :
                              driver.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {driver.status === 'online' ? 'En línea' :
                               driver.status === 'offline' ? 'Desconectado' :
                               driver.status === 'busy' ? 'Ocupado' : 'No disponible'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Paginación */}
                {data.totalPages > 1 && (
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Página {currentPage} de {data.totalPages}
                      ({data.total} resultados en total)
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                      >
                        Anterior
                      </Button>
                      <span className="flex items-center px-4 text-sm text-gray-500">
                        {currentPage} / {data.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= data.totalPages || isLoading}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-lg">No se encontraron conductores</p>
                  <p className="text-sm">Intenta modificar los criterios de búsqueda</p>
                </div>
              </div>
            )}
          </div>
        )}

        {!isLoading && hasSearched && error && (
          <div className="mt-8 text-center py-8">
            <div className="text-red-500">
              <X className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg">Error al cargar los datos</p>
              <p className="text-sm">Por favor, intenta nuevamente</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchTrigger(prev => prev + 1)}
              >
                Reintentar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}