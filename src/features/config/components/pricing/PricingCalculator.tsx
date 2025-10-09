'use client';

import React, { useState } from 'react';
import { useCalculatePricing, useSimulatePricing, useRideTiers, useRideTier, useTemporalRules } from '../../hooks/use-pricing';
import { useCountries, useStatesByCountry, useCitiesByState } from '../../hooks/use-geography';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, DollarSign, Clock, MapPin, Users, AlertCircle, CheckCircle, Percent, Zap } from 'lucide-react';
import { PricingCalculationInput, PricingCalculationResult, PricingSimulationInput, PricingSimulationResult, pricingCalculationSchema } from '../../schemas/pricing.schemas';
import { PriceExamples } from './PriceExamples';

interface PricingCalculatorProps {
  onResult?: (result: PricingCalculationResult) => void;
}

type OperationType = 'calculation' | 'simulation';

export function PricingCalculator({ onResult }: PricingCalculatorProps) {
  const [operationType, setOperationType] = useState<OperationType>('calculation');

  const [formData, setFormData] = useState<{
    tierId: number;
    distance: number;
    duration: number;
    dateTime: string;
    countryId?: number;
    stateId?: number;
    cityId?: number;
    zoneId?: number;
    surgeMultiplier?: number;
    ruleIds?: number[];
  }>({
    tierId: 0,
    distance: 5.0,
    duration: 15,
    dateTime: new Date().toISOString(),
    // Campos opcionales no se inicializan
  });

  const [result, setResult] = useState<PricingCalculationResult | null>(null);
  const [simulationResult, setSimulationResult] = useState<PricingSimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch data for selects
  const { data: tiersData } = useRideTiers({ limit: 100, isActive: true });
  const { data: selectedTierDetails } = useRideTier(formData.tierId || 0);
  const { data: countriesData } = useCountries({ limit: 100, isActive: true });
  const { data: statesData } = useStatesByCountry(formData.countryId || 0, true);
  const { data: citiesData } = useCitiesByState(formData.stateId || 0, true);
  const { data: temporalRulesData, isLoading: isLoadingTemporalRules } = useTemporalRules({
    limit: 100,
    isActive: true
  });

  const calculatePricing = useCalculatePricing();
  const simulatePricing = useSimulatePricing();

  const handleInputChange = (field: keyof (PricingCalculationInput & { dateTime: string; ruleIds?: number[] }), value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear result when inputs change
    if (result || simulationResult) {
      setResult(null);
      setSimulationResult(null);
      setError(null);
    }
  };

  const handleExecute = async () => {
    if (!formData.tierId || formData.tierId === 0) {
      setError('Debe seleccionar un nivel de tarifa');
      return;
    }

    // Asegurar valores mínimos antes de enviar
    const rawDistance = Number(formData.distance);
    const rawDuration = Number(formData.duration);

    // Valores mínimos dependen del tipo de operación
    const minDistance = operationType === 'calculation' ? 0.1 : 0;
    const minDuration = operationType === 'calculation' ? 1 : 0;

    const distance = Math.max(minDistance, isNaN(rawDistance) ? minDistance : rawDistance);
    const duration = Math.max(minDuration, isNaN(rawDuration) ? minDuration : rawDuration);

    try {
      setError(null);

      if (operationType === 'calculation') {
        // Crear objeto de datos para cálculo por carrera
        const calculationData: PricingCalculationInput = {
          tierId: Number(formData.tierId),
          distance: Number(distance),
          duration: Number(duration),
          surgeMultiplier: (formData.surgeMultiplier && formData.surgeMultiplier >= 0.5 && formData.surgeMultiplier <= 10)
            ? Number(formData.surgeMultiplier)
            : 1.0, // Valor por defecto según schema
          ...(formData.countryId && formData.countryId > 0 && { countryId: Number(formData.countryId) }),
          ...(formData.stateId && formData.stateId > 0 && { stateId: Number(formData.stateId) }),
          ...(formData.cityId && formData.cityId > 0 && { cityId: Number(formData.cityId) }),
          ...(formData.zoneId && formData.zoneId > 0 && { zoneId: Number(formData.zoneId) }),
        };

        const response = await calculatePricing.mutateAsync(calculationData);
        setResult(response);
        setSimulationResult(null); // Limpiar resultado de simulación
        onResult?.(response);

      } else if (operationType === 'simulation') {
        // Crear objeto de datos para simulación temporal
        const simulationData: PricingSimulationInput = {
          tierId: Number(formData.tierId),
          distance: Number(distance),
          duration: Number(duration),
          dateTime: formData.dateTime,
          ...(formData.ruleIds && formData.ruleIds.length > 0 && { ruleIds: formData.ruleIds }),
          ...(formData.countryId && formData.countryId > 0 && { countryId: Number(formData.countryId) }),
          ...(formData.stateId && formData.stateId > 0 && { stateId: Number(formData.stateId) }),
          ...(formData.cityId && formData.cityId > 0 && { cityId: Number(formData.cityId) }),
          ...(formData.zoneId && formData.zoneId > 0 && { zoneId: Number(formData.zoneId) }),
        };

        const response = await simulatePricing.mutateAsync(simulationData);
        setSimulationResult(response);
        setResult(null); // Limpiar resultado de cálculo
      }

    } catch (err: any) {
      console.error(`${operationType === 'calculation' ? 'Calculation' : 'Simulation'} error:`, err);
      setError(err.message || `Error al ${operationType === 'calculation' ? 'calcular' : 'simular'} el precio`);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const selectedTier = tiersData?.tiers.find(t => t.id === formData.tierId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora y Simulador de Precios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Operation Type Selector */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Tipo de Operación</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    operationType === 'calculation'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setOperationType('calculation');
                    setResult(null);
                    setSimulationResult(null);
                    setError(null);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Calculator className={`h-6 w-6 ${operationType === 'calculation' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <div className={`font-medium ${operationType === 'calculation' ? 'text-blue-900' : 'text-gray-900'}`}>
                        Cálculo por Carrera
                      </div>
                      <div className="text-sm text-gray-600">
                        Calcula el precio para una carrera específica considerando distancia, duración y multiplicadores
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    operationType === 'simulation'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setOperationType('simulation');
                    setResult(null);
                    setSimulationResult(null);
                    setError(null);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Clock className={`h-6 w-6 ${operationType === 'simulation' ? 'text-green-600' : 'text-gray-400'}`} />
                    <div>
                      <div className={`font-medium ${operationType === 'simulation' ? 'text-green-900' : 'text-gray-900'}`}>
                        Simulación Temporal
                      </div>
                      <div className="text-sm text-gray-600">
                        Evalúa qué reglas temporales se aplicarían en una fecha y hora específica
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tierId">Nivel de Tarifa *</Label>
              <Select
                value={formData.tierId?.toString() || ''}
                onValueChange={(value) => handleInputChange('tierId', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nivel" />
                </SelectTrigger>
                <SelectContent>
                  {tiersData?.tiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{tier.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {formatCurrency(tier.baseFare)} base
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">
                Distancia * {operationType === 'calculation' && '(mín. 0.1 km)'}
              </Label>
              <Input
                id="distance"
                type="number"
                min={operationType === 'calculation' ? "0.1" : "0"}
                step="0.1"
                value={formData.distance}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  const minValue = operationType === 'calculation' ? 0.1 : 0;
                  handleInputChange('distance', isNaN(value) || value < minValue ? minValue : value);
                }}
                placeholder={operationType === 'calculation' ? "5.0" : "0.0"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">
                Duración (minutos) * {operationType === 'calculation' && '(mín. 1 min)'}
              </Label>
              <Input
                id="duration"
                type="number"
                min={operationType === 'calculation' ? "1" : "0"}
                value={formData.duration}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  const minValue = operationType === 'calculation' ? 1 : 0;
                  handleInputChange('duration', isNaN(value) || value < minValue ? minValue : value);
                }}
                placeholder={operationType === 'calculation' ? "15" : "0"}
              />
            </div>

            {operationType === 'simulation' && (
              <div className="space-y-2">
                <Label htmlFor="dateTime">Fecha y Hora *</Label>
                <Input
                  id="dateTime"
                  type="datetime-local"
                  value={formData.dateTime ? new Date(formData.dateTime).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('dateTime', new Date(e.target.value).toISOString())}
                />
              </div>
            )}
          </div>

          {/* Operation-specific fields */}
          {operationType === 'calculation' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="surgeMultiplier">Multiplicador de Surge</Label>
                <Input
                  id="surgeMultiplier"
                  type="number"
                  min="0.5"
                  step="0.1"
                  max="10"
                  value={formData.surgeMultiplier || 1.0}
                  onChange={(e) => handleInputChange('surgeMultiplier', parseFloat(e.target.value))}
                  placeholder="1.0"
                />
              </div>
            </div>
          )}

          {operationType === 'simulation' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Reglas Temporales Específicas (opcional)</Label>
                <p className="text-xs text-gray-600">
                  Selecciona reglas específicas para aplicar en modo manual, o deja sin seleccionar para evaluación automática de todas las reglas aplicables.
                </p>

                {isLoadingTemporalRules ? (
                  <div className="text-sm text-gray-500">Cargando reglas temporales...</div>
                ) : temporalRulesData?.rules && temporalRulesData.rules.length > 0 ? (
                  <div className="space-y-3">
                    <div className="h-48 w-full border rounded-md p-3 overflow-y-auto">
                      <div className="space-y-3">
                        {temporalRulesData.rules.map((rule) => (
                          <div key={rule.id} className="flex items-start space-x-3">
                            <Checkbox
                              id={`rule-${rule.id}`}
                              checked={formData.ruleIds?.includes(rule.id) || false}
                              onCheckedChange={(checked) => {
                                const currentRuleIds = formData.ruleIds || [];
                                let newRuleIds: number[];

                                if (checked) {
                                  newRuleIds = [...currentRuleIds, rule.id];
                                } else {
                                  newRuleIds = currentRuleIds.filter(id => id !== rule.id);
                                }

                                handleInputChange('ruleIds', newRuleIds.length > 0 ? newRuleIds : undefined);
                              }}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor={`rule-${rule.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {rule.name}
                              </label>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {rule.ruleType === 'time_range' ? 'Rango Horario' :
                                   rule.ruleType === 'day_of_week' ? 'Día Semana' :
                                   rule.ruleType === 'date_specific' ? 'Fecha Específica' :
                                   rule.ruleType === 'seasonal' ? 'Temporada' : rule.ruleType}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Prioridad: {rule.priority}
                                </span>
                                <span className="text-xs text-green-600 font-medium">
                                  {rule.multiplier > 1 ? '+' : ''}{(rule.multiplier - 1) * 100}%
                                </span>
                              </div>
                              {rule.description && (
                                <p className="text-xs text-gray-500 line-clamp-2">{rule.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {formData.ruleIds && formData.ruleIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs text-gray-600 mr-2">Seleccionadas:</span>
                        {formData.ruleIds.map(ruleId => {
                          const rule = temporalRulesData.rules.find(r => r.id === ruleId);
                          return rule ? (
                            <Badge key={ruleId} variant="secondary" className="text-xs">
                              {rule.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('ruleIds', undefined)}
                        disabled={!formData.ruleIds || formData.ruleIds.length === 0}
                      >
                        Limpiar selección
                      </Button>
                      <span className="text-xs text-gray-500">
                        {formData.ruleIds?.length || 0} reglas seleccionadas
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 p-4 border rounded-md bg-gray-50">
                    No hay reglas temporales activas disponibles
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Geographic Scope */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="countryId">País</Label>
              <Select
                value={formData.countryId?.toString() || ''}
                onValueChange={(value) => {
                  const countryId = value ? parseInt(value) : undefined;
                  handleInputChange('countryId', countryId);
                  handleInputChange('stateId', undefined);
                  handleInputChange('cityId', undefined);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="País (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {countriesData?.countries.map((country) => (
                    <SelectItem key={country.id} value={country.id.toString()}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stateId">Estado</Label>
              <Select
                value={formData.stateId?.toString() || ''}
                onValueChange={(value) => {
                  const stateId = value ? parseInt(value) : undefined;
                  handleInputChange('stateId', stateId);
                  handleInputChange('cityId', undefined);
                }}
                disabled={!formData.countryId || !statesData?.states.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {statesData?.states.map((state) => (
                    <SelectItem key={state.id} value={state.id.toString()}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cityId">Ciudad</Label>
              <Select
                value={formData.cityId?.toString() || ''}
                onValueChange={(value) => handleInputChange('cityId', value ? parseInt(value) : undefined)}
                disabled={!formData.stateId || !citiesData?.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ciudad (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {citiesData?.map((city) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surgeMultiplier">Multiplicador de Surge</Label>
              <Input
                id="surgeMultiplier"
                type="number"
                min="0.5"
                step="0.1"
                max="10"
                value={formData.surgeMultiplier || 1.0}
                onChange={(e) => handleInputChange('surgeMultiplier', parseFloat(e.target.value))}
                placeholder="1.0"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleExecute}
                disabled={(calculatePricing.isPending || simulatePricing.isPending) || !formData.tierId}
                className="w-full"
              >
                {(calculatePricing.isPending || simulatePricing.isPending)
                  ? (operationType === 'calculation' ? 'Calculando...' : 'Simulando...')
                  : (operationType === 'calculation' ? 'Calcular Precio' : 'Ejecutar Simulación')
                }
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Resultado del Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Nivel de Tarifa</div>
                <div className="text-lg font-semibold">{result.tier.name}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Unidad de Distancia</div>
                <div className="text-lg font-semibold">{result.metadata.distanceUnit}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600">Moneda</div>
                <div className="text-lg font-semibold">{result.metadata.currency}</div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Desglose de Precios</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Precios Base</h4>
                  <div className="flex justify-between">
                    <span>Tarifa Base:</span>
                    <span>{formatCurrency(result.basePricing.baseFare)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costo por Distancia:</span>
                    <span>{formatCurrency(result.basePricing.distanceCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costo por Tiempo:</span>
                    <span>{formatCurrency(result.basePricing.timeCost)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Subtotal Base:</span>
                    <span>{formatCurrency(result.basePricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Con Ajuste de Nivel:</span>
                    <span>{formatCurrency(result.basePricing.tierAdjustedTotal)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Multiplicadores</h4>
                  <div className="flex justify-between">
                    <span>Regional Total:</span>
                    <Badge variant="outline">{result.regionalMultipliers.totalMultiplier.toFixed(2)}x</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Dinámico Total:</span>
                    <Badge variant="outline">{result.dynamicPricing.totalDynamicMultiplier.toFixed(2)}x</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Precio Final:</span>
                    <span className="font-semibold text-lg">{formatCurrency(result.finalPricing.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Impuestos:</span>
                    <span>{formatCurrency(result.finalPricing.taxes)}</span>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Desglose Detallado</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex justify-between">
                      <span>Monto Base:</span>
                      <span>{formatCurrency(result.finalPricing.baseAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ajustes Regionales:</span>
                      <span>{formatCurrency(result.finalPricing.regionalAdjustments)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ajustes Dinámicos:</span>
                      <span>{formatCurrency(result.finalPricing.dynamicAdjustments)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span>Tarifas de Servicio:</span>
                      <span>{formatCurrency(result.finalPricing.serviceFees)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impuestos:</span>
                      <span>{formatCurrency(result.finalPricing.taxes)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>TOTAL:</span>
                      <span>{formatCurrency(result.finalPricing.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Applied Rules */}
            {result.metadata.appliedRules.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Reglas Aplicadas</h3>
                <div className="flex flex-wrap gap-2">
                  {result.metadata.appliedRules.map((ruleDescription, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      {ruleDescription}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Calculation Timestamp */}
            <div className="text-sm text-gray-500 text-center">
              Cálculo realizado el {result.metadata.calculationTimestamp.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simulation Results */}
      {simulationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Clock className="h-5 w-5" />
              Resultado Completo de Simulación de Precios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Evaluado el</div>
                <div className="text-lg font-semibold">
                  {new Date(simulationResult.temporalEvaluation.evaluatedAt).toLocaleString()}
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Día</div>
                <div className="text-lg font-semibold">
                  {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][simulationResult.temporalEvaluation.dayOfWeek]}
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600">Hora</div>
                <div className="text-lg font-semibold">{simulationResult.temporalEvaluation.time}</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-sm text-gray-600">Modo</div>
                <div className="text-lg font-semibold">
                  {simulationResult.metadata.simulationMode === 'automatic_evaluation' ? 'Auto' : 'Manual'}
                </div>
              </div>
            </div>

            {/* Tier Information */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Información del Nivel de Tarifa</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="font-medium">{simulationResult.tier.name}</div>
                    <div className="text-sm text-gray-600">ID: {simulationResult.tier.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Tarifa Base</div>
                    <div className="font-semibold">{formatCurrency(simulationResult.tier.baseFare)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Tarifa Mínima</div>
                    <div className="font-semibold">
                      {simulationResult.tier.minimumFare ? formatCurrency(simulationResult.tier.minimumFare) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Base Pricing Breakdown */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Cálculo Base del Precio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tarifa Base:</span>
                    <span>{formatCurrency(simulationResult.basePricing.baseFare)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costo por Distancia:</span>
                    <span>{formatCurrency(simulationResult.basePricing.distanceCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costo por Tiempo:</span>
                    <span>{formatCurrency(simulationResult.basePricing.timeCost)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(simulationResult.basePricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Con Multiplicador de Nivel:</span>
                    <span>{formatCurrency(simulationResult.basePricing.tierAdjustedTotal)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Multiplicadores del Nivel</div>
                  <div className="flex justify-between">
                    <span>Tier:</span>
                    <Badge variant="outline">{simulationResult.tier.tierMultiplier}x</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Surge:</span>
                    <Badge variant="outline">{simulationResult.tier.surgeMultiplier}x</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Demand:</span>
                    <Badge variant="outline">{simulationResult.tier.demandMultiplier}x</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Multipliers */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Multiplicadores Regionales</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">País</div>
                  <div className="font-semibold">{simulationResult.regionalMultipliers.countryMultiplier}x</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Estado</div>
                  <div className="font-semibold">{simulationResult.regionalMultipliers.stateMultiplier}x</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600">Ciudad</div>
                  <div className="font-semibold">{simulationResult.regionalMultipliers.cityMultiplier}x</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm text-gray-600">Zona</div>
                  <div className="font-semibold">{simulationResult.regionalMultipliers.zoneMultiplier}x</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Regional</div>
                  <div className="font-semibold">{simulationResult.regionalMultipliers.totalMultiplier}x</div>
                </div>
              </div>
            </div>

            {/* Dynamic Pricing */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Pricing Dinámico</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-gray-600">Surge Multiplier</div>
                  <div className="text-xl font-semibold">{simulationResult.dynamicPricing.surgeMultiplier}x</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-sm text-gray-600">Demand Multiplier</div>
                  <div className="text-xl font-semibold">{simulationResult.dynamicPricing.demandMultiplier}x</div>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Dinámico</div>
                  <div className="text-xl font-semibold">{simulationResult.dynamicPricing.totalDynamicMultiplier}x</div>
                </div>
              </div>
            </div>

            {/* Temporal Pricing */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Aplicación Temporal</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <div className="text-sm text-gray-600">Multiplicador Temporal</div>
                  <div className="text-xl font-semibold">{simulationResult.temporalPricing.temporalMultiplier}x</div>
                </div>
                <div className="text-center p-4 bg-cyan-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total con Temporal</div>
                  <div className="text-xl font-semibold">{formatCurrency(simulationResult.temporalPricing.temporalAdjustedTotal)}</div>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-sm text-gray-600">Ajuste Temporal</div>
                  <div className="text-xl font-semibold">{formatCurrency(simulationResult.temporalPricing.temporalAdjustments)}</div>
                </div>
              </div>
            </div>

            {/* Final Pricing Breakdown */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Desglose Final del Precio</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monto Base:</span>
                      <span>{formatCurrency(simulationResult.finalPricing.baseAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ajustes Regionales:</span>
                      <span>{formatCurrency(simulationResult.finalPricing.regionalAdjustments)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ajustes Dinámicos:</span>
                      <span>{formatCurrency(simulationResult.finalPricing.dynamicAdjustments)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ajustes Temporales:</span>
                      <span>{formatCurrency(simulationResult.finalPricing.temporalAdjustments)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tarifas de Servicio:</span>
                      <span>{formatCurrency(simulationResult.finalPricing.serviceFees)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impuestos:</span>
                      <span>{formatCurrency(simulationResult.finalPricing.taxes)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>TOTAL FINAL:</span>
                      <span>{formatCurrency(simulationResult.finalPricing.totalAmountWithTemporal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Temporal Rules Applied */}
            <div className="space-y-4">
              {/* Applied Rule */}
              {simulationResult.temporalEvaluation.appliedRule && (
                <div className="space-y-2">
                  <h4 className="text-md font-semibold">Regla Temporal Aplicada</h4>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{simulationResult.temporalEvaluation.appliedRule.name}</div>
                        <div className="text-sm text-gray-600">
                          Tipo: {simulationResult.temporalEvaluation.appliedRule.ruleType} |
                          Prioridad: {simulationResult.temporalEvaluation.appliedRule.priority}
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {simulationResult.temporalEvaluation.appliedRule.multiplier > 1 ? '+' : ''}
                        {(simulationResult.temporalEvaluation.appliedRule.multiplier - 1) * 100}%
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Applicable Rules */}
              {simulationResult.temporalEvaluation.applicableRules.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-md font-semibold">Reglas Temporales Evaluadas</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {simulationResult.temporalEvaluation.applicableRules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{rule.name}</div>
                          <div className="text-xs text-gray-600">
                            {rule.ruleType} | Prioridad: {rule.priority}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {rule.multiplier > 1 ? '+' : ''}{(rule.multiplier - 1) * 100}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Applied Rules from Metadata */}
            {simulationResult.metadata.appliedRules.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-md font-semibold">Reglas Aplicadas en el Cálculo</h4>
                <div className="flex flex-wrap gap-2">
                  {simulationResult.metadata.appliedRules.map((ruleDescription, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      {ruleDescription}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Scope and Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Scope */}
              <div className="space-y-2">
                <h4 className="text-md font-semibold">Alcance Geográfico</h4>
                <div className="flex flex-wrap gap-2">
                  {simulationResult.scope.country && (
                    <Badge variant="outline">País: {simulationResult.scope.country}</Badge>
                  )}
                  {simulationResult.scope.state && (
                    <Badge variant="outline">Estado: {simulationResult.scope.state}</Badge>
                  )}
                  {simulationResult.scope.city && (
                    <Badge variant="outline">Ciudad: {simulationResult.scope.city}</Badge>
                  )}
                  {simulationResult.scope.zone && (
                    <Badge variant="outline">Zona: {simulationResult.scope.zone}</Badge>
                  )}
                  {!simulationResult.scope.country &&
                   !simulationResult.scope.state &&
                   !simulationResult.scope.city &&
                   !simulationResult.scope.zone && (
                    <Badge variant="outline">Global</Badge>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-2">
                <h4 className="text-md font-semibold">Información del Cálculo</h4>
                <div className="text-sm space-y-1">
                  <div>Moneda: <span className="font-medium">{simulationResult.metadata.currency}</span></div>
                  <div>Unidad: <span className="font-medium">{simulationResult.metadata.distanceUnit}</span></div>
                  <div>Calculado: <span className="font-medium">{new Date(simulationResult.metadata.calculationTimestamp).toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Examples - Show examples for the selected tier */}
      {selectedTierDetails && (
        <PriceExamples
          baseFare={selectedTierDetails.baseFare}
          perKmRate={selectedTierDetails.perKmRate}
          perMinuteRate={selectedTierDetails.perMinuteRate}
          tierMultiplier={selectedTierDetails.tierMultiplier}
          surgeMultiplier={selectedTierDetails.surgeMultiplier}
          demandMultiplier={selectedTierDetails.demandMultiplier}
          minimumFare={selectedTierDetails.minimumFare}
        />
      )}
    </div>
  );
}

export default PricingCalculator;
