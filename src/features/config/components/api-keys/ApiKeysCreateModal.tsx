'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/features/core/components';
import { useCreateApiKey } from '../../hooks/use-api-keys';
import { createApiKeySchema, type CreateApiKeyInput } from '../../schemas/api-keys.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface ApiKeysCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const serviceOptions = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'twilio', label: 'Twilio' },
  { value: 'firebase', label: 'Firebase' },
  { value: 'google_maps', label: 'Google Maps' },
  { value: 'sendgrid', label: 'SendGrid' },
  { value: 'aws', label: 'AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'google_analytics', label: 'Google Analytics' },
];

const environmentOptions = [
  { value: 'development', label: 'Desarrollo' },
  { value: 'staging', label: 'Staging' },
  { value: 'production', label: 'Producción' },
];

const keyTypeOptions = [
  { value: 'secret', label: 'Secreta' },
  { value: 'public', label: 'Pública' },
  { value: 'private_key', label: 'Clave Privada' },
  { value: 'access_token', label: 'Token de Acceso' },
  { value: 'refresh_token', label: 'Token de Refresh' },
  { value: 'webhook_secret', label: 'Secreta de Webhook' },
];

const accessLevelOptions = [
  { value: 'read', label: 'Lectura' },
  { value: 'write', label: 'Escritura' },
  { value: 'admin', label: 'Admin' },
  { value: 'full', label: 'Completo' },
];

const rotationPolicyOptions = [
  { value: 'manual', label: 'Manual' },
  { value: 'auto_30d', label: 'Automática (30 días)' },
  { value: 'auto_90d', label: 'Automática (90 días)' },
  { value: 'auto_1y', label: 'Automática (1 año)' },
];

export function ApiKeysCreateModal({ isOpen, onClose, onSuccess }: ApiKeysCreateModalProps) {
  const form = useForm<CreateApiKeyInput>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: '',
      service: 'stripe',
      environment: 'development',
      keyType: 'secret',
      keyValue: '',
      description: '',
      expiresAt: '',
      rotationPolicy: 'manual',
      isPrimary: false,
      accessLevel: 'read',
      rateLimit: undefined,
      tags: [],
    },
  });

  const createApiKeyMutation = useCreateApiKey();

  const handleSubmit = (data: CreateApiKeyInput) => {
    createApiKeyMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        onClose();
        invalidateQueries(['apiKeys']);
        onSuccess?.();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nueva API Key"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={createApiKeyMutation.isPending}
          >
            {createApiKeyMutation.isPending ? 'Creando...' : 'Crear API Key'}
          </Button>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Nombre descriptivo para la API key"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="service">Servicio *</Label>
            <Select
              value={form.watch('service')}
              onValueChange={(value) => form.setValue('service', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {serviceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.service && (
              <p className="text-sm text-red-500">{form.formState.errors.service.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="environment">Ambiente *</Label>
            <Select
              value={form.watch('environment')}
              onValueChange={(value) => form.setValue('environment', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {environmentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.environment && (
              <p className="text-sm text-red-500">{form.formState.errors.environment.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="keyType">Tipo de Clave *</Label>
            <Select
              value={form.watch('keyType')}
              onValueChange={(value) => form.setValue('keyType', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {keyTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.keyType && (
              <p className="text-sm text-red-500">{form.formState.errors.keyType.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="accessLevel">Nivel de Acceso *</Label>
            <Select
              value={form.watch('accessLevel')}
              onValueChange={(value) => form.setValue('accessLevel', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accessLevelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.accessLevel && (
              <p className="text-sm text-red-500">{form.formState.errors.accessLevel.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="keyValue">Valor de la Clave *</Label>
            <Input
              id="keyValue"
              type="password"
              {...form.register('keyValue')}
              placeholder="Ingrese el valor real de la API key"
            />
            {form.formState.errors.keyValue && (
              <p className="text-sm text-red-500">{form.formState.errors.keyValue.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="rotationPolicy">Política de Rotación</Label>
            <Select
              value={form.watch('rotationPolicy')}
              onValueChange={(value) => form.setValue('rotationPolicy', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rotationPolicyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.rotationPolicy && (
              <p className="text-sm text-red-500">{form.formState.errors.rotationPolicy.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="rateLimit">Límite de Tasa (requests/min)</Label>
            <Input
              id="rateLimit"
              type="number"
              {...form.register('rateLimit', { valueAsNumber: true })}
              placeholder="1-10000"
              min={1}
              max={10000}
            />
            {form.formState.errors.rateLimit && (
              <p className="text-sm text-red-500">{form.formState.errors.rateLimit.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Descripción opcional"
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="expiresAt">Fecha de Expiración</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              {...form.register('expiresAt')}
            />
            {form.formState.errors.expiresAt && (
              <p className="text-sm text-red-500">{form.formState.errors.expiresAt.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isPrimary"
              type="checkbox"
              {...form.register('isPrimary')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isPrimary">Marcar como clave primaria</Label>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default ApiKeysCreateModal;
