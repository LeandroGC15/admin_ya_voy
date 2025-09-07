import * as React from "react";
import { useForm, FormProvider, UseFormProps, SubmitHandler, FieldValues, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType, z } from "zod";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type FormProps<TFormValues extends FieldValues, Schema> = {
  children: React.ReactNode;
  schema?: Schema;
  onSubmit: SubmitHandler<TFormValues>;
  className?: string;
  submitButtonText?: string;
  submitButtonProps?: ButtonProps;
  isLoading?: boolean;
};

export function Form<FormValues extends FieldValues, Schema extends ZodType>(
  {
    children,
    schema,
    onSubmit,
    className,
    submitButtonText = "Guardar",
    submitButtonProps = {},
    isLoading = false,
  }: FormProps<FormValues, Schema>
) {
  const methods = useForm<FormValues>({
    resolver: schema ? zodResolver(schema) : undefined,
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={cn("space-y-6", className)}
      >
        {children}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isLoading || !methods.formState.isValid}
            {...submitButtonProps}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

type FormFieldProps = {
  name: string;
  label?: React.ReactNode;
  description?: string;
  className?: string;
  children: React.ReactElement;
};

export function FormField({
  name,
  label,
  description,
  className,
  children,
}: FormFieldProps) {
  const { formState } = useFormContext();
  const fieldState = formState.errors[name];
  
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children}
      {fieldState?.message && (
        <p className="text-sm font-medium text-destructive">
          {fieldState.message as string}
        </p>
      )}
    </div>
  );
}

type FormErrorProps = {
  name: string;
  className?: string;
  asChild?: boolean;
};

export function FormError({ name, className }: FormErrorProps) {
  const { formState } = useFormContext();
  
  if (!formState.errors[name]) return null;
  
  return (
    <p className={cn("mt-1 text-sm text-destructive", className)}>
      {formState.errors[name]?.message as string}
    </p>
  );
}

// Re-export form components for easier imports
export {
  useFormContext,
  useFieldArray,
  useWatch,
  useController,
  Controller,
} from "react-hook-form";

export type { FieldError, UseFormReturn } from "react-hook-form";
