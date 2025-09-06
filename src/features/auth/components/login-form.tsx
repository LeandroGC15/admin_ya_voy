"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField } from "@/components/forms";
import { loginSchema, type LoginFormData } from "@/features/auth/schemas/auth.schema";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { toast } from "sonner";
import Link from "next/link";

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success("Inicio de sesión exitoso");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Bienvenido de vuelta</h1>
        <p className="text-muted-foreground">Ingresa tus credenciales para continuar</p>
      </div>

      <Form<LoginFormData, typeof loginSchema>
        schema={loginSchema}
        onSubmit={onSubmit}
        className="space-y-4"
        isLoading={isLoading}
        submitButtonText="Iniciar sesión"
        submitButtonProps={{
          className: "w-full",
        }}
      >
        <FormField
          name="email"
          label="Correo electrónico"
          className="space-y-2"
        >
          <Input
            {...form.register('email')}
            type="email"
            placeholder="ejemplo@correo.com"
            autoComplete="username"
            disabled={isLoading}
          />
        </FormField>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Contraseña</label>
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            {...form.register('password')}
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="rememberMe"
            {...form.register('rememberMe')}
            disabled={isLoading}
          />
          <label
            htmlFor="rememberMe"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Recordarme
          </label>
        </div>

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
