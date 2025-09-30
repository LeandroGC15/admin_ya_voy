'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import { useFormContext } from '@/hooks/use-form-manager';
import { FieldConfig, FormComponentProps } from '@/types/form-system';
import { FormInput } from '@/components/forms/form-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface FieldRendererProps<T extends Record<string, any> = any> extends FormComponentProps<T> {
  field: FieldConfig<T>;
  className?: string;
}

// Función helper para evaluar condiciones
function evaluateCondition<T extends Record<string, any>>(
  condition: NonNullable<FieldConfig<T>['condition']>,
  formValues: T
): boolean {
  const fieldValue = formValues[condition.field as keyof T];
  const targetValue = condition.value;

  switch (condition.operator || 'equals') {
    case 'equals':
      return fieldValue === targetValue;
    case 'not_equals':
      return fieldValue !== targetValue;
    case 'includes':
      return Array.isArray(fieldValue) ? fieldValue.includes(targetValue) : false;
    case 'not_includes':
      return Array.isArray(fieldValue) ? !fieldValue.includes(targetValue) : true;
    case 'greater_than':
      return Number(fieldValue) > Number(targetValue);
    case 'less_than':
      return Number(fieldValue) < Number(targetValue);
    default:
      return false;
  }
}

export function FieldRenderer<T extends Record<string, any> = any>({
  field,
  className,
}: FieldRendererProps<T>) {
  const { form, state } = useFormContext<T>();
  const { control, formState: { errors }, watch } = form;

  // Observar todos los valores del formulario para condiciones
  const formValues = watch();

  const fieldError = errors[field.name];
  const isDisabled = field.disabled || state.operation === 'view' || state.isSubmitting;

  // Evaluar si el campo debe mostrarse
  const shouldShow = React.useMemo(() => {
    if (field.hidden) return false;

    // Si tiene condición personalizada
    if (field.showWhen) {
      return field.showWhen(formValues);
    }

    // Si tiene condición simple
    if (field.condition) {
      return evaluateCondition(field.condition, formValues);
    }

    // Por defecto, mostrar el campo
    return true;
  }, [field, formValues]);

  if (!shouldShow) return null;

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'tel':
      case 'date':
      case 'datetime-local':
      case 'number':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <FormInput
                {...controllerField}
                type={field.type === 'number' ? 'number' : field.type}
                label={field.label}
                placeholder={field.placeholder}
                description={field.description}
                error={fieldError?.message as string}
                disabled={isDisabled}
                showPasswordToggle={field.type === 'password'}
                min={field.type === 'number' ? (field as any).min : undefined}
                max={field.type === 'number' ? (field as any).max : undefined}
                step={field.type === 'number' ? (field as any).step : undefined}
                containerClassName={field.containerClassName}
                className={cn(field.className)}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <div className={cn('space-y-2', field.containerClassName)}>
                {field.label && (
                  <Label htmlFor={controllerField.name}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                )}
                {field.description && (
                  <p className="text-sm text-muted-foreground">{field.description}</p>
                )}
                <Textarea
                  {...controllerField}
                  id={controllerField.name}
                  placeholder={field.placeholder}
                  disabled={isDisabled}
                  className={cn(
                    'resize-none',
                    field.className,
                    fieldError && 'border-red-500 focus-visible:ring-red-500'
                  )}
                  rows={4}
                />
                {fieldError && (
                  <p className="text-sm font-medium text-red-500">
                    {fieldError.message as string}
                  </p>
                )}
              </div>
            )}
          />
        );

      case 'select':
        const selectField = field as any;
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <div className={cn('space-y-2', field.containerClassName)}>
                {field.label && (
                  <Label htmlFor={controllerField.name}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                )}
                {field.description && (
                  <p className="text-sm text-muted-foreground">{field.description}</p>
                )}
                <Select
                  value={controllerField.value?.toString()}
                  onValueChange={controllerField.onChange}
                  disabled={isDisabled}
                >
                  <SelectTrigger className={cn(field.className, fieldError && 'border-red-500')}>
                    <SelectValue placeholder={field.placeholder || 'Seleccionar...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectField.options?.map((option: any) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError && (
                  <p className="text-sm font-medium text-red-500">
                    {fieldError.message as string}
                  </p>
                )}
              </div>
            )}
          />
        );

      case 'checkbox':
        const checkboxField = field as any;
        if (checkboxField.options && checkboxField.options.length > 0) {
          // Multiple checkboxes
          return (
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <div className={cn('space-y-2', field.containerClassName)}>
                  {field.label && (
                    <Label>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                  )}
                  {field.description && (
                    <p className="text-sm text-muted-foreground">{field.description}</p>
                  )}
                  <div className="space-y-2">
                    {checkboxField.options.map((option: any) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${controllerField.name}-${option.value}`}
                          checked={Array.isArray(controllerField.value)
                            ? controllerField.value.includes(option.value)
                            : false}
                          onCheckedChange={(checked) => {
                            const currentValue = Array.isArray(controllerField.value)
                              ? controllerField.value
                              : [];
                            if (checked) {
                              controllerField.onChange([...currentValue, option.value]);
                            } else {
                              controllerField.onChange(currentValue.filter(v => v !== option.value));
                            }
                          }}
                          disabled={isDisabled || option.disabled}
                        />
                        <Label
                          htmlFor={`${controllerField.name}-${option.value}`}
                          className="text-sm font-normal"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {fieldError && (
                    <p className="text-sm font-medium text-red-500">
                      {fieldError.message as string}
                    </p>
                  )}
                </div>
              )}
            />
          );
        } else {
          // Single checkbox
          return (
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <div className={cn('flex items-center space-x-2', field.containerClassName)}>
                  <Checkbox
                    id={controllerField.name}
                    checked={controllerField.value || false}
                    onCheckedChange={controllerField.onChange}
                    disabled={isDisabled}
                  />
                  <Label htmlFor={controllerField.name} className="text-sm font-normal">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {field.description && (
                    <p className="text-sm text-muted-foreground ml-2">{field.description}</p>
                  )}
                  {fieldError && (
                    <p className="text-sm font-medium text-red-500">
                      {fieldError.message as string}
                    </p>
                  )}
                </div>
              )}
            />
          );
        }

      case 'radio':
        const radioField = field as any;
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <div className={cn('space-y-2', field.containerClassName)}>
                {field.label && (
                  <Label>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                )}
                {field.description && (
                  <p className="text-sm text-muted-foreground">{field.description}</p>
                )}
                <div className="space-y-2">
                  {radioField.options?.map((option: any) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`${controllerField.name}-${option.value}`}
                        name={controllerField.name}
                        value={option.value}
                        checked={controllerField.value === option.value}
                        onChange={() => controllerField.onChange(option.value)}
                        disabled={isDisabled || option.disabled}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <Label
                        htmlFor={`${controllerField.name}-${option.value}`}
                        className="text-sm font-normal"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {fieldError && (
                  <p className="text-sm font-medium text-red-500">
                    {fieldError.message as string}
                  </p>
                )}
              </div>
            )}
          />
        );

      case 'file':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <div className={cn('space-y-2', field.containerClassName)}>
                {field.label && (
                  <Label htmlFor={controllerField.name}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                )}
                {field.description && (
                  <p className="text-sm text-muted-foreground">{field.description}</p>
                )}
                <input
                  type="file"
                  id={controllerField.name}
                  onChange={(e) => controllerField.onChange(e.target.files)}
                  disabled={isDisabled}
                  accept={(field as any).accept}
                  multiple={(field as any).multiple}
                  className={cn(
                    'block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90',
                    field.className,
                    fieldError && 'file:border-red-500'
                  )}
                />
                {fieldError && (
                  <p className="text-sm font-medium text-red-500">
                    {fieldError.message as string}
                  </p>
                )}
              </div>
            )}
          />
        );

      case 'hidden':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <input
                type="hidden"
                {...controllerField}
                value={controllerField.value || ''}
              />
            )}
          />
        );

      default:
        return (
          <div className="text-red-500 text-sm">
            Tipo de campo no soportado: {(field as any).type}
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {renderField()}
    </div>
  );
}

export default FieldRenderer;
