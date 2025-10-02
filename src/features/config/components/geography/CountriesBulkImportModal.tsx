'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '@/features/core/components';
import { useBulkImportCountries } from '../../hooks/use-geography';
import type { BulkImportResponse } from '../../schemas/geography.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface CountriesBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CountriesBulkImportModal({ isOpen, onClose, onSuccess }: CountriesBulkImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bulkImportMutation = useBulkImportCountries();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Solo se permiten archivos CSV');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no debe superar los 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Por favor selecciona un archivo CSV');
      return;
    }

    try {
      await bulkImportMutation.mutateAsync(selectedFile);
      toast.success('Importación completada exitosamente');
      onClose();
      onSuccess?.();
      setSelectedFile(null);
    } catch (error) {
      console.error('Error en importación:', error);
      toast.error('Error al importar países');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDragActive(false);
    onClose();
  };

  const downloadTemplate = () => {
    const headers = [
      'name',
      'isoCode2',
      'isoCode3',
      'numericCode',
      'phoneCode',
      'currencyCode',
      'currencyName',
      'currencySymbol',
      'timezone',
      'continent',
      'region',
      'subregion',
      'vatRate',
      'corporateTaxRate',
      'incomeTaxRate',
      'isActive',
      'requiresVerification',
      'supportedLanguages',
      'capital',
      'population',
      'areaKm2'
    ].join(',');

    const sampleData = [
      'United States,US,USA,840,+1,USD,United States Dollar,$,America/New_York,North America,Americas,Northern America,8.25,21.0,37.0,true,false,"en,es",Washington D.C.,331900000,9833517',
      'Mexico,MX,MEX,484,+52,MXN,Mexican Peso,$,America/Mexico_City,North America,Americas,Central America,16.0,30.0,35.0,true,false,"es,en",Mexico City,128900000,1964375'
    ].join('\n');

    const csvContent = `${headers}\n${sampleData}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'countries_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderImportResults = (result: BulkImportResponse) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{result.totalProcessed}</div>
            <p className="text-xs text-muted-foreground">Procesados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{result.successful}</div>
            <p className="text-xs text-muted-foreground">Exitosos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{result.skipped}</div>
            <p className="text-xs text-muted-foreground">Omitidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{result.failed}</div>
            <p className="text-xs text-muted-foreground">Fallidos</p>
          </CardContent>
        </Card>
      </div>

      {result.errors && result.errors.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Errores de Validación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {result.errors.map((error, index) => (
                <Alert key={index} className="border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Fila {error.row}:</strong> {error.field} - {error.error}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {result.skippedRecords && result.skippedRecords.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Registros Omitidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {result.skippedRecords.map((record, index) => (
                <Alert key={index} className="border-yellow-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Fila {record.row}:</strong> {record.reason}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Países desde CSV"
      footer={
        <div className="flex justify-between w-full">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar Plantilla
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} disabled={bulkImportMutation.isPending}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || bulkImportMutation.isPending}
              className="flex items-center gap-2"
            >
              {bulkImportMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Importar
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Instructions */}
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Sube un archivo CSV con los países a importar. Asegúrate de que el archivo siga el formato correcto
            con todas las columnas requeridas. Puedes descargar la plantilla para ver el formato esperado.
          </AlertDescription>
        </Alert>

        {/* File Upload Area */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Archivo CSV</Label>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : selectedFile
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-green-900">{selectedFile.name}</p>
                  <p className="text-sm text-green-700">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Remover
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Upload className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium">Arrastra y suelta tu archivo CSV aquí</p>
                  <p className="text-gray-600">o</p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2"
                  >
                    Seleccionar Archivo
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Máximo 10MB. Solo archivos CSV.
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Import Results */}
        {bulkImportMutation.data && renderImportResults(bulkImportMutation.data)}

        {/* Error Display */}
        {bulkImportMutation.error && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-red-900">
              Error al procesar el archivo. Por favor verifica el formato y vuelve a intentarlo.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Modal>
  );
}
