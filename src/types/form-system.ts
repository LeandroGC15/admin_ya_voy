import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { ZodType } from 'zod';

// Tipos base para campos de formulario
export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'datetime-local'
  | 'file'
  | 'hidden';

// Configuración base para un campo
export interface BaseFieldConfig<T extends FieldValues = FieldValues> {
  name: Path<T>;
  type: FieldType;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
  containerClassName?: string;
  // Condiciones para mostrar/ocultar el campo
  condition?: {
    field: Path<T>;
    value: unknown;
    operator?: 'equals' | 'not_equals' | 'includes' | 'not_includes' | 'greater_than' | 'less_than';
  };
  // Función personalizada para determinar si mostrar el campo
  showWhen?: (formValues: T) => boolean;
}

// Configuración específica para campos de tipo select
export interface SelectFieldConfig<T extends FieldValues = FieldValues> extends BaseFieldConfig<T> {
  type: 'select';
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  multiple?: boolean;
  searchable?: boolean;
}

// Configuración específica para campos de tipo checkbox/radio
export interface ChoiceFieldConfig<T extends FieldValues = any> extends BaseFieldConfig<T> {
  type: 'checkbox' | 'radio';
  options: Array<{ value: string | number | boolean; label: string; disabled?: boolean }>;
}

// Configuración específica para campos de tipo file
export interface FileFieldConfig<T extends FieldValues = any> extends BaseFieldConfig<T> {
  type: 'file';
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // en bytes
}

// Configuración específica para campos numéricos
export interface NumberFieldConfig<T extends FieldValues = any> extends BaseFieldConfig<T> {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}

// Unión de todas las configuraciones de campos
export type FieldConfig<T extends FieldValues = any> =
  | BaseFieldConfig<T>
  | SelectFieldConfig<T>
  | ChoiceFieldConfig<T>
  | FileFieldConfig<T>
  | NumberFieldConfig<T>;

// Estados de operación del formulario
export type FormOperation = 'create' | 'update' | 'delete' | 'search' | 'view';

// Configuración de operaciones disponibles
export interface FormOperations<TData = any, TVariables = any> {
  create?: UseMutationResult<TData, Error, TVariables>;
  update?: UseMutationResult<TData, Error, TVariables>;
  delete?: UseMutationResult<TData, Error, TVariables>;
  search?: UseQueryResult<TData[], Error>;
  getById?: UseQueryResult<TData, Error>;
}

// Configuración principal del formulario
export interface FormConfig<T extends FieldValues = any, TData = any, TVariables = any> {
  id: string;
  title: string;
  description?: string;
  schema: ZodType<T>;
  defaultValues: T;
  fields: FieldConfig<T>[];
  operations: FormOperations<TData, TVariables>;
  allowEmptyFields?: boolean; // Permite formularios sin campos (útil para confirmaciones de eliminación)
  layout?: {
    columns?: number;
    gap?: string;
    responsive?: boolean;
  };
  validation?: {
    mode?: 'onChange' | 'onBlur' | 'onSubmit';
    reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
  };
  ui?: {
    submitButtonText?: string;
    cancelButtonText?: string;
    showCancelButton?: boolean;
    modalSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
  };
  persistence?: {
    enabled?: boolean;
    key?: string; // Si no se especifica, usa el id del formulario
    debounceMs?: number;
    excludeFields?: string[];
  };
}

// Estado interno del formulario
export interface FormState<T extends FieldValues = any, TData = any> {
  operation: FormOperation;
  isOpen: boolean;
  isSubmitting: boolean;
  selectedItem?: TData;
  searchFilters?: Partial<T>;
  currentData?: T;
}

// Contexto del formulario para el provider
export interface FormContextValue<T extends FieldValues = any, TData = any, TVariables = any> {
  config: FormConfig<T, TData, TVariables>;
  state: FormState<T>;
  form: UseFormReturn<T>;
  // Acciones
  openCreate: (initialData?: Partial<T>) => void;
  openUpdate: (item: TData, data?: Partial<T>) => void;
  openDelete: (item: TData) => void;
  openSearch: (filters?: Partial<T>) => void;
  openView: (item: TData) => void;
  close: () => void;
  submit: () => Promise<void>;
  reset: (clearDraft?: boolean) => void;
  setSearchFilters: (filters: Partial<T>) => void;
  // Draft persistence
  draft?: {
    save: (data: Partial<T>) => void;
    load: () => Partial<T> | null;
    clear: () => void;
    has: () => boolean;
  };
}

// Props para componentes que usan el contexto
export interface FormComponentProps<T extends FieldValues = any, TData = any, TVariables = any> {
  config: FormConfig<T, TData, TVariables>;
  children?: React.ReactNode;
}

// Tipo genérico para datos (puede ser cualquier entidad)
export type TData = Record<string, any>;

// Tipo genérico para variables de mutación
export type TVariables = Record<string, any>;

// Utilidades para TypeScript
export type InferFormValues<T extends FormConfig> = T extends FormConfig<infer U> ? U : never;
export type InferFormData<T extends FormConfig> = T extends FormConfig<any, infer U> ? U : never;
export type InferFormVariables<T extends FormConfig> = T extends FormConfig<any, any, infer U> ? U : never;
