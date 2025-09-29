import { createForm, field, fieldPresets } from '@/components/forms';
import { z } from 'zod';
import { createUserSchema, updateUserSchema, searchUsersSchema } from '../schemas/user-schemas';

// Configuración del formulario de creación de usuario
export const userCreationFormConfig = createForm('users')
  .title('Crear Nuevo Usuario')
  .schema(createUserSchema)
  .defaultValues({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    userType: 'passenger' as const,
  })
  .fields(
    fieldPresets.firstName().build(),
    fieldPresets.email().build(),
    fieldPresets.phone().required(false).build(),
    fieldPresets.city().required(false).build(),
    fieldPresets.state().required(false).build(),
    fieldPresets.country().required(false).build(),
    field.select('userType')
      .label('Tipo de Usuario')
      .options([
        { value: 'passenger', label: 'Pasajero' },
        { value: 'driver', label: 'Conductor' },
      ])
      .required()
      .build()
  )
  .operations({
    // Operations will be provided by the component using the form
  })
  .layout({ columns: 2, responsive: true })
  .ui({
    submitButtonText: 'Crear Usuario',
    modalSize: 'lg'
  })
  .build();

// Configuración del formulario de actualización de usuario
export const userUpdateFormConfig = createForm('users')
  .title('Actualizar Usuario')
  .schema(updateUserSchema)
  .defaultValues({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    isActive: true,
    userType: 'passenger' as const,
  })
  .fields(
    fieldPresets.firstName().required(false).build(),
    fieldPresets.email().required(false).build(),
    fieldPresets.phone().required(false).build(),
    fieldPresets.city().required(false).build(),
    fieldPresets.state().required(false).build(),
    fieldPresets.country().required(false).build(),
    field.checkbox('isActive')
      .label('Usuario Activo')
      .build(),
    field.select('userType')
      .label('Tipo de Usuario')
      .options([
        { value: 'passenger', label: 'Pasajero' },
        { value: 'driver', label: 'Conductor' },
      ])
      .required(false)
      .build()
  )
  .operations({
    // Operations will be provided by the component using the form
  })
  .layout({ columns: 2, responsive: true })
  .ui({
    submitButtonText: 'Actualizar Usuario',
    modalSize: 'lg'
  })
  .build();

// Configuración del formulario de búsqueda de usuarios
export const userSearchFormConfig = createForm('users')
  .title('Buscar Usuarios')
  .schema(searchUsersSchema)
  .defaultValues({
    search: '',
    isActive: undefined,
    userType: undefined,
    page: 1,
    limit: 10,
  })
  .fields(
    field.text('search')
      .label('Buscar')
      .placeholder('Nombre, email o teléfono')
      .required(false)
      .build(),
    field.select('userType')
      .label('Tipo de Usuario')
      .options([
        { value: 'passenger', label: 'Pasajero' },
        { value: 'driver', label: 'Conductor' },
      ])
      .placeholder('Todos los tipos')
      .required(false)
      .build(),
    field.checkbox('isActive')
      .label('Solo usuarios activos')
      .required(false)
      .build(),
    field.number('limit')
      .label('Resultados por página')
      .min(1)
      .max(100)
      .required(false)
      .build()
  )
  .operations({
    // Operations will be provided by the component using the form
  })
  .layout({ columns: 2, responsive: true })
  .ui({
    submitButtonText: 'Buscar',
    modalSize: 'md'
  })
  .build();

// Configuración para eliminación de usuario
export const userDeleteFormConfig = createForm('users')
  .title('Eliminar Usuario')
  .schema(z.object({})) // Schema vacío para eliminación
  .defaultValues({})
  .fields() // Sin campos para eliminación
  .operations({
    // Operations will be provided by the component using the form
  })
  .ui({
    submitButtonText: 'Eliminar Usuario',
    modalSize: 'sm'
  })
  .build();
