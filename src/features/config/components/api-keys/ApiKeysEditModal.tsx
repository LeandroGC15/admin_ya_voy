'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/features/core/components';
import { useUpdateApiKey } from '../../hooks/use-api-keys';
import { updateApiKeySchema, type UpdateApiKeyInput, type ApiKey } from '../../schemas/api-keys.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface ApiKeysEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: ApiKey | null;
  onSuccess?: () => void;
}

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

export function ApiKeysEditModal({ isOpen, onClose, apiKey, onSuccess }: ApiKeysEditModalProps) {
  const form = useForm<UpdateApiKeyInput>({
    resolver: zodResolver(updateApiKeySchema),
    defaultValues: {
      name: '',
      description: '',
      expiresAt: '',
      rotationPolicy: 'manual',
      accessLevel: 'read',
      rateLimit: undefined,
      tags: [],
      isPrimary: false,
    },
  });

  const updateApiKeyMutation = useUpdateApiKey();

  // Reset form when apiKey changes
  useEffect(() => {
    if (apiKey) {
      form.reset({
        name: apiKey.name,
        description: apiKey.description || '',
        expiresAt: apiKey.expiresAt ? new Date(apiKey.expiresAt).toISOString().slice(0, 16) : '',
        rotationPolicy: apiKey.rotationPolicy || 'manual',
        accessLevel: apiKey.accessLevel,
        rateLimit: apiKey.rateLimit,
        tags: apiKey.tags,
        isPrimary: apiKey.isPrimary,
      });
    }
  }, [apiKey, form]);

  const handleSubmit = (data: UpdateApiKeyInput) => {
    if (!apiKey) return;

    updateApiKeyMutation.mutate(
      { id: apiKey.id, data },
      {
        onSuccess: () => {
          onClose();
          invalidateQueries(['apiKeys']);
          onSuccess?.();
        },
      }
    );
  };

  if (!apiKey) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar API Key: ${apiKey.name}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={updateApiKeyMutation.isPending}
          >
            {updateApiKeyMutation.isPending ? 'Actualizando...' : 'Actualizar API Key'}
          </Button>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">Nombre</Label>
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
            <Label htmlFor="accessLevel">Nivel de Acceso</Label>
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

        {/* Current API Key Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Información Actual</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Servicio:</span> {apiKey.service}
            </div>
            <div>
              <span className="font-medium">Ambiente:</span> {apiKey.environment}
            </div>
            <div>
              <span className="font-medium">Tipo:</span> {apiKey.keyType}
            </div>
            <div>
              <span className="font-medium">Usos:</span> {apiKey.usageCount}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default ApiKeysEditModal;

