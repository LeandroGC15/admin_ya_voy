"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { loginSchema, type LoginFormData } from "@/features/auth/schemas/auth.schema";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { loginAdmin } from "../services/auth.service";
import { ApiError } from "@/lib/api/api-client";

// Simple form components to match shadcn/ui pattern
const Form = ({ children, onSubmit, className }: { 
  children: React.ReactNode; 
  onSubmit: (e: React.FormEvent) => void; 
  className?: string 
}) => (
  <form onSubmit={onSubmit} className={className}>
    {children}
  </form>
);

const FormItem = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("space-y-2", className)}>
    {children}
  </div>
);

const FormLabel = ({ 
  children, 
  className = "", 
  htmlFor 
}: { 
  children: React.ReactNode; 
  className?: string; 
  htmlFor?: string 
}) => (
  <label 
    htmlFor={htmlFor} 
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", 
      className
    )}
  >
    {children}
  </label>
);

const FormControl = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-1">
    {children}
  </div>
);

const FormMessage = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => (
  <p className={cn("text-sm font-medium text-destructive mt-1", className)}>
    {children}
  </p>
);

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    control,
    setError,
    clearErrors
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema) as any, // Type assertion to fix the resolver type
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Clear previous errors
      setFormError(null);
      clearErrors();
      setIsLoading(true);
      
      // Attempt to log in
      const authResponse = await loginAdmin({
        email: data.email,
        password: data.password,
      });

      // Save auth data to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth', JSON.stringify({
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
          admin: authResponse.admin,
          expiresIn: authResponse.expiresIn,
          timestamp: new Date().getTime()
        }));
      }

      // If login is successful, redirect to dashboard
      router.push('/dashboard');
      
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión';
      let field: keyof LoginFormData | null = null;
      
      // Handle different error response formats
      const statusCode = error.response?.data?.statusCode || error?.statusCode || error?.response?.status;
      const message = error?.response?.data?.message || error?.message || errorMessage;
      
      if (statusCode) {
        // Handle API errors with status codes
        errorMessage = message;
        
        // Map status codes to user-friendly messages
        if (statusCode === 401) {
          errorMessage = 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.';
          field = 'password';
        } else if (statusCode === 403) {
          errorMessage = 'No tienes permiso para acceder a esta cuenta.';
        } else if (statusCode === 429) {
          errorMessage = 'Demasiados intentos. Por favor, inténtalo de nuevo más tarde.';
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        // Handle other Error objects
        errorMessage = String(error.message);
      } else {
        errorMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      }
      
      // Set form error
      setFormError(errorMessage);
      
      // Set field-specific errors if applicable
      if (field) {
        setError(field, {
          type: 'manual',
          message: errorMessage
        });
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bienvenido de vuelta</h1>
        <p className="text-muted-foreground">Ingresa tus credenciales para continuar</p>
      </div>
      
      {/* Form Error Message */}
      {formError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{formError}</h3>
            </div>
          </div>
        </div>
      )}

      <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormItem>
          <FormLabel htmlFor="email">Correo electrónico</FormLabel>
          <FormControl>
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              autoComplete="username"
              disabled={isLoading}
              {...register('email')}
              className={cn(
                "py-3 px-4 text-base border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200 w-full",
                errors.email && "border-red-500 focus:border-red-500 focus:ring-red-200"
              )}
            />
          </FormControl>
          <FormMessage>{errors.email?.message}</FormMessage>
        </FormItem>

        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel htmlFor="password">Contraseña</FormLabel>
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <FormControl>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
              {...register('password')}
              className={cn(
                "py-3 px-4 text-base border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200 w-full",
                errors.password && "border-red-500 focus:border-red-500 focus:ring-red-200"
              )}
            />
          </FormControl>
          <FormMessage>{errors.password?.message}</FormMessage>
        </FormItem>

        <FormItem className="flex items-center space-x-2 pt-2">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <Checkbox
                  id="rememberMe"
                  checked={value as boolean}
                  onCheckedChange={onChange}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary/50"
                />
                <FormLabel htmlFor="rememberMe" className="!mt-0 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Recordarme
                </FormLabel>
              </>
            )}
          />
        </FormItem>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 text-base font-medium bg-primary hover:bg-primary/90 transition-colors duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </Button>

        <div className="pt-4 text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Regístrate
          </Link>
        </div>
      </Form>
    </div>
  );
}
