import { z } from 'zod';

export const driverFormSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Ingrese un correo electrónico válido'),
  phoneNumber: z.string().min(8, 'Ingrese un número de teléfono válido'),
  carModel: z.string().min(2, 'Ingrese el modelo del vehículo'),
  licensePlate: z.string().min(4, 'Ingrese una placa válida'),
  carSeats: z.coerce
    .number()
    .int('Debe ser un número entero')
    .min(1, 'Debe tener al menos 1 asiento')
    .max(8, 'Máximo 8 asientos permitidos'),
});

export type DriverFormValues = z.infer<typeof driverFormSchema>;
