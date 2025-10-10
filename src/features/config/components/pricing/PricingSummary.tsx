'use client';

import React from 'react';
import { useRideTiersSummary, useTemporalRulesSummary } from '../../hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Car,
  Clock,
  TrendingUp,
  MapPin,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Percent,
  Calendar
} from 'lucide-react';

export function PricingSummary() {
  const {
    data: rideTiersSummary,
    isLoading: isLoadingRideTiers,
    error: rideTiersError
  } = useRideTiersSummary();

  const {
    data: temporalRulesSummary,
    isLoading: isLoadingTemporalRules,
    error: temporalRulesError
  } = useTemporalRulesSummary();

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  if (rideTiersError || temporalRulesError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar las estadísticas de pricing:
          {rideTiersError && <div>Ride Tiers: {rideTiersError.message}</div>}
          {temporalRulesError && <div>Temporal Rules: {temporalRulesError.message}</div>}
          <div className="mt-2">Las APIs de resumen podrían no estar implementadas aún en el backend.</div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ride Tiers Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Resumen de Niveles de Tarifa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRideTiers ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
                </div>
              ))}
            </div>
          ) : rideTiersSummary && rideTiersSummary.summary ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {rideTiersSummary.summary.totalTiers ?? 0}
                </div>
                <div className="text-sm text-blue-800">Total de Niveles</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {rideTiersSummary.summary.activeTiers ?? 0}
                </div>
                <div className="text-sm text-green-800">Niveles Activos</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {(rideTiersSummary.summary.totalRides ?? 0).toLocaleString()}
                </div>
                <div className="text-sm text-purple-800">Viajes Totales</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {rideTiersSummary.summary.averageBaseFare ? formatCurrency(rideTiersSummary.summary.averageBaseFare) : '$0.00'}
                </div>
                <div className="text-sm text-orange-800">Tarifa Base Promedio</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No se pudieron cargar las estadísticas de niveles de tarifa
            </div>
          )}

          {/* Tier Distribution */}
          {rideTiersSummary && rideTiersSummary.summary && rideTiersSummary.summary.tierDistribution && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Distribución por Tipo</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Económico</span>
                  <Badge variant="secondary">
                    {rideTiersSummary.summary.tierDistribution.economy ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Confort</span>
                  <Badge variant="secondary">
                    {rideTiersSummary.summary.tierDistribution.comfort ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Premium</span>
                  <Badge variant="secondary">
                    {rideTiersSummary.summary.tierDistribution.premium ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Lujo</span>
                  <Badge variant="secondary">
                    {rideTiersSummary.summary.tierDistribution.luxury ?? 0}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Price Ranges */}
          {rideTiersSummary && rideTiersSummary.summary && rideTiersSummary.summary.priceRanges && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Rangos de Precios</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-800">Precio Más Bajo</div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(rideTiersSummary.summary.priceRanges.lowest)}
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-800">Precio Más Alto</div>
                  <div className="text-lg font-semibold text-red-600">
                    {formatCurrency(rideTiersSummary.summary.priceRanges.highest)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Tiers List */}
          {rideTiersSummary && rideTiersSummary.summary && rideTiersSummary.summary.tiers && rideTiersSummary.summary.tiers.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Detalle de Niveles</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {rideTiersSummary.summary.tiers.map((tier) => (
                  <div key={tier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div>
                        <div className="font-medium text-sm">{tier.name}</div>
                        <div className="text-xs text-gray-600">
                          ID: {tier.id} • {tier.ridesCount.toLocaleString()} viajes
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {formatCurrency(tier.baseFare)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {tier.tierMultiplier}x • {tier.isActive ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Temporal Rules Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Resumen de Reglas Temporales
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTemporalRules ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
                </div>
              ))}
            </div>
          ) : temporalRulesSummary && temporalRulesSummary.summary ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {temporalRulesSummary.summary.totalActiveRules ?? 0}
                </div>
                <div className="text-sm text-blue-800">Reglas Activas</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {(temporalRulesSummary.summary.averageMultiplier ?? 1.0).toFixed(2)}x
                </div>
                <div className="text-sm text-green-800">Multiplicador Promedio</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {(temporalRulesSummary.summary.highestMultiplier ?? 1.0).toFixed(1)}x
                </div>
                <div className="text-sm text-purple-800">Multiplicador Máximo</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {(temporalRulesSummary.summary.lowestMultiplier ?? 1.0).toFixed(1)}x
                </div>
                <div className="text-sm text-orange-800">Multiplicador Mínimo</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No se pudieron cargar las estadísticas de reglas temporales
            </div>
          )}

          {/* Rules by Type */}
          {temporalRulesSummary && temporalRulesSummary.summary && temporalRulesSummary.summary.rulesByType && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Reglas por Tipo</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Horario</span>
                  </div>
                  <Badge variant="secondary">
                    {temporalRulesSummary.summary.rulesByType.time_range ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Día</span>
                  </div>
                  <Badge variant="secondary">
                    {temporalRulesSummary.summary.rulesByType.day_of_week ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Fecha</span>
                  </div>
                  <Badge variant="secondary">
                    {temporalRulesSummary.summary.rulesByType.date_specific ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Temporada</span>
                  </div>
                  <Badge variant="secondary">
                    {temporalRulesSummary.summary.rulesByType.seasonal ?? 0}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Rules by Scope */}
          {temporalRulesSummary && temporalRulesSummary.summary && temporalRulesSummary.summary.rulesByScope && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Reglas por Alcance Geográfico</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">Global</span>
                  </div>
                  <Badge variant="outline">
                    {temporalRulesSummary.summary.rulesByScope.global ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">País</span>
                  <Badge variant="outline">
                    {temporalRulesSummary.summary.rulesByScope.country ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Estado</span>
                  <Badge variant="outline">
                    {temporalRulesSummary.summary.rulesByScope.state ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Ciudad</span>
                  <Badge variant="outline">
                    {temporalRulesSummary.summary.rulesByScope.city ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Zona</span>
                  <Badge variant="outline">
                    {temporalRulesSummary.summary.rulesByScope.zone ?? 0}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Combined Insights */}
      {(rideTiersSummary?.summary && temporalRulesSummary?.summary) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Insights del Sistema de Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Sistema Activo</span>
                </div>
                <p className="text-sm text-gray-600">
                  {rideTiersSummary.summary.activeTiers ?? 0} niveles activos con
                  {temporalRulesSummary.summary.totalActiveRules ?? 0} reglas temporales
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Flexibilidad</span>
                </div>
                <p className="text-sm text-gray-600">
                  Multiplicadores de {(temporalRulesSummary.summary.lowestMultiplier ?? 1.0).toFixed(1)}x hasta
                  {(temporalRulesSummary.summary.highestMultiplier ?? 1.0).toFixed(1)}x
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Cobertura</span>
                </div>
                <p className="text-sm text-gray-600">
                  Desde {rideTiersSummary.summary.priceRanges?.lowest ? formatCurrency(rideTiersSummary.summary.priceRanges.lowest) : '$0.00'} hasta
                  {rideTiersSummary.summary.priceRanges?.highest ? formatCurrency(rideTiersSummary.summary.priceRanges.highest) : '$0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PricingSummary;
