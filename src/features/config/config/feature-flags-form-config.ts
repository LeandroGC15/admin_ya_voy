import { createForm, field, fieldPresets } from '@/components/forms';
import { z } from 'zod';

// Feature Flags schemas
const createFeatureFlagSchema = z.object({
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(100),
  key: z.string().min(3, 'Clave debe tener al menos 3 caracteres').max(50).regex(/^[a-z_]+$/, 'Solo letras minúsculas y guiones bajos'),
  description: z.string().optional(),
  category: z.enum(['payments', 'rides', 'admin', 'notifications', 'geography', 'pricing', 'system']),
  isEnabled: z.boolean().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  config: z.record(z.any()).optional(),
  userRoles: z.array(z.string()).optional(),
  userIds: z.array(z.string()).optional(),
  environments: z.array(z.string()).optional(),
});

const updateFeatureFlagSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  category: z.enum(['payments', 'rides', 'admin', 'notifications', 'geography', 'pricing', 'system']).optional(),
  isEnabled: z.boolean().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  config: z.record(z.any()).optional(),
  userRoles: z.array(z.string()).optional(),
  userIds: z.array(z.string()).optional(),
  environments: z.array(z.string()).optional(),
});

const searchFeatureFlagsSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  category: z.enum(['payments', 'rides', 'admin', 'notifications', 'geography', 'pricing', 'system']).optional(),
  isEnabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'category', 'rolloutPercentage', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const toggleFeatureFlagSchema = z.object({
  enabled: z.boolean(),
});

const evaluateFeatureFlagSchema = z.object({
  key: z.string().min(1, 'Clave requerida'),
  userId: z.string().optional(),
  userRole: z.string().optional(),
  environment: z.string().optional(),
  attributes: z.record(z.any()).optional(),
});

const createStandardFlagsSchema = z.object({
  categories: z.array(z.enum(['payments', 'rides', 'admin', 'notifications', 'geography', 'pricing', 'system'])),
  environments: z.array(z.string()).optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  includeAdminFlags: z.boolean().optional(),
  includeNotificationFlags: z.boolean().optional(),
});

// Form configurations
export const featureFlagCreationFormConfig = createForm('feature-flags')
  .title('Crear Nuevo Feature Flag')
  .schema(createFeatureFlagSchema)
  .defaultValues({
    name: '',
    key: '',
    description: '',
    category: 'system' as const,
    isEnabled: false,
    rolloutPercentage: 100,
    config: {},
    userRoles: [],
    userIds: [],
    environments: [],
  })
  .fields(
    field.text('name')
      .label('Nombre')
      .placeholder('Nombre descriptivo del feature flag')
      .required()
      .build(),

    field.text('key')
      .label('Clave')
      .placeholder('clave_unica_sin_espacios')
      .description('Solo letras minúsculas y guiones bajos')
      .required()
      .build(),

    field.textarea('description')
      .label('Descripción')
      .placeholder('Descripción del feature flag')
      .required(false)
      .build(),

    field.select('category')
      .label('Categoría')
      .options([
        { value: 'payments', label: 'Pagos' },
        { value: 'rides', label: 'Viajes' },
        { value: 'admin', label: 'Administración' },
        { value: 'notifications', label: 'Notificaciones' },
        { value: 'geography', label: 'Geografía' },
        { value: 'pricing', label: 'Precios' },
        { value: 'system', label: 'Sistema' },
      ])
      .required()
      .build(),

    field.checkbox('isEnabled')
      .label('Habilitado')
      .description('Si está marcado, el feature flag está activo')
      .required(false)
      .build(),

    field.number('rolloutPercentage')
      .label('Porcentaje de Rollout')
      .placeholder('0-100')
      .min(0)
      .max(100)
      .required(false)
      .build(),

    field.textarea('config')
      .label('Configuración JSON')
      .placeholder('{}')
      .description('Configuración adicional en formato JSON')
      .required(false)
      .build(),

    field.textarea('userRoles')
      .label('Roles de Usuario')
      .placeholder('admin,driver,passenger')
      .description('Roles separados por comas (opcional)')
      .required(false)
      .build(),

    field.textarea('userIds')
      .label('IDs de Usuario')
      .placeholder('user1,user2,user3')
      .description('IDs de usuario separados por comas (opcional)')
      .required(false)
      .build(),

    field.textarea('environments')
      .label('Ambientes')
      .placeholder('development,staging,production')
      .description('Ambientes separados por comas (opcional)')
      .required(false)
      .build()
  )
  .operations({
    // Operations will be provided by the component using the form
  })
  .layout({ columns: 2, responsive: true })
  .ui({
    submitButtonText: 'Crear Feature Flag',
    modalSize: 'lg'
  })
  .build();

export const featureFlagUpdateFormConfig = createForm('feature-flags')
  .title('Actualizar Feature Flag')
  .schema(updateFeatureFlagSchema)
  .defaultValues({
    name: '',
    description: '',
    category: 'system' as const,
    isEnabled: false,
    rolloutPercentage: 100,
    config: {},
    userRoles: [],
    userIds: [],
    environments: [],
  })
  .fields(
    field.text('name')
      .label('Nombre')
      .placeholder('Nombre descriptivo del feature flag')
      .required(false)
      .build(),

    field.textarea('description')
      .label('Descripción')
      .placeholder('Descripción del feature flag')
      .required(false)
      .build(),

    field.select('category')
      .label('Categoría')
      .options([
        { value: 'payments', label: 'Pagos' },
        { value: 'rides', label: 'Viajes' },
        { value: 'admin', label: 'Administración' },
        { value: 'notifications', label: 'Notificaciones' },
        { value: 'geography', label: 'Geografía' },
        { value: 'pricing', label: 'Precios' },
        { value: 'system', label: 'Sistema' },
      ])
      .required(false)
      .build(),

    field.checkbox('isEnabled')
      .label('Habilitado')
      .description('Si está marcado, el feature flag está activo')
      .required(false)
      .build(),

    field.number('rolloutPercentage')
      .label('Porcentaje de Rollout')
      .placeholder('0-100')
      .min(0)
      .max(100)
      .required(false)
      .build(),

    field.textarea('config')
      .label('Configuración JSON')
      .placeholder('{}')
      .description('Configuración adicional en formato JSON')
      .required(false)
      .build(),

    field.textarea('userRoles')
      .label('Roles de Usuario')
      .placeholder('admin,driver,passenger')
      .description('Roles separados por comas (opcional)')
      .required(false)
      .build(),

    field.textarea('userIds')
      .label('IDs de Usuario')
      .placeholder('user1,user2,user3')
      .description('IDs de usuario separados por comas (opcional)')
      .required(false)
      .build(),

    field.textarea('environments')
      .label('Ambientes')
      .placeholder('development,staging,production')
      .description('Ambientes separados por comas (opcional)')
      .required(false)
      .build()
  )
  .operations({
    // Operations will be provided by the component using the form
  })
  .layout({ columns: 2, responsive: true })
  .ui({
    submitButtonText: 'Actualizar Feature Flag',
    modalSize: 'lg'
  })
  .build();

export const featureFlagSearchFormConfig = createForm('feature-flags')
  .title('Buscar Feature Flags')
  .schema(searchFeatureFlagsSchema)
  .defaultValues({
    page: 1,
    limit: 20,
    category: undefined,
    isEnabled: undefined,
    isActive: undefined,
    search: '',
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  })
  .fields(
    field.text('search')
      .label('Buscar')
      .placeholder('Nombre, clave o descripción')
      .required(false)
      .build(),

    field.select('category')
      .label('Categoría')
      .options([
        { value: 'payments', label: 'Pagos' },
        { value: 'rides', label: 'Viajes' },
        { value: 'admin', label: 'Administración' },
        { value: 'notifications', label: 'Notificaciones' },
        { value: 'geography', label: 'Geografía' },
        { value: 'pricing', label: 'Precios' },
        { value: 'system', label: 'Sistema' },
      ])
      .placeholder('Todas las categorías')
      .required(false)
      .build(),

    field.checkbox('isEnabled')
      .label('Solo habilitados')
      .required(false)
      .build(),

    field.checkbox('isActive')
      .label('Solo activos')
      .required(false)
      .build(),

    field.select('sortBy')
      .label('Ordenar por')
      .options([
        { value: 'name', label: 'Nombre' },
        { value: 'category', label: 'Categoría' },
        { value: 'rolloutPercentage', label: 'Rollout' },
        { value: 'createdAt', label: 'Fecha de creación' },
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

export const featureFlagToggleFormConfig = createForm('feature-flags')
  .title('Cambiar Estado de Feature Flag')
  .schema(toggleFeatureFlagSchema)
  .defaultValues({
    enabled: false,
  })
  .fields(
    field.checkbox('enabled')
      .label('Feature flag habilitado')
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

export const featureFlagDeleteFormConfig = createForm('feature-flags')
  .title('Eliminar Feature Flag')
  .schema(z.object({})) // Schema vacío para eliminación
  .defaultValues({})
  .allowEmptyFields() // Permitir formulario sin campos para eliminación
  .fields() // Sin campos para eliminación
  .operations({
    // Operations will be provided by the component using the form
  })
  .ui({
    submitButtonText: 'Eliminar Feature Flag',
    modalSize: 'sm'
  })
  .build();

export const featureFlagEvaluateFormConfig = createForm('feature-flags')
  .title('Evaluar Feature Flag')
  .schema(evaluateFeatureFlagSchema)
  .defaultValues({
    key: '',
    userId: '',
    userRole: '',
    environment: '',
    attributes: {},
  })
  .fields(
    field.text('key')
      .label('Clave del Feature Flag')
      .placeholder('nombre_del_flag')
      .required()
      .build(),

    field.text('userId')
      .label('ID de Usuario')
      .placeholder('user123 (opcional)')
      .required(false)
      .build(),

    field.text('userRole')
      .label('Rol de Usuario')
      .placeholder('admin, driver, passenger (opcional)')
      .required(false)
      .build(),

    field.text('environment')
      .label('Ambiente')
      .placeholder('development, staging, production (opcional)')
      .required(false)
      .build(),

    field.textarea('attributes')
      .label('Atributos Adicionales')
      .placeholder('{"customAttribute": "value"}')
      .description('Atributos adicionales en formato JSON (opcional)')
      .required(false)
      .build()
  )
  .operations({
    // Operations will be provided by the component using the form
  })
  .ui({
    submitButtonText: 'Evaluar',
    modalSize: 'md'
  })
  .build();

export const createStandardFlagsFormConfig = createForm('feature-flags')
  .title('Crear Feature Flags Estándar')
  .schema(createStandardFlagsSchema)
  .defaultValues({
    categories: [],
    environments: [],
    rolloutPercentage: 100,
    includeAdminFlags: false,
    includeNotificationFlags: false,
  })
  .fields(
    field.number('rolloutPercentage')
      .label('Porcentaje de Rollout por Defecto')
      .placeholder('0-100')
      .min(0)
      .max(100)
      .required(false)
      .build(),

    field.checkbox('includeAdminFlags')
      .label('Incluir flags de administración')
      .build(),

    field.checkbox('includeNotificationFlags')
      .label('Incluir flags de notificaciones')
      .build()
  )
  .operations({
    // Operations will be provided by the component using the form
  })
  .ui({
    submitButtonText: 'Crear Flags Estándar',
    modalSize: 'md'
  })
  .build();
