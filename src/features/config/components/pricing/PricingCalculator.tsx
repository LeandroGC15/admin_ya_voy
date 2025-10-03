'use client';

import React, { useState } from 'react';
import { useCalculatePricing, useRideTiers } from '../../hooks/use-pricing';
import { useCountries, useStatesByCountry, useCitiesByState } from '../../hooks/use-geography';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, DollarSign, Clock, MapPin, Users, AlertCircle, CheckCircle, Percent } from 'lucide-react';
import { PricingCalculationInput, PricingCalculationResult, pricingCalculationSchema } from '../../schemas/pricing.schemas';

interface PricingCalculatorProps {
  onResult?: (result: PricingCalculationResult) => void;
}

export function PricingCalculator({ onResult }: PricingCalculatorProps) {
  const [formData, setFormData] = useState<{
    tierId: number;
    distance: number;
    duration: number;
    countryId?: number;
    stateId?: number;
    cityId?: number;
    zoneId?: number;
    surgeMultiplier?: number;
  }>({
    tierId: 0,
    distance: 5.0,
    duration: 15,
    // Campos opcionales no se inicializan
  });

  const [result, setResult] = useState<PricingCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch data for selects
  const { data: tiersData } = useRideTiers({ limit: 100, isActive: true });
  const { data: countriesData } = useCountries({ limit: 100, isActive: true });
  const { data: statesData } = useStatesByCountry(formData.countryId || 0, true);
  const { data: citiesData } = useCitiesByState(formData.stateId || 0, true);

  const calculatePricing = useCalculatePricing();

  const handleInputChange = (field: keyof PricingCalculationInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear result when inputs change
    if (result) {
      setResult(null);
      setError(null);
    }
  };

  const handleCalculate = async () => {
    if (!formData.tierId || formData.tierId === 0) {
      setError('Debe seleccionar un nivel de tarifa');
      return;
    }

    // Asegurar valores mínimos antes de enviar
    const rawDistance = Number(formData.distance);
    const rawDuration = Number(formData.duration);

    const distance = Math.max(0.1, isNaN(rawDistance) ? 0.1 : rawDistance);
    const duration = Math.max(1, isNaN(rawDuration) ? 1 : rawDuration);

    // Crear objeto de datos limpio con valores válidos
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

    try {
      setError(null);

      const response = await calculatePricing.mutateAsync(calculationData);
      setResult(response);
      onResult?.(response);
    } catch (err: any) {
      console.error('Calculation error:', err);
      setError(err.message || 'Error al calcular el precio');
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
            Calculadora de Precios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="distance">Distancia *</Label>
              <Input
                id="distance"
                type="number"
                min="0.1"
                step="0.1"
                value={formData.distance}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  handleInputChange('distance', isNaN(value) || value < 0.1 ? 0.1 : value);
                }}
                placeholder="5.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duración (minutos) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  handleInputChange('duration', isNaN(value) || value < 1 ? 1 : value);
                }}
                placeholder="15"
              />
            </div>
          </div>

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surgeMultiplier">Multiplicador de Demanda</Label>
              <Input
                id="surgeMultiplier"
                type="number"
                min="1.0"
                step="0.1"
                value={formData.surgeMultiplier || 1.0}
                onChange={(e) => handleInputChange('surgeMultiplier', parseFloat(e.target.value))}
                placeholder="1.0"
              />
            </div>

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
                onClick={handleCalculate}
                disabled={calculatePricing.isPending || !formData.tierId}
                className="w-full"
              >
                {calculatePricing.isPending ? 'Calculando...' : 'Calcular Precio'}
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
    </div>
  );
}

export default PricingCalculator;
