'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, MapPin, Clock } from 'lucide-react';

interface PriceExamplesProps {
  baseFare: number; // en centavos
  perKmRate: number; // en centavos
  perMinuteRate: number; // en centavos
  tierMultiplier?: number;
  surgeMultiplier?: number;
  demandMultiplier?: number;
  minimumFare?: number;
}

interface PriceCalculation {
  distance: number;
  duration: number;
  totalCost: number;
  breakdown: {
    baseFare: number;
    distanceCost: number;
    timeCost: number;
    subtotal: number;
    withMultipliers: number;
    finalPrice: number;
    isMinimumFare: boolean;
  };
}

export function PriceExamples({
  baseFare,
  perKmRate,
  perMinuteRate,
  tierMultiplier = 1.0,
  surgeMultiplier = 1.0,
  demandMultiplier = 1.0,
  minimumFare,
}: PriceExamplesProps) {
  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const calculatePrice = (distanceKm: number, durationMinutes: number): PriceCalculation => {
    // Convertir a números para evitar errores
    const baseFareNum = Number(baseFare) || 0;
    const perKmRateNum = Number(perKmRate) || 0;
    const perMinuteRateNum = Number(perMinuteRate) || 0;

    // Calcular componentes básicos
    const distanceCost = perKmRateNum * distanceKm;
    const timeCost = perMinuteRateNum * durationMinutes;

    // Subtotal antes de multiplicadores (booking fee no se incluye en precio dinámico)
    const subtotal = baseFareNum + distanceCost + timeCost;

    // Aplicar multiplicadores
    const totalMultiplier = Number(tierMultiplier) * Number(surgeMultiplier) * Number(demandMultiplier);
    const withMultipliers = subtotal * totalMultiplier;

    // Aplicar límite de tarifa mínima
    let finalPrice = withMultipliers;
    const minFare = Number(minimumFare);

    let isMinimumFare = false;

    if (minFare && finalPrice < minFare) {
      finalPrice = minFare;
      isMinimumFare = true;
    }

    return {
      distance: distanceKm,
      duration: durationMinutes,
      totalCost: finalPrice,
      breakdown: {
        baseFare: baseFareNum,
        distanceCost,
        timeCost,
        subtotal,
        withMultipliers,
        finalPrice,
        isMinimumFare,
      },
    };
  };

  // Calcular ejemplos para distancias específicas con duración fija de 15 minutos
  const examples = [3, 5, 10, 20].map(distance =>
    calculatePrice(distance, 15)
  );

  // Verificar si hay datos suficientes para mostrar ejemplos
  const hasValidData = baseFare > 0 || perKmRate > 0 || perMinuteRate > 0;

  if (!hasValidData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4" />
            Ejemplos de Precios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Configure los precios base para ver ejemplos de cálculo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4" />
          Ejemplos de Precios
          <Badge variant="outline" className="text-xs">
            15 min duración
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {examples.map((example) => (
            <div
              key={example.distance}
              className="p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-green-50"
            >
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  {example.distance} km
                </span>
                <Clock className="h-3 w-3 text-gray-500 ml-auto" />
                <span className="text-xs text-gray-600">
                  {example.duration}min
                </span>
              </div>

              <div className="text-lg font-bold text-green-700 mb-1">
                {formatCurrency(example.totalCost)}
              </div>

              <div className="space-y-0.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Base:</span>
                  <span>{formatCurrency(example.breakdown.baseFare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Distancia:</span>
                  <span>{formatCurrency(example.breakdown.distanceCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiempo:</span>
                  <span>{formatCurrency(example.breakdown.timeCost)}</span>
                </div>
              </div>

              {/* Mostrar indicadores de límites */}
              {example.breakdown.isMinimumFare && (
                <div className="mt-2">
                  <Badge
                    variant={example.breakdown.isMinimumFare ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {example.breakdown.isMinimumFare ? "Tarifa mín." : "Tarifa máx."}
                  </Badge>
                </div>
              )}

              {/* Mostrar multiplicadores si son diferentes de 1 */}
              {tierMultiplier !== 1 || surgeMultiplier !== 1 || demandMultiplier !== 1 ? (
                <div className="mt-1 text-xs text-purple-600">
                  x{(tierMultiplier * surgeMultiplier * demandMultiplier).toFixed(1)}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          <p>
            Los precios incluyen todos los multiplicadores aplicados.
            {minimumFare ? ` Tarifa mínima garantizada: ${formatCurrency(minimumFare)}.` : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default PriceExamples;
