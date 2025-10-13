'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, MapPin, BarChart3 } from 'lucide-react';
import type { GeometryValidationResponse } from '@/features/config/schemas/service-zones.schemas';

interface GeometryValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  validationResult: GeometryValidationResponse;
  zoneName?: string;
}

export function GeometryValidationModal({
  isOpen,
  onClose,
  validationResult,
  zoneName,
}: GeometryValidationModalProps) {
  const { isValid, errors, warnings, analysis } = validationResult;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            Validación de Geometría
            {zoneName && (
              <span className="text-sm font-normal text-gray-600">- {zoneName}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Overall Status */}
          <Alert variant={isValid ? 'default' : 'destructive'}>
            {isValid ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {isValid 
                ? 'La geometría de la zona es válida y puede ser creada.'
                : 'La geometría de la zona tiene errores que deben ser corregidos.'
              }
            </AlertDescription>
          </Alert>

          {/* Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análisis de la Zona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysis.areaKm2.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">km²</div>
                  <div className="text-xs text-gray-500">Área Total</div>
                </div>
                
                <div className="text-center p-3 bg-orange-50 rounded">
                  <div className="text-2xl font-bold text-orange-600">
                    {analysis.overlapPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Solapamiento</div>
                  <div className="text-xs text-gray-500">Con otras zonas</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {analysis.gapPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Espacios</div>
                  <div className="text-xs text-gray-500">Sin cobertura</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          {errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Errores ({errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {errors.map((error, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded border border-red-200">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-red-800">{error}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  Advertencias ({warnings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {warnings.map((warning, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-orange-800">{warning}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {isValid && (analysis.overlapPercentage > 10 || analysis.gapPercentage > 20) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
                  <MapPin className="h-5 w-5" />
                  Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.overlapPercentage > 10 && (
                    <div className="flex items-start gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-800">
                        Considera ajustar la geometría para reducir el solapamiento con otras zonas.
                      </span>
                    </div>
                  )}
                  {analysis.gapPercentage > 20 && (
                    <div className="flex items-start gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-800">
                        Hay áreas significativas sin cobertura. Considera crear zonas adicionales.
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {isValid && errors.length === 0 && warnings.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-green-800 mb-2">
                    ¡Geometría Perfecta!
                  </h3>
                  <p className="text-sm text-green-600">
                    La zona cumple con todos los criterios de validación y está lista para ser creada.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {isValid && (
              <Button onClick={onClose}>
                Continuar con la Creación
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

