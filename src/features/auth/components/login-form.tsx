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
import { loginAdmin } from "../services/auth.service";
import { signIn, getSession } from "next-auth/react";

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
      
      console.log('Attempting login with:', { email: data.email });
      
      const response = await loginAdmin({
        email: data.email,
        password: data.password
      });

      console.log('Login response in component:', response);

      if (!response) {
        throw new Error('No response from server');
      }

      // Check if response has the expected structure
      if (response.accessToken) {
        console.log('Login successful, saving auth data...');
        const authData = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken || '',
          admin: response.admin || null,
          expiresIn: response.expiresIn || 3600,
          timestamp: new Date().getTime()
        };
        
        console.log('Auth data to save:', authData);
        
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('auth', JSON.stringify(authData));
            console.log('Auth data saved to localStorage');
            
            // Force a hard redirect to ensure state is properly reset
            window.location.href = '/dashboard';
            return;
          } catch (storageError) {
            console.error('Error saving to localStorage:', storageError);
            throw new Error('Error saving authentication data');
          }
        } else {
          console.warn('Window is not available, cannot save to localStorage');
          throw new Error('Browser environment required');
        }
      } else {
        console.warn('No access token in response:', response);
        throw new Error('Invalid response from server');
      }
      
    
    } catch (error) {
      console.error('Error during login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado';
      setFormError(errorMessage);
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
