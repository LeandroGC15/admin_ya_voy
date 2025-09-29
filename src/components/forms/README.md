# Sistema de Formularios Reutilizables

Este sistema proporciona componentes reutilizables para formularios CRUD con React Hook Form, Zod y React Query.

## 🚀 Características

- ✅ **Validación automática** con Zod schemas
- ✅ **Integración React Query** para operaciones CRUD
- ✅ **Campos dinámicos** configurables
- ✅ **Provider pattern** para estado global
- ✅ **UI consistente** con shadcn/ui
- ✅ **TypeScript completo** con tipos inferidos
- ✅ **Responsive** y accesible

## 📁 Estructura

```
src/components/forms/
├── index.ts                 # Exports principales
├── crud-modal.tsx          # Modal genérico para operaciones
├── crud-form.tsx           # Formulario dinámico
├── crud-search-form.tsx    # Formulario de búsqueda
├── field-renderer.tsx      # Renderizado de campos individuales
├── form.tsx               # Componentes base (Form, FormField, etc.)
├── form-input.tsx         # Input personalizado
└── README.md              # Esta documentación

src/hooks/
└── use-form-manager.ts    # Hook principal y provider

src/lib/
└── form-config-builder.ts # Builders para configuración

src/types/
└── form-system.ts         # Tipos TypeScript
```

## 🛠️ Uso Básico

### 1. Crear configuración del formulario

```typescript
import { createForm, field, fieldPresets } from '@/components/forms';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  age: z.number().min(18, 'Debe ser mayor de edad'),
});

const userFormConfig = createForm('users')
  .title('Crear Usuario')
  .schema(userSchema)
  .defaultValues({ name: '', email: '', age: 18 })
  .fields(
    fieldPresets.firstName(),
    fieldPresets.email(),
    field.number('age').label('Edad').min(18).max(120).required(),
  )
  .operations({
    create: useCreateUser(),
    update: useUpdateUser(),
    delete: useDeleteUser(),
    search: useSearchUsers(),
  })
  .layout({ columns: 2, responsive: true })
  .ui({ submitButtonText: 'Guardar Usuario' })
  .build();
```

### 2. Usar en componente

```tsx
import { FormProvider, CrudModal, CrudForm } from '@/components/forms';

function UserManager() {
  const { openCreate, openUpdate, openDelete } = useFormContext();

  return (
    <FormProvider config={userFormConfig}>
      <Button onClick={() => openCreate()}>Nuevo Usuario</Button>

      <CrudModal config={userFormConfig}>
        <CrudForm config={userFormConfig} />
      </CrudModal>
    </FormProvider>
  );
}
```

## 🎯 API Reference

### FormConfig

```typescript
interface FormConfig<T, TData, TVariables> {
  id: string;                    // Identificador único
  title: string;                 // Título del formulario
  description?: string;          // Descripción opcional
  schema: ZodType<T>;           // Schema de validación
  defaultValues: T;              // Valores por defecto
  fields: FieldConfig<T>[];      // Configuración de campos
  operations: FormOperations;    // Operaciones CRUD
  layout?: {                     // Configuración de layout
    columns?: number;
    gap?: string;
    responsive?: boolean;
  };
  ui?: {                        // Configuración de UI
    submitButtonText?: string;
    cancelButtonText?: string;
    showCancelButton?: boolean;
    modalSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
  };
}
```

### Tipos de Campo Soportados

- `text` - Campo de texto simple
- `email` - Campo de email con validación
- `password` - Campo de contraseña con toggle
- `number` - Campo numérico con min/max
- `tel` - Campo de teléfono
- `textarea` - Área de texto multilinea
- `select` - Selector desplegable
- `checkbox` - Casilla de verificación (única o múltiple)
- `radio` - Botones de radio
- `date` - Selector de fecha
- `datetime-local` - Selector de fecha y hora
- `file` - Input de archivo
- `hidden` - Campo oculto

### Builders Disponibles

#### Field Builder
```typescript
field.text('name')
  .label('Nombre')
  .placeholder('Ingrese nombre')
  .required()
  .description('Nombre completo del usuario')

field.select('status')
  .label('Estado')
  .options([
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
  ])
  .required()

field.number('age')
  .label('Edad')
  .min(18)
  .max(120)
  .required()
```

#### Field Presets
```typescript
fieldPresets.firstName()     // Nombre
fieldPresets.lastName()      // Apellido
fieldPresets.email()         // Email
fieldPresets.phone()         // Teléfono
fieldPresets.carSeats()      // Asientos de auto
fieldPresets.licensePlate()  // Placa
// ... y muchos más
```

#### Form Builder
```typescript
createForm('entity-name')
  .title('Título')
  .schema(mySchema)
  .defaultValues(defaults)
  .fields(field1, field2, field3)
  .operations({ create, update, delete, search })
  .layout({ columns: 2, responsive: true })
  .ui({ submitButtonText: 'Guardar' })
  .build()
```

## 🔧 Operaciones CRUD

### Create
```typescript
const config = createForm('users')
  .operations({
    create: useCreateUser(), // Hook de React Query
  })
  .build();

// Uso
const { openCreate } = useFormContext();
openCreate(); // Abre modal con formulario vacío
```

### Update
```typescript
const { openUpdate } = useFormContext();
openUpdate(selectedUser, userData); // Abre modal con datos precargados
```

### Delete
```typescript
const { openDelete } = useFormContext();
openDelete(selectedUser); // Abre modal de confirmación
```

### Search
```typescript
const { openSearch, setSearchFilters } = useFormContext();
openSearch(initialFilters); // Abre modal de búsqueda
setSearchFilters(newFilters); // Actualiza filtros
```

## 🎨 Personalización

### Layouts Personalizados
```typescript
.layout({
  columns: 3,           // Número de columnas
  gap: '1rem',          // Espacio entre campos
  responsive: true,     // Responsive en móvil
})
```

### UI Personalizada
```typescript
.ui({
  submitButtonText: 'Crear',
  cancelButtonText: 'Cancelar',
  modalSize: 'lg',      // sm, md, lg, xl, full
  showCloseButton: true,
})
```

### Campos Condicionales
```typescript
// Campos que dependen de otros
fields(
  field.select('type').options([
    { value: 'person', label: 'Persona' },
    { value: 'company', label: 'Empresa' },
  ]),
  field.text('companyName')
    .label('Nombre de Empresa')
    .hidden(({ watch }) => watch('type') !== 'company'), // Oculto si no es empresa
)
```

## 📝 Ejemplos Avanzados

### Formulario Multi-step
```typescript
const wizardConfig = createForm('wizard')
  .fields(
    // Paso 1
    field.text('name').step(1),
    field.email('email').step(1),

    // Paso 2
    field.text('address').step(2),
    field.text('city').step(2),
  )
  .build();
```

### Formulario con Validación Asíncrona
```typescript
const asyncSchema = z.object({
  username: z.string()
    .min(3)
    .refine(async (username) => {
      const response = await checkUsername(username);
      return response.available;
    }, 'Usuario no disponible'),
});

const asyncConfig = createForm('async-validation')
  .schema(asyncSchema)
  .validation({ mode: 'onBlur' }) // Validar al perder foco
  .build();
```

### Formulario con Campos Dinámicos
```typescript
function DynamicForm() {
  const [fields, setFields] = useState<FieldConfig[]>([]);

  const addField = () => {
    setFields([...fields,
      field.text(`dynamic-${fields.length}`).label(`Campo ${fields.length + 1}`)
    ]);
  };

  return (
    <FormProvider config={{...config, fields}}>
      <CrudForm config={{...config, fields}} />
      <Button onClick={addField}>Agregar Campo</Button>
    </FormProvider>
  );
}
```

## 🧪 Testing

```typescript
import { render, screen } from '@testing-library/react';
import { FormProvider } from '@/components/forms';

const mockConfig = createForm('test').schema(testSchema).fields(testField).build();

test('renders form correctly', () => {
  render(
    <FormProvider config={mockConfig}>
      <CrudForm config={mockConfig} />
    </FormProvider>
  );

  expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
});
```

## 🔍 Troubleshooting

### Error: "useFormContext must be used within a FormProvider"
**Solución**: Asegúrate de envolver tus componentes con `FormProvider`.

### Error: "Schema is required for form configuration"
**Solución**: Proporciona un schema de Zod válido en la configuración.

### Campos no se renderizan
**Solución**: Verifica que los campos no tengan `hidden: true` y que el array `fields` no esté vacío.

### Validación no funciona
**Solución**: Asegúrate de que el schema de Zod corresponda con los nombres de los campos.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
