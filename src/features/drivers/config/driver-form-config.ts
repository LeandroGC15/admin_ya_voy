import { z } from 'zod';
import { createForm, field, fieldPresets } from '@/components/forms';
import { driverFormSchema } from '../schemas/driver.schema';
import { DriverFormValues } from '../schemas/driver.schema';
import { useCreateDriver, useDeleteDriver, useDrivers, useUpdateDriverStatus } from '../hooks/use-drivers';

// Función para crear la configuración del formulario de registro/creación de drivers
export function createDriverCreateFormConfig() {
  return createForm<DriverFormValues>('drivers')
    .title('Registrar Nuevo Conductor')
    .description('Complete la información del conductor y su vehículo')
    .schema(driverFormSchema)
    .defaultValues({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      carModel: '',
      licensePlate: '',
      carSeats: 4,
    })
    .fields(
      fieldPresets.firstName(),
      fieldPresets.lastName(),
      fieldPresets.email().description('Correo electrónico único del conductor'),
      fieldPresets.phone().label('Número de Teléfono').description('Número de teléfono válido'),
      field.text('carModel').label('Modelo del Vehículo').placeholder('Ej: Toyota Corolla').required(),
      field.text('licensePlate').label('Placa').placeholder('ABC-123').required()
        .description('Placa del vehículo sin espacios'),
      fieldPresets.carSeats().description('Número de asientos disponibles'),
    )
    .operations({
      create: useCreateDriver(),
    })
    .layout({ columns: 2, responsive: true })
    .ui({
      submitButtonText: 'Registrar Conductor',
      modalSize: 'lg',
    })
    .build();
}

// Función para crear la configuración del formulario de búsqueda de drivers
export function createDriverSearchFormConfig() {
  return createForm('driver-search')
    .title('Buscar Conductores')
    .description('Filtre los conductores por diferentes criterios')
    .schema(driverFormSchema.partial()) // Todos los campos opcionales para búsqueda
    .defaultValues({})
    .fields(
      field.text('firstName').label('Nombre').placeholder('Buscar por nombre'),
      field.text('lastName').label('Apellido').placeholder('Buscar por apellido'),
      field.email('email').label('Correo').placeholder('Buscar por email'),
      field.text('licensePlate').label('Placa').placeholder('Buscar por placa'),
      field.text('carModel').label('Modelo').placeholder('Buscar por modelo'),
      field.select('status').label('Estado').placeholder('Todos los estados')
        .options([
          { value: 'active', label: 'Activo' },
          { value: 'inactive', label: 'Inactivo' },
          { value: 'pending', label: 'Pendiente' },
          { value: 'suspended', label: 'Suspendido' },
        ]),
    )
    .operations({})
    .layout({ columns: 3, responsive: true })
    .ui({
      submitButtonText: 'Buscar',
      showCancelButton: false,
    })
    .build();
}

// Función para crear la configuración del formulario de eliminación de drivers
export function createDriverDeleteFormConfig() {
  return createForm<{ driverId: string }>('driver-delete')
    .title('Eliminar Conductor')
    .description('¿Está seguro de que desea eliminar este conductor? Esta acción no se puede deshacer.')
    .schema(z.object({
      driverId: z.string().min(1, 'ID del conductor es requerido'),
    }))
    .defaultValues({
      driverId: '',
    })
    .fields(
      field.text('driverId').label('ID del Conductor').placeholder('Ingrese el ID').required()
        .description('ID único del conductor a eliminar'),
    )
    .operations({
      delete: useDeleteDriver(),
    })
    .layout({ columns: 1 })
    .ui({
      submitButtonText: 'Eliminar Conductor',
      cancelButtonText: 'Cancelar',
      modalSize: 'sm',
    })
    .build();
}

// Función para crear la configuración del formulario de actualización de drivers
export function createDriverUpdateFormConfig() {
  return createForm<DriverFormValues>('driver-update')
    .title('Actualizar Conductor')
    .description('Modifique la información del conductor')
    .schema(driverFormSchema)
    .defaultValues({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      carModel: '',
      licensePlate: '',
      carSeats: 4,
    })
    .fields(
      fieldPresets.firstName(),
      fieldPresets.lastName(),
      fieldPresets.email().description('Correo electrónico único del conductor'),
      fieldPresets.phone().label('Número de Teléfono').description('Número de teléfono válido'),
      field.text('carModel').label('Modelo del Vehículo').placeholder('Ej: Toyota Corolla').required(),
      field.text('licensePlate').label('Placa').placeholder('ABC-123').required()
        .description('Placa del vehículo sin espacios'),
      fieldPresets.carSeats().description('Número de asientos disponibles'),
    )
    .operations({
      update: useUpdateDriverStatus(),
    })
    .layout({ columns: 2, responsive: true })
    .ui({
      submitButtonText: 'Actualizar Conductor',
      modalSize: 'lg',
    })
    .build();
}

// Configuraciones lazy-loaded (se crean cuando se necesitan)
export const driverFormConfigs = {
  get create() { return createDriverCreateFormConfig(); },
  get search() { return createDriverSearchFormConfig(); },
  get delete() { return createDriverDeleteFormConfig(); },
  get update() { return createDriverUpdateFormConfig(); },
};
