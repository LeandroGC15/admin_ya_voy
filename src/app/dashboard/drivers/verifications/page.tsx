'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import StatsCards from '@/features/drivers-verifications/components/StatsCards';
import FiltersPanel from '@/features/drivers-verifications/components/FiltersPanel';
import {
  useOnboardingDrivers,
  useOnboardingStats,
  useApproveDriver,
  useBulkVerifyDocuments,
  useBulkVerifyVehicles,
} from '@/features/drivers-verifications/hooks/use-verifications';
import type { GetOnboardingDriversQuery } from '@/features/drivers-verifications/interfaces/verifications';
import { VerificationStatus } from '@/features/drivers-verifications/interfaces/verifications';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

export default function DriversVerificationsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<GetOnboardingDriversQuery>({
    page: 1,
    limit: 20,
  });
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>([]);

  const { data: driversData, isLoading: isLoadingDrivers, refetch: refetchDrivers } = useOnboardingDrivers(filters);
  const { data: stats, isLoading: isLoadingStats } = useOnboardingStats();
  const approveDriverMutation = useApproveDriver();
  const bulkVerifyDocumentsMutation = useBulkVerifyDocuments();
  const bulkVerifyVehiclesMutation = useBulkVerifyVehicles();

  const handleFiltersChange = (newFilters: GetOnboardingDriversQuery) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 20 });
  };

  const handleSelectDriver = (driverId: number, checked: boolean) => {
    if (checked) {
      setSelectedDrivers([...selectedDrivers, driverId]);
    } else {
      setSelectedDrivers(selectedDrivers.filter((id) => id !== driverId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && driversData) {
      setSelectedDrivers(driversData.drivers.map((d) => d.id));
    } else {
      setSelectedDrivers([]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className="bg-green-100 text-green-800">✅ Verificado</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">❌ Rechazado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">⚠️ Pendiente</Badge>;
    }
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      'personal-data': 'Datos Personales',
      'documents': 'Documentos',
      'vehicles': 'Vehículos',
      'programa-yavoy': 'Programa Yavoy',
      'completed': 'Completado',
    };
    return labels[stage] || stage;
  };

  const handleBulkApprove = async () => {
    if (selectedDrivers.length === 0) return;

    try {
      // Aprobar cada conductor seleccionado
      const promises = selectedDrivers.map((driverId) =>
        approveDriverMutation.mutateAsync({
          driverId,
          data: { notes: 'Aprobación masiva' },
        })
      );

      await Promise.all(promises);
      toast.success(`${selectedDrivers.length} conductor(es) aprobado(s) exitosamente`);
      setSelectedDrivers([]);
      refetchDrivers();
    } catch (error: any) {
      toast.error(`Error al aprobar conductores: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleBulkReject = () => {
    if (selectedDrivers.length === 0) return;
    toast.info('La funcionalidad de rechazo masivo requiere confirmación individual');
    // TODO: Implementar modal de confirmación para rechazo masivo
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Verificación de Conductores</h1>
      </div>

      {/* Estadísticas */}
      <StatsCards stats={stats} isLoading={isLoadingStats} />

      {/* Filtros */}
      <FiltersPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Tabla */}
      <Card className="p-4">
        {isLoadingDrivers ? (
          <div className="text-center py-8">Cargando...</div>
        ) : driversData && driversData.drivers.length > 0 ? (
          <>
            {/* Acciones masivas */}
            {selectedDrivers.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedDrivers.length} conductor(es) seleccionado(s)
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkApprove}
                    disabled={approveDriverMutation.isPending}
                  >
                    {approveDriverMutation.isPending ? 'Aprobando...' : 'Aprobar Seleccionados'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkReject}
                    disabled={approveDriverMutation.isPending}
                  >
                    Rechazar Seleccionados
                  </Button>
                </div>
              </div>
            )}

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">
                      <Checkbox
                        checked={
                          driversData.drivers.length > 0 &&
                          selectedDrivers.length === driversData.drivers.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-2 text-left">Conductor</th>
                    <th className="p-2 text-left">Etapa Actual</th>
                    <th className="p-2 text-left">Progreso</th>
                    <th className="p-2 text-left">Estado</th>
                    <th className="p-2 text-left">Pendientes</th>
                    <th className="p-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {driversData.drivers.map((driver) => (
                    <tr key={driver.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <Checkbox
                          checked={selectedDrivers.includes(driver.id)}
                          onCheckedChange={(checked) =>
                            handleSelectDriver(driver.id, checked as boolean)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {driver.profileImageUrl ? (
                            <img
                              src={driver.profileImageUrl}
                              alt={`${driver.firstName} ${driver.lastName}`}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {driver.firstName[0]}{driver.lastName[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {driver.firstName} {driver.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{driver.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{getStageLabel(driver.currentStage)}</Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${driver.overallProgress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{driver.overallProgress}%</span>
                        </div>
                      </td>
                      <td className="p-2">{getStatusBadge(driver.verificationStatus)}</td>
                      <td className="p-2">
                        <div className="text-sm">
                          {driver.pendingDocumentsCount > 0 && (
                            <span className="text-yellow-600">
                              📄 {driver.pendingDocumentsCount} doc(s)
                            </span>
                          )}
                          {driver.pendingVehiclesCount > 0 && (
                            <span className="text-yellow-600 ml-2">
                              🚗 {driver.pendingVehiclesCount} vehículo(s)
                            </span>
                          )}
                          {driver.pendingDocumentsCount === 0 &&
                            driver.pendingVehiclesCount === 0 && (
                              <span className="text-green-600">✅ Sin pendientes</span>
                            )}
                        </div>
                      </td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(`/dashboard/drivers/verifications/${driver.id}`)
                          }
                        >
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {driversData.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Página {driversData.page} de {driversData.totalPages} ({driversData.total}{' '}
                  total)
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={driversData.page === 1}
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                  >
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={driversData.page === driversData.totalPages}
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No se encontraron conductores con los filtros aplicados
          </div>
        )}
      </Card>
    </div>
  );
}

