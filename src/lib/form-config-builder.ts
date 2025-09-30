import { ZodType, z } from 'zod';
import {
  FormConfig,
  FieldConfig,
  FieldType,
  FormOperations,
  BaseFieldConfig,
  SelectFieldConfig,
  NumberFieldConfig,
} from '@/types/form-system';

// Builder para crear campos de formulario de manera fluida
export class FieldBuilder {
  private config: Partial<FieldConfig>;

  constructor(name: string, type: FieldType = 'text') {
    this.config = { name, type };
  }

  // Condiciones para mostrar/ocultar campos
  showWhen(condition: { field: string; value: any; operator?: 'equals' | 'not_equals' | 'includes' | 'not_includes' | 'greater_than' | 'less_than' }): this {
    this.config.condition = condition;
    return this;
  }

  // Función personalizada para mostrar/ocultar
  showWhenFn(showWhen: (formValues: any) => boolean): this {
    this.config.showWhen = showWhen;
    return this;
  }

  label(label: string): this {
    this.config.label = label;
    return this;
  }

  placeholder(placeholder: string): this {
    this.config.placeholder = placeholder;
    return this;
  }

  description(description: string): this {
    this.config.description = description;
    return this;
  }

  required(required = true): this {
    this.config.required = required;
    return this;
  }

  disabled(disabled = true): this {
    this.config.disabled = disabled;
    return this;
  }

  hidden(hidden = true): this {
    this.config.hidden = hidden;
    return this;
  }

  className(className: string): this {
    this.config.className = className;
    return this;
  }

  containerClassName(containerClassName: string): this {
    this.config.containerClassName = containerClassName;
    return this;
  }

  // Métodos específicos para select
  options(options: Array<{ value: string | number; label: string; disabled?: boolean }>): this {
    (this.config as SelectFieldConfig).options = options;
    return this;
  }

  multiple(multiple = true): this {
    (this.config as SelectFieldConfig).multiple = multiple;
    return this;
  }

  searchable(searchable = true): this {
    (this.config as SelectFieldConfig).searchable = searchable;
    return this;
  }

  // Métodos específicos para number
  min(min: number): this {
    (this.config as NumberFieldConfig).min = min;
    return this;
  }

  max(max: number): this {
    (this.config as NumberFieldConfig).max = max;
    return this;
  }

  step(step: number): this {
    (this.config as NumberFieldConfig).step = step;
    return this;
  }

  build(): FieldConfig {
    return this.config as FieldConfig;
  }
}

// Funciones helper para crear campos comunes
export const field = {
  text: (name: string) => new FieldBuilder(name, 'text'),
  email: (name: string) => new FieldBuilder(name, 'email'),
  password: (name: string) => new FieldBuilder(name, 'password'),
  number: (name: string) => new FieldBuilder(name, 'number'),
  tel: (name: string) => new FieldBuilder(name, 'tel'),
  textarea: (name: string) => new FieldBuilder(name, 'textarea'),
  select: (name: string) => new FieldBuilder(name, 'select'),
  checkbox: (name: string) => new FieldBuilder(name, 'checkbox'),
  radio: (name: string) => new FieldBuilder(name, 'radio'),
  date: (name: string) => new FieldBuilder(name, 'date'),
  datetime: (name: string) => new FieldBuilder(name, 'datetime-local'),
  file: (name: string) => new FieldBuilder(name, 'file'),
  hidden: (name: string) => new FieldBuilder(name, 'hidden'),
};

// Builder para crear configuraciones de formulario completas
export class FormConfigBuilder<T extends Record<string, any> = any, TData = any, TVariables = any> {
  private config: Partial<FormConfig<T, TData, TVariables>>;

  constructor(id: string) {
    this.config = {
      id,
      fields: [],
      layout: { columns: 1, gap: '1rem', responsive: true },
      validation: { mode: 'onChange', reValidateMode: 'onChange' },
      ui: {
        submitButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        modalSize: 'md',
        showCloseButton: true,
      },
    };
  }

  title(title: string): this {
    this.config.title = title;
    return this;
  }

  description(description: string): this {
    this.config.description = description;
    return this;
  }

  schema(schema: ZodType<T>): this {
    this.config.schema = schema;
    return this;
  }

  defaultValues(defaultValues: T): this {
    this.config.defaultValues = defaultValues;
    return this;
  }

  fields(...fields: (FieldConfig<T> | FieldBuilder)[]): this {
    this.config.fields = fields.map(field =>
      field instanceof FieldBuilder ? field.build() : field
    );
    return this;
  }

  addField(field: FieldConfig<T> | FieldBuilder): this {
    if (!this.config.fields) this.config.fields = [];
    const builtField = field instanceof FieldBuilder ? field.build() : field;
    this.config.fields.push(builtField);
    return this;
  }

  operations(operations: FormOperations<TData, TVariables>): this {
    this.config.operations = operations;
    return this;
  }

  layout(layout: { columns?: number; gap?: string; responsive?: boolean }): this {
    this.config.layout = { ...this.config.layout, ...layout };
    return this;
  }

  validation(validation: { mode?: 'onChange' | 'onBlur' | 'onSubmit'; reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit' }): this {
    this.config.validation = { ...this.config.validation, ...validation };
    return this;
  }

  ui(ui: {
    submitButtonText?: string;
    cancelButtonText?: string;
    showCancelButton?: boolean;
    modalSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
  }): this {
    this.config.ui = { ...this.config.ui, ...ui };
    return this;
  }

  persistence(persistence: {
    enabled?: boolean;
    key?: string;
    debounceMs?: number;
    excludeFields?: string[];
  }): this {
    this.config.persistence = persistence;
    return this;
  }

  // Método helper para habilitar persistencia con configuración por defecto
  enablePersistence(key?: string, debounceMs = 1000): this {
    this.config.persistence = {
      enabled: true,
      key: key || this.config.id,
      debounceMs,
      excludeFields: [],
    };
    return this;
  }

  // Allow forms without fields (useful for delete confirmations)
  allowEmptyFields(): this {
    this.config.allowEmptyFields = true;
    return this;
  }

  build(): FormConfig<T, TData, TVariables> {
    if (!this.config.schema) {
      throw new Error('Schema is required for form configuration');
    }
    if (!this.config.defaultValues) {
      throw new Error('Default values are required for form configuration');
    }
    if (!this.config.allowEmptyFields && (!this.config.fields || this.config.fields.length === 0)) {
      throw new Error('At least one field is required for form configuration');
    }

    return this.config as FormConfig<T, TData, TVariables>;
  }
}

// Función helper para crear configuraciones de formulario
export function createForm<T extends Record<string, any> = any, TData = any, TVariables = any>(id: string) {
  return new FormConfigBuilder<T, TData, TVariables>(id);
}

// Presets comunes para campos
export const fieldPresets = {
  // Campos de identificación
  id: () => field.number('id').hidden(),
  uuid: () => field.text('id').hidden(),

  // Campos de persona
  firstName: () => field.text('firstName').label('Nombre').placeholder('Ingrese el nombre').required(),
  lastName: () => field.text('lastName').label('Apellido').placeholder('Ingrese el apellido').required(),
  fullName: () => field.text('fullName').label('Nombre Completo').placeholder('Ingrese nombre completo').required(),
  email: () => field.email('email').label('Correo Electrónico').placeholder('correo@ejemplo.com').required(),
  phone: () => field.tel('phoneNumber').label('Teléfono').placeholder('+1234567890').required(),
  birthDate: () => field.date('birthDate').label('Fecha de Nacimiento'),

  // Campos de dirección
  address: () => field.text('address').label('Dirección').placeholder('Calle, número, ciudad'),
  city: () => field.text('city').label('Ciudad').placeholder('Ciudad'),
  state: () => field.text('state').label('Estado/Provincia').placeholder('Estado'),
  zipCode: () => field.text('zipCode').label('Código Postal').placeholder('12345'),
  country: () => field.select('country').label('País').options([
    { value: 'MX', label: 'México' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'CA', label: 'Canadá' },
    { value: 'ES', label: 'España' },
  ]),

  // Campos de vehículo
  licensePlate: () => field.text('licensePlate').label('Placa').placeholder('ABC-123').required(),
  carModel: () => field.text('carModel').label('Modelo del Vehículo').placeholder('Toyota Corolla').required(),
  carYear: () => field.number('carYear').label('Año').min(1900).max(new Date().getFullYear() + 1),
  carSeats: () => field.number('carSeats').label('Número de Asientos').min(1).max(8).required(),

  // Campos de estado
  status: () => field.select('status').label('Estado').options([
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'suspended', label: 'Suspendido' },
  ]).required(),

  isActive: () => field.checkbox('isActive').label('Activo'),

  // Campos de auditoría
  createdAt: () => field.datetime('createdAt').label('Fecha de Creación').disabled(),
  updatedAt: () => field.datetime('updatedAt').label('Última Modificación').disabled(),

  // Campos de búsqueda
  search: () => field.text('search').label('Buscar').placeholder('Ingrese término de búsqueda'),
  dateFrom: () => field.date('dateFrom').label('Desde'),
  dateTo: () => field.date('dateTo').label('Hasta'),
};

// Presets para operaciones comunes
export const operationPresets = {
  standardCrud: <TData = any, TVariables = any>() => ({
    create: {} as any, // Se reemplaza con la mutación real
    update: {} as any,
    delete: {} as any,
  }),

  readOnly: <TData = any>() => ({
    getById: {} as any,
  }),

  searchOnly: <TData = any>() => ({
    search: {} as any,
  }),
};

// Función helper para crear schemas básicos de Zod
export const schemaHelpers = {
  // Schema base para entidades con ID
  withId: <T extends Record<string, any>>(baseSchema: z.ZodObject<any>) =>
    baseSchema.extend({
      id: z.union([z.string(), z.number()]).optional(),
    }),

  // Schema con timestamps
  withTimestamps: <T extends Record<string, any>>(baseSchema: z.ZodObject<any>) =>
    baseSchema.extend({
      createdAt: z.string().datetime().optional(),
      updatedAt: z.string().datetime().optional(),
    }),

  // Schema con estado activo
  withActiveStatus: <T extends Record<string, any>>(baseSchema: z.ZodObject<any>) =>
    baseSchema.extend({
      isActive: z.boolean().default(true),
    }),

  // Schema para búsqueda básica
  searchBase: z.object({
    search: z.string().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};
