// Componentes base de formularios
export { Form, FormField, FormError, useFormContext as useFormContextBase } from './form';
export { FormInput } from './form-input';

// Componentes CRUD reutilizables
export { CrudModal } from './crud-modal';
export { CrudForm } from './crud-form';
export { CrudSearchForm } from './crud-search-form';
export { FieldRenderer } from './field-renderer';

// Re-exportar hooks y tipos
export { FormProvider, useFormManager, useFormContext, createFormConfig } from '../../hooks/use-form-manager';
export type {
  FormConfig,
  FieldConfig,
  FormOperations,
  FormState,
  FormContextValue,
  FormOperation,
  TData,
  TVariables,
} from '../../types/form-system';

// Re-exportar builders y helpers
export {
  field,
  createForm,
  fieldPresets,
  operationPresets,
  schemaHelpers,
} from '../../lib/form-config-builder';