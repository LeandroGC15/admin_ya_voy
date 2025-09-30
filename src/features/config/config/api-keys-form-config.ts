import { createForm, field, fieldPresets } from '@/components/forms';
import { z } from 'zod';

// API Keys schemas
const createApiKeySchema = z.object({
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(100),
  service: z.enum(['stripe', 'twilio', 'firebase', 'google_maps', 'sendgrid', 'aws', 'azure', 'google_analytics']),
  environment: z.enum(['development', 'staging', 'production']),
  keyType: z.enum(['secret', 'public', 'private_key', 'access_token', 'refresh_token', 'webhook_secret']),
  keyValue: z.string().min(10, 'El valor de la clave debe tener al menos 10 caracteres'),
  description: z.string().optional(),
  expiresAt: z.string().optional(),
  rotationPolicy: z.enum(['manual', 'auto_30d', 'auto_90d', 'auto_1y']).optional(),
  isPrimary: z.boolean().optional(),
  accessLevel: z.enum(['read', 'write', 'admin', 'full']).optional(),
  rateLimit: z.number().min(1).max(10000).optional(),
  tags: z.array(z.string()).optional(),
});

const updateApiKeySchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  expiresAt: z.string().optional(),
  rotationPolicy: z.enum(['manual', 'auto_30d', 'auto_90d', 'auto_1y']).optional(),
  accessLevel: z.enum(['read', 'write', 'admin', 'full']).optional(),
  rateLimit: z.number().min(1).max(10000).optional(),
  tags: z.array(z.string()).optional(),
  isPrimary: z.boolean().optional(),
});

const searchApiKeysSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  service: z.enum(['stripe', 'twilio', 'firebase', 'google_maps', 'sendgrid', 'aws', 'azure', 'google_analytics']).optional(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
  keyType: z.enum(['secret', 'public', 'private_key', 'access_token', 'refresh_token', 'webhook_secret']).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'service', 'environment', 'createdAt', 'usageCount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const toggleApiKeySchema = z.object({
  active: z.boolean(),
});

const createStandardKeysSchema = z.object({
  services: z.array(z.enum(['stripe', 'twilio', 'firebase', 'google_maps', 'sendgrid', 'aws', 'azure', 'google_analytics'])),
  environments: z.array(z.enum(['development', 'staging', 'production'])),
  includeWebhooks: z.boolean().optional(),
  includePublic: z.boolean().optional(),
});

// Form configuration factories (operations are injected at runtime)
export const getApiKeyCreationFormConfig = (operations: any) => createForm('api-keys')
  .title('Crear Nueva API Key')
  .schema(createApiKeySchema)
  .defaultValues({
    name: '',
    service: 'stripe' as const,
    environment: 'development' as const,
    keyType: 'secret' as const,
    keyValue: '',
    description: '',
    expiresAt: '',
    rotationPolicy: 'manual' as const,
    isPrimary: false,
    accessLevel: 'read' as const,
    rateLimit: undefined,
    tags: [],
  })
  .fields(
    field.text('name')
      .label('Nombre')
      .placeholder('Nombre descriptivo para la API key')
      .required()
      .build(),

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
      .build(),

    field.select('environment')
      .label('Ambiente')
      .options([
        { value: 'development', label: 'Desarrollo' },
        { value: 'staging', label: 'Staging' },
        { value: 'production', label: 'Producción' },
      ])
      .required()
      .build(),

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
      .build(),

    field.text('keyValue')
      .label('Valor de la Clave')
      .placeholder('Ingrese el valor de la API key')
      .required()
      .build(),

    field.textarea('description')
      .label('Descripción')
      .placeholder('Descripción opcional')
      .required(false)
      .build(),

    field.date('expiresAt')
      .label('Fecha de Expiración')
      .required(false)
      .build(),

    field.select('rotationPolicy')
      .label('Política de Rotación')
      .options([
        { value: 'manual', label: 'Manual' },
        { value: 'auto_30d', label: 'Automática (30 días)' },
        { value: 'auto_90d', label: 'Automática (90 días)' },
        { value: 'auto_1y', label: 'Automática (1 año)' },
      ])
      .required(false)
      .build(),

    field.select('accessLevel')
      .label('Nivel de Acceso')
      .options([
        { value: 'read', label: 'Lectura' },
        { value: 'write', label: 'Escritura' },
        { value: 'admin', label: 'Admin' },
        { value: 'full', label: 'Completo' },
      ])
      .required(false)
      .build(),

    field.number('rateLimit')
      .label('Límite de Tasa')
      .placeholder('requests/min (1-10000)')
      .min(1)
      .max(10000)
      .required(false)
      .build(),

    field.checkbox('isPrimary')
      .label('Es clave primaria')
      .required(false)
      .build()
  )
  .operations(operations)
  .layout({ columns: 2, responsive: true })
  .ui({
    submitButtonText: 'Crear API Key',
    modalSize: 'lg'
  })
  .build();

export const apiKeyUpdateFormConfig = createForm('api-keys')
  .title('Actualizar API Key')
  .schema(updateApiKeySchema)
  .defaultValues({
    name: '',
    description: '',
    expiresAt: '',
    rotationPolicy: 'manual' as const,
    accessLevel: 'read' as const,
    rateLimit: undefined,
    tags: [],
    isPrimary: false,
  })
  .fields(
    field.text('name')
      .label('Nombre')
      .placeholder('Nombre descriptivo para la API key')
      .required(false)
      .build(),

    field.textarea('description')
      .label('Descripción')
      .placeholder('Descripción opcional')
      .required(false)
      .build(),

    field.date('expiresAt')
      .label('Fecha de Expiración')
      .required(false)
      .build(),

    field.select('rotationPolicy')
      .label('Política de Rotación')
      .options([
        { value: 'manual', label: 'Manual' },
        { value: 'auto_30d', label: 'Automática (30 días)' },
        { value: 'auto_90d', label: 'Automática (90 días)' },
        { value: 'auto_1y', label: 'Automática (1 año)' },
      ])
      .required(false)
      .build(),

    field.select('accessLevel')
      .label('Nivel de Acceso')
      .options([
        { value: 'read', label: 'Lectura' },
        { value: 'write', label: 'Escritura' },
        { value: 'admin', label: 'Admin' },
        { value: 'full', label: 'Completo' },
      ])
      .required(false)
      .build(),

    field.number('rateLimit')
      .label('Límite de Tasa')
      .placeholder('requests/min (1-10000)')
      .min(1)
      .max(10000)
      .required(false)
      .build(),

    field.checkbox('isPrimary')
      .label('Es clave primaria')
      .required(false)
      .build()
  )
  .operations({
    // Operations will be provided by the component using the form
  })
  .layout({ columns: 2, responsive: true })
  .ui({
    submitButtonText: 'Actualizar API Key',
    modalSize: 'lg'
  })
  .build();

export const apiKeySearchFormConfig = createForm('api-keys')
  .title('Buscar API Keys')
  .schema(searchApiKeysSchema)
  .defaultValues({
    page: 1,
    limit: 20,
    service: undefined,
    environment: undefined,
    keyType: undefined,
    isActive: undefined,
    search: '',
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  })
  .fields(
    field.text('search')
      .label('Buscar')
      .placeholder('Nombre, descripción o servicio')
      .required(false)
      .build(),

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
      .build(),

    field.select('environment')
      .label('Ambiente')
      .options([
        { value: 'development', label: 'Desarrollo' },
        { value: 'staging', label: 'Staging' },
        { value: 'production', label: 'Producción' },
      ])
      .placeholder('Todos los ambientes')
      .required(false)
      .build(),

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
      .placeholder('Todos los tipos')
      .required(false)
      .build(),

    field.checkbox('isActive')
      .label('Solo claves activas')
      .required(false)
      .build(),

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
      .build(),

    field.select('sortOrder')
      .label('Orden')
      .options([
        { value: 'asc', label: 'Ascendente' },
        { value: 'desc', label: 'Descendente' },
      ])
      .required(false)
      .build(),

    field.number('limit')
      .label('Resultados por página')
      .min(1)
      .max(100)
      .required(false)
      .build()
  )
  .operations({
    // Operations will be provided by the component using the form
  })
  .layout({ columns: 2, responsive: true })
  .ui({
    submitButtonText: 'Buscar',
    modalSize: 'md'
  })
  .build();

export const apiKeyToggleFormConfig = createForm('api-keys')
  .title('Cambiar Estado de API Key')
  .schema(toggleApiKeySchema)
  .defaultValues({
    active: true,
  })
  .fields(
    field.checkbox('active')
      .label('Clave activa')
      .build()
  )
  .operations({
    // Operations will be provided by the component using the form
  })
  .ui({
    submitButtonText: 'Cambiar Estado',
    modalSize: 'sm'
  })
  .build();

export const apiKeyDeleteFormConfig = createForm('api-keys')
  .title('Eliminar API Key')
  .schema(z.object({})) // Schema vacío para eliminación
  .defaultValues({})
  .allowEmptyFields() // Permitir formulario sin campos para eliminación
  .fields() // Sin campos para eliminación
  .operations({
    // Operations will be provided by the component using the form
  })
  .ui({
    submitButtonText: 'Eliminar API Key',
    modalSize: 'sm'
  })
  .build();

export const createStandardKeysFormConfig = createForm('api-keys')
  .title('Crear Claves Estándar')
  .schema(createStandardKeysSchema)
  .defaultValues({
    services: [],
    environments: [],
    includeWebhooks: false,
    includePublic: false,
  })
  .fields(
    field.checkbox('includeWebhooks')
      .label('Incluir claves de webhooks')
      .build(),

    field.checkbox('includePublic')
      .label('Incluir claves públicas')
      .build()
  )
  .operations({
    // Operations will be provided by the component using the form
  })
  .ui({
    submitButtonText: 'Crear Claves Estándar',
    modalSize: 'md'
  })
  .build();
