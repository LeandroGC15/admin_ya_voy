'use client';

import React, { useMemo } from 'react';
import { Modal } from '@/features/core/components';
import { useCreateStandardApiKeys } from '../../hooks/use-api-keys';
import { createStandardApiKeysSchema, type CreateStandardApiKeysInput } from '../../schemas/api-keys.schemas';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { toast } from 'sonner';

interface ApiKeysCreateStandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const services: Array<{
  id: 'stripe' | 'twilio' | 'firebase' | 'google_maps' | 'sendgrid' | 'aws' | 'azure' | 'google_analytics';
  name: string;
  description: string;
}> = [
  { id: 'stripe', name: 'Stripe', description: 'Pagos y suscripciones' },
  { id: 'twilio', name: 'Twilio', description: 'SMS y comunicaciones' },
  { id: 'firebase', name: 'Firebase', description: 'Backend as a Service' },
  { id: 'google_maps', name: 'Google Maps', description: 'Mapas y geolocalización' },
  { id: 'sendgrid', name: 'SendGrid', description: 'Email marketing' },
  { id: 'aws', name: 'AWS', description: 'Amazon Web Services' },
  { id: 'azure', name: 'Azure', description: 'Microsoft Azure' },
  { id: 'google_analytics', name: 'Google Analytics', description: 'Análisis web' },
];

const environments: Array<{
  id: 'development' | 'staging' | 'production';
  name: string;
  color: string;
}> = [
  { id: 'development', name: 'Desarrollo', color: 'bg-blue-100 text-blue-800' },
  { id: 'staging', name: 'Staging', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'production', name: 'Producción', color: 'bg-red-100 text-red-800' },
];

export function ApiKeysCreateStandardModal({ isOpen, onClose, onSuccess }: ApiKeysCreateStandardModalProps) {
  const [selectedServices, setSelectedServices] = React.useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = React.useState<string[]>([]);
  const [includeWebhooks, setIncludeWebhooks] = React.useState(false);
  const [includePublic, setIncludePublic] = React.useState(false);

  const createStandardApiKeysMutation = useCreateStandardApiKeys();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate selections
      if (!selectedServices.length) {
        toast.error('Debe seleccionar al menos un servicio');
        return;
      }

      if (!selectedEnvironments.length) {
        toast.error('Debe seleccionar al menos un ambiente');
        return;
      }

      const payload: CreateStandardApiKeysInput = {
        services: selectedServices as any,
        environments: selectedEnvironments as any,
        includeWebhooks,
        includePublic,
      };

      await createStandardApiKeysMutation.mutateAsync(payload);

      toast.success('Claves estándar creadas exitosamente');
      onClose();
      invalidateQueries(['apiKeys']);
      onSuccess?.();

      // Reset form
      setSelectedServices([]);
      setSelectedEnvironments([]);
      setIncludeWebhooks(false);
      setIncludePublic(false);
    } catch (error) {
      toast.error('Error al crear las claves estándar');
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const toggleEnvironment = (environmentId: string) => {
    setSelectedEnvironments(prev =>
      prev.includes(environmentId)
        ? prev.filter(id => id !== environmentId)
        : [...prev, environmentId]
    );
  };

  const totalKeys = React.useMemo(() => {
    return selectedServices.length * selectedEnvironments.length * (includeWebhooks && includePublic ? 3 : (includeWebhooks || includePublic ? 2 : 1));
  }, [selectedServices.length, selectedEnvironments.length, includeWebhooks, includePublic]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Claves API Estándar"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createStandardApiKeysMutation.isPending}
          >
            {createStandardApiKeysMutation.isPending ? 'Creando...' : 'Crear Claves Estándar'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Services Selection */}
        <div>
          <Label className="text-base font-medium">Servicios *</Label>
          <p className="text-sm text-gray-600 mb-3">Seleccione los servicios para los que crear claves</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((service) => (
              <div
                key={service.id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedServices.includes(service.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleService(service.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 ${
                    selectedServices.includes(service.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedServices.includes(service.id) && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{service.name}</h4>
                    <p className="text-xs text-gray-600">{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environments Selection */}
        <div>
          <Label className="text-base font-medium">Ambientes *</Label>
          <p className="text-sm text-gray-600 mb-3">Seleccione los ambientes donde crear las claves</p>
          <div className="flex flex-wrap gap-3">
            {environments.map((env) => (
              <div
                key={env.id}
                className={`border rounded-lg px-4 py-2 cursor-pointer transition-colors ${
                  selectedEnvironments.includes(env.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleEnvironment(env.id)}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedEnvironments.includes(env.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedEnvironments.includes(env.id) && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${env.color}`}>
                    {env.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div>
          <Label className="text-base font-medium">Opciones adicionales</Label>
          <div className="mt-3 space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="includeWebhooks"
                checked={includeWebhooks}
                onCheckedChange={(checked) =>
                  setIncludeWebhooks(checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="includeWebhooks" className="text-sm font-medium">
                  Incluir claves de webhooks
                </Label>
                <p className="text-xs text-muted-foreground">
                  Crear claves adicionales para validación de webhooks
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="includePublic"
                checked={includePublic}
                onCheckedChange={(checked) =>
                  setIncludePublic(checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="includePublic" className="text-sm font-medium">
                  Incluir claves públicas
                </Label>
                <p className="text-xs text-muted-foreground">
                  Crear claves públicas además de las secretas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Resumen</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Servicios seleccionados:</span>
              <span className="ml-2 font-medium">{selectedServices.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Ambientes:</span>
              <span className="ml-2 font-medium">{selectedEnvironments.length}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Total de claves a crear:</span>
              <span className="ml-2 font-medium text-blue-600">{totalKeys}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Creación automática
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Se generarán automáticamente valores seguros para cada clave creada.</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default ApiKeysCreateStandardModal;
