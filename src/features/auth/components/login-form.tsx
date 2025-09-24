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
import { signIn, SignInResponse } from "next-auth/react";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, control, clearErrors } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });
const onSubmit = async (data: LoginFormData) => {
  setFormError(null);
  clearErrors();
  setIsLoading(true);

  try {
    console.log("Attempting login with:", data.email);

    const result: SignInResponse | undefined = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    console.log("Login result:", result);

    if (!result) throw new Error("No se recibió respuesta del proveedor de autenticación");
    if (result.error) throw new Error(result.error);

    // Redirige al dashboard manualmente
    router.push("/dashboard");

  } catch (error: unknown) {
    console.error("Login error:", error);
    const message = error instanceof Error ? error.message : "Ocurrió un error inesperado";
    setFormError(message);
    toast.error(message);
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

      {formError && (
        <div className="rounded-md bg-red-50 p-4 flex items-center space-x-3">
          <XCircle className="h-5 w-5 text-red-400" />
          <p className="text-sm font-medium text-red-800">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Correo electrónico</label>
          <Input
            id="email"
            type="email"
            placeholder="ejemplo@correo.com"
            disabled={isLoading}
            {...register("email")}
            className={cn(errors.email && "border-red-500")}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            {...register("password")}
            className={cn(errors.password && "border-red-500")}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <div className="flex items-center space-x-2">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field: { value, onChange } }) => (
              <>
                <Checkbox id="rememberMe" checked={value} onCheckedChange={onChange} />
                <label htmlFor="rememberMe" className="text-sm">Recordarme</label>
              </>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2 inline" /> : "Iniciar sesión"}
        </Button>

        <div className="pt-4 text-center text-sm">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className="text-primary underline">Regístrate</Link>
        </div>
      </form>
    </div>
  );
}
