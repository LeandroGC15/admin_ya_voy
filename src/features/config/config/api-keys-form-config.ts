import { z } from 'zod';
import { createForm, field, fieldPresets } from '@/components/forms';
import {
  createApiKeySchema,
  updateApiKeySchema,
  toggleApiKeySchema,
  rotateApiKeySchema,
  forceRotateApiKeySchema,
  createStandardApiKeysSchema,
  bulkUpdateApiKeysSchema,
  searchApiKeysSchema,
  type CreateApiKeyInput,
  type UpdateApiKeyInput,
  type ToggleApiKeyInput,
  type RotateApiKeyInput,
  type ForceRotateApiKeyInput,
  type CreateStandardApiKeysInput,
  type BulkUpdateApiKeysInput,
  type SearchApiKeysInput,
} from '../schemas/api-keys.schemas';
import {
  useCreateApiKey,
  useUpdateApiKey,
  useDeleteApiKey,
  useToggleApiKey,
  useRotateApiKey,
  useForceRotateApiKey,
  useBulkUpdateApiKeys,
  useCreateStandardApiKeys,
} from '../hooks/use-api-keys';

// Función para crear la configuración del formulario de creación de API keys
export function createApiKeyCreateFormConfig() {
  return createForm<CreateApiKeyInput>('api-keys')
    .title('Crear Nueva API Key')
    .description('Complete la información de la nueva clave API')
    .schema(createApiKeySchema)
    .defaultValues({
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
    })
    .fields(
      field.text('name')
        .label('Nombre')
        .placeholder('Nombre descriptivo para la API key')
        .required()
        .description('Nombre único e identificable para la clave'),

      field.select('service')
        .label('Servicio')
        .options([
          { value: 'stripe', label: 'Stripe' },
          { value: 'twilio', label: 'Twilio' },
          { value: 'firebase', label: 'Firebase' },
          { value: 'google_maps', label: 'Google Maps' },
          { value: 'sendgrid', label: 'SendGrid' },
          { value: 'aws', label: 'AWS' },
          { value: 'azure', label: 'Azure' },
          { value: 'google_analytics', label: 'Google Analytics' },
        ])
        .required()
        .description('Servicio externo que utilizará la clave'),

      field.select('environment')
        .label('Ambiente')
        .options([
          { value: 'development', label: 'Desarrollo' },
          { value: 'staging', label: 'Staging' },
          { value: 'production', label: 'Producción' },
        ])
        .required()
        .description('Entorno donde se utilizará la clave'),

      field.select('keyType')
        .label('Tipo de Clave')
        .options([
          { value: 'secret', label: 'Secreta' },
          { value: 'public', label: 'Pública' },
          { value: 'private_key', label: 'Clave Privada' },
          { value: 'access_token', label: 'Token de Acceso' },
          { value: 'refresh_token', label: 'Token de Refresh' },
          { value: 'webhook_secret', label: 'Secreta de Webhook' },
        ])
        .required()
        .description('Tipo de clave según su uso'),

      field.text('keyValue')
        .label('Valor de la Clave')
        .placeholder('Ingrese el valor real de la API key')
        .required()
        .description('Valor secreto de la clave API'),

      field.textarea('description')
        .label('Descripción')
        .placeholder('Descripción opcional')
        .required(false)
        .description('Información adicional sobre el uso de la clave'),

      field.date('expiresAt')
        .label('Fecha de Expiración')
        .required(false)
        .description('Fecha opcional de expiración de la clave'),

      field.select('rotationPolicy')
        .label('Política de Rotación')
        .options([
          { value: 'manual', label: 'Manual' },
          { value: 'auto_30d', label: 'Automática (30 días)' },
          { value: 'auto_90d', label: 'Automática (90 días)' },
          { value: 'auto_1y', label: 'Automática (1 año)' },
        ])
        .required(false)
        .description('Política de rotación automática'),

      field.select('accessLevel')
        .label('Nivel de Acceso')
        .options([
          { value: 'read', label: 'Lectura' },
          { value: 'write', label: 'Escritura' },
          { value: 'admin', label: 'Admin' },
          { value: 'full', label: 'Completo' },
        ])
        .required(false)
        .description('Nivel de permisos de la clave'),

      field.number('rateLimit')
        .label('Límite de Tasa')
        .placeholder('requests/min (1-10000)')
        .min(1)
        .max(10000)
        .required(false)
        .description('Límite de requests por minuto'),

      field.checkbox('isPrimary')
        .label('Es clave primaria')
        .required(false)
        .description('Marcar como clave principal del servicio'),

      field.text('tags')
        .label('Etiquetas')
        .placeholder('etiqueta1,etiqueta2,etiqueta3')
        .required(false)
        .description('Etiquetas para organizar las claves'),
    )
    .operations({
      create: useCreateApiKey(),
    })
    .layout({ columns: 2, responsive: true })
    .ui({
      submitButtonText: 'Crear API Key',
      modalSize: 'lg',
    })
    .build();
}

// Función para crear la configuración del formulario de actualización de API keys
export function createApiKeyUpdateFormConfig() {
  return createForm<UpdateApiKeyInput>('api-keys')
    .title('Actualizar API Key')
    .description('Modifique la configuración de la clave API')
    .schema(updateApiKeySchema)
    .defaultValues({
      name: '',
      description: '',
      expiresAt: '',
      rotationPolicy: 'manual',
      accessLevel: 'read',
      rateLimit: undefined,
      tags: [],
      isPrimary: false,
    })
    .fields(
      field.text('name')
        .label('Nombre')
        .placeholder('Nombre descriptivo para la API key')
        .required(false)
        .description('Nombre único e identificable para la clave'),

      field.textarea('description')
        .label('Descripción')
        .placeholder('Descripción opcional')
        .required(false)
        .description('Información adicional sobre el uso de la clave'),

      field.date('expiresAt')
        .label('Fecha de Expiración')
        .required(false)
        .description('Fecha opcional de expiración de la clave'),

      field.select('rotationPolicy')
        .label('Política de Rotación')
        .options([
          { value: 'manual', label: 'Manual' },
          { value: 'auto_30d', label: 'Automática (30 días)' },
          { value: 'auto_90d', label: 'Automática (90 días)' },
          { value: 'auto_1y', label: 'Automática (1 año)' },
        ])
        .required(false)
        .description('Política de rotación automática'),

      field.select('accessLevel')
        .label('Nivel de Acceso')
        .options([
          { value: 'read', label: 'Lectura' },
          { value: 'write', label: 'Escritura' },
          { value: 'admin', label: 'Admin' },
          { value: 'full', label: 'Completo' },
        ])
        .required(false)
        .description('Nivel de permisos de la clave'),

      field.number('rateLimit')
        .label('Límite de Tasa')
        .placeholder('requests/min (1-10000)')
        .min(1)
        .max(10000)
        .required(false)
        .description('Límite de requests por minuto'),

      field.checkbox('isPrimary')
        .label('Es clave primaria')
        .required(false)
        .description('Marcar como clave principal del servicio'),

      field.text('tags')
        .label('Etiquetas')
        .placeholder('etiqueta1,etiqueta2,etiqueta3')
        .required(false)
        .description('Etiquetas para organizar las claves'),
    )
    .operations({
      update: useUpdateApiKey(),
    })
    .layout({ columns: 2, responsive: true })
    .ui({
      submitButtonText: 'Actualizar API Key',
      modalSize: 'lg',
    })
    .build();
}

// Función para crear la configuración del formulario de eliminación de API keys
export function createApiKeyDeleteFormConfig() {
  return createForm<{ apiKeyId: number }>('api-keys')
    .title('Eliminar API Key')
    .description('¿Está seguro de que desea eliminar esta clave API? Esta acción no se puede deshacer.')
    .schema(z.object({
      apiKeyId: z.number().min(1, 'ID de la API key es requerido'),
    }))
    .defaultValues({
      apiKeyId: 0,
    })
    .fields(
      field.number('apiKeyId')
        .label('ID de la API Key')
        .placeholder('Ingrese el ID')
        .required()
        .description('ID único de la clave API a eliminar'),
    )
    .operations({
      delete: useDeleteApiKey(),
    })
    .layout({ columns: 1 })
    .ui({
      submitButtonText: 'Eliminar API Key',
      cancelButtonText: 'Cancelar',
      modalSize: 'sm',
    })
    .build();
}

// Función para crear la configuración del formulario de activar/desactivar API keys
export function createApiKeyToggleFormConfig() {
  return createForm<ToggleApiKeyInput>('api-keys')
    .title('Cambiar Estado de API Key')
    .description('Active o desactive la clave API')
    .schema(toggleApiKeySchema)
    .defaultValues({
      active: true,
    })
    .fields(
      field.checkbox('active')
        .label('Clave activa')
        .description('Marque para activar o desmarque para desactivar la clave'),
    )
    .operations({
      update: useToggleApiKey(),
    })
    .layout({ columns: 1 })
    .ui({
      submitButtonText: 'Cambiar Estado',
      modalSize: 'sm',
    })
    .build();
}

// Función para crear la configuración del formulario de rotación de API keys
export function createApiKeyRotateFormConfig() {
  return createForm<RotateApiKeyInput>('api-keys')
    .title('Rotar API Key')
    .description('Genere una nueva clave API reemplazando la actual')
    .schema(rotateApiKeySchema)
    .defaultValues({
      newKeyValue: '',
      reason: '',
    })
    .fields(
      field.text('newKeyValue')
        .label('Nuevo valor de la clave')
        .placeholder('Ingrese el nuevo valor de la API key')
        .required(),
      field.textarea('reason')
        .label('Razón de la rotación')
        .placeholder('Describa el motivo de la rotación')
        .required(false)
        .description('Razón opcional para auditar la rotación'),
    )
    .operations({
      update: useRotateApiKey(),
    })
    .layout({ columns: 1 })
    .ui({
      submitButtonText: 'Rotar Clave',
      modalSize: 'sm',
    })
    .build();
}

// Función para crear la configuración del formulario de rotación forzada de API keys
export function createApiKeyForceRotateFormConfig() {
  return createForm<ForceRotateApiKeyInput>('api-keys')
    .title('Rotación Forzada de API Key')
    .description('Fuerce la rotación inmediata de la clave (acción crítica)')
    .schema(forceRotateApiKeySchema)
    .defaultValues({
      reason: '',
    })
    .fields(
      field.textarea('reason')
        .label('Razón de la rotación forzada')
        .placeholder('Describa el motivo crítico de la rotación')
        .required()
        .description('Razón obligatoria para la rotación forzada'),
    )
    .operations({
      update: useForceRotateApiKey(),
    })
    .layout({ columns: 1 })
    .ui({
      submitButtonText: 'Forzar Rotación',
      modalSize: 'sm',
    })
    .build();
}




// Función para crear la configuración del formulario de creación de claves estándar
export function createStandardApiKeysFormConfig() {
  return createForm<CreateStandardApiKeysInput>('api-keys')
    .title('Crear Claves Estándar')
    .description('Cree automáticamente claves API estándar para servicios comunes')
    .schema(createStandardApiKeysSchema)
    .defaultValues({
      services: [],
      environments: [],
      includeWebhooks: false,
      includePublic: false,
    })
    .fields(
      field.text('services')
        .label('Servicios')
        .options([
          { value: 'stripe', label: 'Stripe' },
          { value: 'twilio', label: 'Twilio' },
          { value: 'firebase', label: 'Firebase' },
          { value: 'google_maps', label: 'Google Maps' },
          { value: 'sendgrid', label: 'SendGrid' },
          { value: 'aws', label: 'AWS' },
          { value: 'azure', label: 'Azure' },
          { value: 'google_analytics', label: 'Google Analytics' },
        ])
        .required()
        .description('Servicios para los que crear claves'),

      field.text('environments')
        .label('Ambientes')
        .options([
          { value: 'development', label: 'Desarrollo' },
          { value: 'staging', label: 'Staging' },
          { value: 'production', label: 'Producción' },
        ])
        .required()
        .description('Ambientes donde crear las claves'),

      field.checkbox('includeWebhooks')
        .label('Incluir claves de webhooks')
        .required(false)
        .description('Crear también claves para validación de webhooks'),

      field.checkbox('includePublic')
        .label('Incluir claves públicas')
        .required(false)
        .description('Crear también claves públicas cuando aplique'),
    )
    .operations({
      create: useCreateStandardApiKeys(),
    })
    .layout({ columns: 1 })
    .ui({
      submitButtonText: 'Crear Claves Estándar',
      modalSize: 'md',
    })
    .build();
}

// Función para crear la configuración del formulario de actualización masiva de API keys
export function createBulkUpdateApiKeysFormConfig() {
  return createForm<BulkUpdateApiKeysInput>('api-keys')
    .title('Actualización Masiva de API Keys')
    .description('Actualice múltiples claves API al mismo tiempo')
    .schema(bulkUpdateApiKeysSchema)
    .defaultValues({
      keyIds: [],
      updates: {
        isActive: undefined,
        environment: undefined,
        accessLevel: undefined,
        rotationPolicy: undefined,
        tags: [],
      },
    })
    .fields(
      field.text('keyIds')
        .label('IDs de las API Keys')
        .placeholder('Ingrese los IDs separados por coma')
        .required()
        .description('IDs de las claves a actualizar'),

      field.checkbox('updates.isActive')
        .label('Estado activo')
        .required(false)
        .description('Cambiar el estado activo/inactivo'),

      field.select('updates.environment')
        .label('Ambiente')
        .options([
          { value: 'development', label: 'Desarrollo' },
          { value: 'staging', label: 'Staging' },
          { value: 'production', label: 'Producción' },
        ])
        .required(false)
        .description('Cambiar el ambiente de las claves'),

      field.select('updates.accessLevel')
        .label('Nivel de acceso')
        .options([
          { value: 'read', label: 'Lectura' },
          { value: 'write', label: 'Escritura' },
          { value: 'admin', label: 'Admin' },
          { value: 'full', label: 'Completo' },
        ])
        .required(false)
        .description('Cambiar el nivel de acceso'),

      field.select('updates.rotationPolicy')
        .label('Política de rotación')
        .options([
          { value: 'manual', label: 'Manual' },
          { value: 'auto_30d', label: 'Automática (30 días)' },
          { value: 'auto_90d', label: 'Automática (90 días)' },
          { value: 'auto_1y', label: 'Automática (1 año)' },
        ])
        .required(false)
        .description('Cambiar la política de rotación'),

      field.text('updates.tags')
        .label('Etiquetas')
        .placeholder('etiqueta1,etiqueta2,etiqueta3')
        .required(false)
        .description('Etiquetas para agregar a las claves'),
    )
    .operations({
      update: useBulkUpdateApiKeys(),
    })
    .layout({ columns: 2, responsive: true })
    .ui({
      submitButtonText: 'Actualizar Claves',
      modalSize: 'lg',
    })
    .build();
}

// Función para crear la configuración del formulario de búsqueda de API keys
export function createApiKeySearchFormConfig() {
  return createForm<SearchApiKeysInput>('api-keys')
    .title('Buscar API Keys')
    .description('Filtre las claves API por diferentes criterios')
    .schema(searchApiKeysSchema)
    .defaultValues({
      page: 1,
      limit: 20,
      service: undefined,
      environment: undefined,
      keyType: undefined,
      isActive: undefined,
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
    .fields(
      field.text('search')
        .label('Búsqueda general')
        .placeholder('Nombre, descripción o servicio')
        .required(false)
        .description('Buscar por texto en múltiples campos'),

      field.select('service')
        .label('Servicio')
        .options([
          { value: 'stripe', label: 'Stripe' },
          { value: 'twilio', label: 'Twilio' },
          { value: 'firebase', label: 'Firebase' },
          { value: 'google_maps', label: 'Google Maps' },
          { value: 'sendgrid', label: 'SendGrid' },
          { value: 'aws', label: 'AWS' },
          { value: 'azure', label: 'Azure' },
          { value: 'google_analytics', label: 'Google Analytics' },
        ])
        .placeholder('Todos los servicios')
        .required(false)
        .description('Filtrar por servicio específico'),

      field.select('environment')
        .label('Ambiente')
        .options([
          { value: 'development', label: 'Desarrollo' },
          { value: 'staging', label: 'Staging' },
          { value: 'production', label: 'Producción' },
        ])
        .placeholder('Todos los ambientes')
        .required(false)
        .description('Filtrar por ambiente específico'),

      field.select('keyType')
        .label('Tipo de clave')
        .options([
          { value: 'secret', label: 'Secreta' },
          { value: 'public', label: 'Pública' },
          { value: 'private_key', label: 'Clave Privada' },
          { value: 'access_token', label: 'Token de Acceso' },
          { value: 'refresh_token', label: 'Token de Refresh' },
          { value: 'webhook_secret', label: 'Secreta de Webhook' },
        ])
        .placeholder('Todos los tipos')
        .required(false)
        .description('Filtrar por tipo de clave'),

      field.checkbox('isActive')
        .label('Solo claves activas')
        .required(false)
        .description('Mostrar solo claves activas'),

      field.select('sortBy')
        .label('Ordenar por')
        .options([
          { value: 'name', label: 'Nombre' },
          { value: 'service', label: 'Servicio' },
          { value: 'environment', label: 'Ambiente' },
          { value: 'createdAt', label: 'Fecha de creación' },
          { value: 'usageCount', label: 'Uso' },
        ])
        .required(false)
        .description('Campo por el cual ordenar'),

      field.select('sortOrder')
        .label('Orden')
        .options([
          { value: 'asc', label: 'Ascendente' },
          { value: 'desc', label: 'Descendente' },
        ])
        .required(false)
        .description('Dirección del ordenamiento'),

      field.number('limit')
        .label('Resultados por página')
        .min(1)
        .max(100)
        .required(false)
        .description('Número de resultados a mostrar'),
    )
    .operations({})
    .layout({ columns: 3, responsive: true })
    .ui({
      submitButtonText: 'Buscar',
      showCancelButton: false,
    })
    .build();
}

// Configuraciones lazy-loaded (se crean cuando se necesitan)
export const apiKeyFormConfigs = {
  get create() { return createApiKeyCreateFormConfig(); },
  get update() { return createApiKeyUpdateFormConfig(); },
  get delete() { return createApiKeyDeleteFormConfig(); },
  get toggle() { return createApiKeyToggleFormConfig(); },
  get rotate() { return createApiKeyRotateFormConfig(); },
  get forceRotate() { return createApiKeyForceRotateFormConfig(); },
  get createStandard() { return createStandardApiKeysFormConfig(); },
  get bulkUpdate() { return createBulkUpdateApiKeysFormConfig(); },
  get search() { return createApiKeySearchFormConfig(); },
};