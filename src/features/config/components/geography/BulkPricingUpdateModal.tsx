'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, DollarSign, TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import { bulkPricingUpdateSchema, type BulkPricingUpdateInput } from '@/features/config/schemas/service-zones.schemas';
import { useBulkUpdatePricing, useServiceZones } from '@/features/config/hooks/use-service-zones';
import { useCities } from '@/features/config/hooks/use-geography';

interface BulkPricingUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  selectedZoneIds?: number[];
}

export function BulkPricingUpdateModal({
  isOpen,
  onClose,
  onSuccess,
  selectedZoneIds = [],
}: BulkPricingUpdateModalProps) {
  const [previewResults, setPreviewResults] = useState<Array<{
    id: number;
    name: string;
    currentValue: number;
    newValue: number;
    change: number;
    changePercent: number;
  }>>([]);

  const form = useForm<BulkPricingUpdateInput>({
    resolver: zodResolver(bulkPricingUpdateSchema),
    defaultValues: {
      zoneIds: selectedZoneIds,
      cityId: undefined,
      zoneType: undefined,
      adjustmentType: 'percentage',
      adjustmentValue: 0,
      field: 'pricingMultiplier',
    },
  });

  const bulkUpdatePricingMutation = useBulkUpdatePricing();
  const { data: citiesData } = useCities();
  const cities = citiesData?.cities || [];
  const { data: zonesData } = useServiceZones({
    cityId: form.watch('cityId'),
    zoneType: form.watch('zoneType'),
    isActive: true,
  });

  // Calculate preview when form values change
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      if (values.adjustmentValue && values.field) {
        calculatePreview(values as BulkPricingUpdateInput);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const calculatePreview = (data: BulkPricingUpdateInput) => {
    let targetZones = zonesData?.zones || [];

    // Filter by selected zone IDs if provided
    if (data.zoneIds && data.zoneIds.length > 0) {
      targetZones = targetZones.filter(zone => data.zoneIds!.includes(zone.id));
    }

    const results = targetZones.map(zone => {
      const currentValue = data.field === 'pricingMultiplier' 
        ? zone.pricingMultiplier 
        : zone.demandMultiplier;
      
      let newValue: number;
      if (data.adjustmentType === 'percentage') {
        newValue = currentValue * (1 + data.adjustmentValue / 100);
      } else {
        newValue = currentValue + data.adjustmentValue;
      }

      // Ensure values stay within bounds
      newValue = Math.max(0.5, Math.min(10, newValue));

      const change = newValue - currentValue;
      const changePercent = (change / currentValue) * 100;

      return {
        id: zone.id,
        name: zone.name,
        currentValue,
        newValue: Number(newValue.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(1)),
      };
    });

    setPreviewResults(results);
  };

  const handleSubmit = async (data: BulkPricingUpdateInput) => {
    try {
      await bulkUpdatePricingMutation.mutateAsync(data);
      onSuccess?.();
      onClose();
      
      // Reset form
      form.reset();
      setPreviewResults([]);
    } catch (error) {
      console.error('Error updating pricing:', error);
    }
  };

  const isLoading = bulkUpdatePricingMutation.isPending;
  const watchedValues = form.watch();
  const hasPreview = previewResults.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Actualización Masiva de Pricing
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Section */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configuración</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Field to Update */}
                  <div className="space-y-2">
                    <Label htmlFor="field">Campo a Actualizar *</Label>
                    <Select value={form.watch('field')} onValueChange={(value) => form.setValue('field', value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pricingMultiplier">Multiplicador de Pricing</SelectItem>
                        <SelectItem value="demandMultiplier">Multiplicador de Demanda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Adjustment Type */}
                  <div className="space-y-2">
                    <Label htmlFor="adjustmentType">Tipo de Ajuste *</Label>
                    <Select value={form.watch('adjustmentType')} onValueChange={(value) => form.setValue('adjustmentType', value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fijo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Adjustment Value */}
                  <div className="space-y-2">
                    <Label htmlFor="adjustmentValue">
                      Valor de Ajuste * 
                      {watchedValues.adjustmentType === 'percentage' ? ' (%)' : ''}
                    </Label>
                    <Input
                      id="adjustmentValue"
                      type="number"
                      step={watchedValues.adjustmentType === 'percentage' ? '1' : '0.1'}
                      {...form.register('adjustmentValue', { valueAsNumber: true })}
                      placeholder={watchedValues.adjustmentType === 'percentage' ? '10' : '0.5'}
                    />
                    {form.formState.errors.adjustmentValue && (
                      <p className="text-sm text-red-600">{form.formState.errors.adjustmentValue.message}</p>
                    )}
                  </div>

                  {/* City Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="cityId">Filtrar por Ciudad (Opcional)</Label>
                    <Select value={form.watch('cityId')?.toString() || 'all'} onValueChange={(value) => form.setValue('cityId', value === 'all' ? undefined : parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las ciudades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las ciudades</SelectItem>
                        {cities?.map((city) => (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.name}, {city.state?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Zone Type Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="zoneType">Filtrar por Tipo (Opcional)</Label>
                    <Select value={form.watch('zoneType') || 'all'} onValueChange={(value) => form.setValue('zoneType', value === 'all' ? undefined : value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="restricted">Restringida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Info */}
              <Alert>
                <Calculator className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Instrucciones:</p>
                    <ul className="text-sm list-disc list-inside">
                      <li>Selecciona el campo y tipo de ajuste</li>
                      <li>Los valores se mantendrán entre 0.5 y 10</li>
                      <li>Usa filtros para limitar las zonas afectadas</li>
                      <li>Revisa la vista previa antes de aplicar</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Vista Previa ({previewResults.length} zonas)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasPreview ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {previewResults.map((result) => (
                        <div key={result.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{result.name}</span>
                            <Badge variant={result.change > 0 ? 'default' : 'secondary'}>
                              {result.change > 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {result.changePercent > 0 ? '+' : ''}{result.changePercent}%
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{result.currentValue} → {result.newValue}</span>
                            <span className={result.change > 0 ? 'text-green-600' : 'text-red-600'}>
                              {result.change > 0 ? '+' : ''}{result.change}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Configura los parámetros para ver la vista previa</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Summary */}
              {hasPreview && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {previewResults.filter(r => r.change > 0).length}
                        </div>
                        <div className="text-xs text-gray-600">Aumentos</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {previewResults.filter(r => r.change < 0).length}
                        </div>
                        <div className="text-xs text-gray-600">Reducciones</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!hasPreview || isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aplicar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
