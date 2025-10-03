'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Car, Clock, BarChart3, Plus, Settings } from 'lucide-react';

// Componentes de Pricing
import {
  RideTiersTable,
  RideTiersCreateModal,
  RideTiersEditModal,
  RideTiersDeleteModal,
  TemporalRulesTable,
  TemporalRulesCreateModal,
  TemporalRulesEditModal,
  TemporalRulesDeleteModal,
  PricingCalculator,
  PricingSummary,
  type RideTier,
  type TemporalPricingRule,
} from '@/features/config/components/pricing';

// Hooks de Pricing
import {
  useRideTiers,
  useCreateRideTier,
  useUpdateRideTier,
  useTemporalRules,
  useCreateTemporalRule,
  useUpdateTemporalRule,
} from '@/features/config/hooks';

export default function PricingConfigPage() {
  // Estado para filtros y búsqueda
  const [rideTiersFilters, setRideTiersFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    isActive: undefined as boolean | undefined,
  });

  const [temporalRulesFilters, setTemporalRulesFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    isActive: undefined as boolean | undefined,
  });

  // Estado para modales
  const [selectedTier, setSelectedTier] = useState<RideTier | null>(null);
  const [selectedTemporalRule, setSelectedTemporalRule] = useState<TemporalPricingRule | null>(null);

  const [isCreateTierModalOpen, setIsCreateTierModalOpen] = useState(false);
  const [isEditTierModalOpen, setIsEditTierModalOpen] = useState(false);
  const [isDeleteTierModalOpen, setIsDeleteTierModalOpen] = useState(false);

  const [isCreateTemporalRuleModalOpen, setIsCreateTemporalRuleModalOpen] = useState(false);
  const [isEditTemporalRuleModalOpen, setIsEditTemporalRuleModalOpen] = useState(false);
  const [isDeleteTemporalRuleModalOpen, setIsDeleteTemporalRuleModalOpen] = useState(false);

  // Queries para datos
  const { data: rideTiersData, isLoading: isLoadingRideTiers } = useRideTiers(rideTiersFilters);
  const { data: temporalRulesData, isLoading: isLoadingTemporalRules } = useTemporalRules(temporalRulesFilters);

  // Mutations
  const createRideTierMutation = useCreateRideTier();
  const updateRideTierMutation = useUpdateRideTier();
  const createTemporalRuleMutation = useCreateTemporalRule();
  const updateTemporalRuleMutation = useUpdateTemporalRule();

  // Handlers para acciones de Ride Tiers
  const handleCreateTier = () => {
    setIsCreateTierModalOpen(true);
  };

  const handleEditTier = (tier: RideTier) => {
    setSelectedTier(tier);
    setIsEditTierModalOpen(true);
  };

  const handleDeleteTier = (tier: RideTier) => {
    setSelectedTier(tier);
    setIsDeleteTierModalOpen(true);
  };

  const handleToggleTier = async (tier: RideTier) => {
    try {
      await updateRideTierMutation.mutateAsync({
        id: tier.id,
        data: { isActive: !tier.isActive }
      });
      // Refrescar datos automáticamente gracias a React Query
    } catch (error) {
      console.error('Error toggling tier:', error);
      // Aquí podríamos mostrar un toast de error
    }
  };

  // Handlers para acciones de Temporal Rules
  const handleCreateTemporalRule = () => {
    setIsCreateTemporalRuleModalOpen(true);
  };

  const handleEditTemporalRule = (rule: TemporalPricingRule) => {
    setSelectedTemporalRule(rule);
    setIsEditTemporalRuleModalOpen(true);
  };

  const handleDeleteTemporalRule = (rule: TemporalPricingRule) => {
    setSelectedTemporalRule(rule);
    setIsDeleteTemporalRuleModalOpen(true);
  };

  const handleToggleTemporalRule = async (rule: TemporalPricingRule) => {
    try {
      await updateTemporalRuleMutation.mutateAsync({
        id: rule.id,
        data: { isActive: !rule.isActive }
      });
      // Refrescar datos automáticamente gracias a React Query
    } catch (error) {
      console.error('Error toggling temporal rule:', error);
      // Aquí podríamos mostrar un toast de error
    }
  };

  // Handlers para cerrar modales
  const handleCloseModals = () => {
    setIsCreateTierModalOpen(false);
    setIsEditTierModalOpen(false);
    setIsDeleteTierModalOpen(false);
    setIsCreateTemporalRuleModalOpen(false);
    setIsEditTemporalRuleModalOpen(false);
    setIsDeleteTemporalRuleModalOpen(false);
    setSelectedTier(null);
    setSelectedTemporalRule(null);
  };

  // Handlers para éxito de operaciones
  const handleOperationSuccess = () => {
    // Refrescar datos si es necesario
    handleCloseModals();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Pricing</h1>
          <p className="text-gray-600 mt-2">
            Administra las tarifas, precios y políticas de cobro del sistema de transporte
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1">
            <Settings className="h-4 w-4 mr-1" />
            Configuración Activa
          </Badge>
        </div>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="ride-tiers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ride-tiers" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Niveles de Tarifa
          </TabsTrigger>
          <TabsTrigger value="temporal-rules" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Reglas Temporales
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculadora
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Resumen
          </TabsTrigger>
        </TabsList>

        {/* Ride Tiers Tab */}
        <TabsContent value="ride-tiers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Gestión de Niveles de Tarifa
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Configura los diferentes niveles de servicio y sus precios base
                  </p>
                </div>
                <Button onClick={handleCreateTier} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Nivel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <RideTiersTable
                data={rideTiersData}
                loading={isLoadingRideTiers}
                onTierSelect={() => {}} // Para futuras funcionalidades
                onTierEdit={handleEditTier}
                onTierDelete={handleDeleteTier}
                onTierToggle={handleToggleTier}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Temporal Rules Tab */}
        <TabsContent value="temporal-rules" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Gestión de Reglas Temporales
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Configura multiplicadores de precio basados en tiempo y condiciones especiales
                  </p>
                </div>
                <Button onClick={handleCreateTemporalRule} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Regla
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <TemporalRulesTable
                data={temporalRulesData}
                loading={isLoadingTemporalRules}
                onRuleSelect={() => {}} // Para futuras funcionalidades
                onRuleEdit={handleEditTemporalRule}
                onRuleDelete={handleDeleteTemporalRule}
                onRuleToggle={handleToggleTemporalRule}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <PricingCalculator
            onResult={(result) => {
              console.log('Cálculo completado:', result);
            }}
          />
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <PricingSummary />
        </TabsContent>
      </Tabs>

      {/* Modales de Ride Tiers */}
      <RideTiersCreateModal
        isOpen={isCreateTierModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleOperationSuccess}
      />

      <RideTiersEditModal
        tierId={selectedTier?.id || null}
        isOpen={isEditTierModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleOperationSuccess}
      />

      <RideTiersDeleteModal
        tier={selectedTier}
        isOpen={isDeleteTierModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleOperationSuccess}
      />

      {/* Modales de Temporal Rules */}
      <TemporalRulesCreateModal
        isOpen={isCreateTemporalRuleModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleOperationSuccess}
      />

      <TemporalRulesEditModal
        ruleId={selectedTemporalRule?.id || null}
        isOpen={isEditTemporalRuleModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleOperationSuccess}
      />

      <TemporalRulesDeleteModal
        rule={selectedTemporalRule}
        isOpen={isDeleteTemporalRuleModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleOperationSuccess}
      />
    </div>
  );
}

