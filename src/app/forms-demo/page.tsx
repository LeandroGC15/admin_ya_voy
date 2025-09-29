'use client';

import React, { useState } from 'react';
import { FormProvider, createForm, field, useFormContext } from '@/components/forms';
import { CrudModal, CrudForm, CrudSearchForm } from '@/components/forms';
import { driverFormConfigs } from '@/features/drivers/config/driver-form-config';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';

// Configuración del formulario con campos condicionales
const conditionalFormSchema = z.object({
  userType: z.enum(['person', 'company']),
  firstName: z.string().min(2, 'Nombre requerido').optional(),
  lastName: z.string().min(2, 'Apellido requerido').optional(),
  companyName: z.string().min(2, 'Nombre de empresa requerido').optional(),
  age: z.number().min(18, 'Debe ser mayor de edad').optional(),
  hasLicense: z.boolean().optional(),
  total: z.number().min(0).optional(),
  discountCode: z.string().optional(),
});

type ConditionalFormValues = z.infer<typeof conditionalFormSchema>;

const conditionalFormConfig = createForm<ConditionalFormValues>('conditional-demo')
  .title('Formulario con Campos Condicionales')
  .description('Demostración de campos que se muestran/ocultan dinámicamente')
  .schema(conditionalFormSchema)
  .defaultValues({
    userType: 'person',
    hasLicense: false,
    total: 0,
  })
  .fields(
    // Campo principal que controla otros campos
    field.select('userType')
      .label('Tipo de Usuario')
      .options([
        { value: 'person', label: 'Persona Individual' },
        { value: 'company', label: 'Empresa' },
      ])
      .required(),

    // Campos que se muestran solo para personas
    field.text('firstName')
      .label('Nombre')
      .showWhen({ field: 'userType', value: 'person' })
      .required(),

    field.text('lastName')
      .label('Apellido')
      .showWhen({ field: 'userType', value: 'person' })
      .required(),

    // Campo que se muestra solo para empresas
    field.text('companyName')
      .label('Nombre de la Empresa')
      .showWhen({ field: 'userType', value: 'company' })
      .required(),

    // Campo condicional con función personalizada
    field.checkbox('hasLicense')
      .label('¿Tiene licencia de conducir?')
      .showWhen({ field: 'userType', value: 'person' }),

    field.number('age')
      .label('Edad')
      .showWhenFn((values) => values.userType === 'person' && values.hasLicense)
      .min(18)
      .max(100)
      .required(),

    // Campo condicional con operador numérico
    field.number('total')
      .label('Total de la Compra')
      .min(0)
      .placeholder('0.00'),

    field.text('discountCode')
      .label('Código de Descuento')
      .showWhen({ field: 'total', value: 100, operator: 'greater_than' })
      .placeholder('Ingresa código de descuento'),
  )
  .layout({ columns: 2, responsive: true })
  .ui({
    submitButtonText: 'Enviar Formulario',
    showCancelButton: false,
  })
  .build();

// Componente para mostrar los valores del formulario en tiempo real
function ConditionalFormValues() {
  const { form } = useFormContext<ConditionalFormValues>();
  const values = form.watch();

  return (
    <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
      {JSON.stringify(values, null, 2)}
    </pre>
  );
}

// Configuración del formulario con persistencia
const persistenceFormSchema = z.object({
  title: z.string().min(3, 'Título requerido'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
});

type PersistenceFormValues = z.infer<typeof persistenceFormSchema>;

const persistenceFormConfig = createForm<PersistenceFormValues>('persistence-demo')
  .title('Formulario con Persistencia Automática')
  .description('Este formulario se guarda automáticamente cada segundo')
  .schema(persistenceFormSchema)
  .defaultValues({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: '',
  })
  .fields(
    field.text('title')
      .label('Título')
      .placeholder('Ingresa un título')
      .required(),

    field.textarea('description')
      .label('Descripción')
      .placeholder('Ingresa una descripción opcional'),

    field.select('priority')
      .label('Prioridad')
      .options([
        { value: 'low', label: 'Baja' },
        { value: 'medium', label: 'Media' },
        { value: 'high', label: 'Alta' },
      ])
      .required(),

    field.date('dueDate')
      .label('Fecha Límite'),

    field.text('tags')
      .label('Etiquetas')
      .placeholder('separadas por coma'),
  )
  .enablePersistence('demo-persistence-form', 1000) // Guardar cada 1 segundo
  .layout({ columns: 2, responsive: true })
  .ui({
    submitButtonText: 'Guardar Tarea',
    showCancelButton: false,
  })
  .build();

// Componente para mostrar el estado del draft
function DraftStatus() {
  const { draft } = useFormContext<PersistenceFormValues>();

  if (!draft?.has()) {
    return (
      <div className="text-sm text-muted-foreground">
        📝 Sin borrador guardado
      </div>
    );
  }

  const savedData = draft.load();
  const lastSaved = savedData ? new Date().toLocaleTimeString() : 'desconocido';

  return (
    <div className="text-sm">
      💾 <strong>Borrador guardado</strong> (último: {lastSaved})
    </div>
  );
}

// Controles para gestionar el draft
function DraftControls() {
  const { draft, reset } = useFormContext<PersistenceFormValues>();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => draft?.load()}
        disabled={!draft?.has()}
      >
        Cargar Borrador
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => draft?.clear()}
        disabled={!draft?.has()}
      >
        Limpiar Borrador
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => reset(true)}
      >
        Reset + Limpiar
      </Button>
    </div>
  );
}

// Mock data para simular conductores
const mockDrivers = [
  {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@example.com',
    phoneNumber: '+1234567890',
    carModel: 'Toyota Corolla',
    licensePlate: 'ABC-123',
    carSeats: 4,
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    firstName: 'María',
    lastName: 'García',
    email: 'maria@example.com',
    phoneNumber: '+1234567891',
    carModel: 'Honda Civic',
    licensePlate: 'XYZ-456',
    carSeats: 5,
    status: 'inactive',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z',
  },
];

export default function FormsDemoPage() {
  const [selectedDriver, setSelectedDriver] = useState<typeof mockDrivers[0] | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);

  const addToLog = (message: string) => {
    setActionLog(prev => [new Date().toLocaleTimeString() + ': ' + message, ...prev.slice(0, 9)]);
  };

  const handleDriverAction = (action: string, driver?: any) => {
    addToLog(`${action.toUpperCase()}: ${driver ? `${driver.firstName} ${driver.lastName}` : 'Nuevo conductor'}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Sistema de Formularios Reutilizables</h1>
        <p className="text-muted-foreground">
          Demostración completa del sistema de formularios CRUD con React Hook Form, Zod y React Query
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary">TypeScript</Badge>
          <Badge variant="secondary">React Hook Form</Badge>
          <Badge variant="secondary">Zod</Badge>
          <Badge variant="secondary">React Query</Badge>
          <Badge variant="secondary">shadcn/ui</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="create">Crear</TabsTrigger>
          <TabsTrigger value="conditional">Campos Condicionales</TabsTrigger>
          <TabsTrigger value="persistence">Persistencia</TabsTrigger>
          <TabsTrigger value="search">Buscar</TabsTrigger>
          <TabsTrigger value="crud">Operaciones CRUD</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Configuración Declarativa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Define formularios usando builders fluido con configuración de campos, validación y operaciones.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  Campos Dinámicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Soporte completo para text, email, select, checkbox, radio, date, file y más tipos de campo.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  Validación Automática
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Validación con Zod integrada automáticamente con mensajes de error contextuales.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-orange-500" />
                  Provider Pattern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Estado global del formulario con contexto React para compartir datos entre componentes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                  React Query Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Operaciones CRUD nativas con invalidación automática de queries y manejo de estado.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-teal-500" />
                  UI Consistente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Componentes basados en shadcn/ui con soporte completo para temas oscuro/claro.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registro de Acciones</CardTitle>
              <CardDescription>Historial de acciones realizadas en los formularios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {actionLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay acciones registradas aún</p>
                ) : (
                  actionLog.map((log, index) => (
                    <div key={index} className="text-sm font-mono bg-muted p-2 rounded">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Conductor</CardTitle>
              <CardDescription>
                Formulario de creación usando el sistema de formularios reutilizables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider config={driverFormConfigs.create}>
                <div className="space-y-4">
                  <DriverCreateButton onAction={handleDriverAction} />
                  <CrudModal config={driverFormConfigs.create}>
                    <CrudForm config={driverFormConfigs.create} />
                  </CrudModal>
                </div>
              </FormProvider>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Código del Formulario</CardTitle>
              <CardDescription>Cómo se define este formulario</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
{`const driverCreateFormConfig = createForm<DriverFormValues>('drivers')
  .title('Registrar Nuevo Conductor')
  .schema(driverFormSchema)
  .defaultValues({ firstName: '', email: '', ... })
  .fields(
    fieldPresets.firstName(),
    fieldPresets.email(),
    fieldPresets.phone(),
    fieldPresets.carModel(),
    fieldPresets.licensePlate(),
    fieldPresets.carSeats(),
  )
  .operations({ create: useCreateDriver() })
  .layout({ columns: 2, responsive: true })
  .build();`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conditional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campos Condicionales</CardTitle>
              <CardDescription>
                Campos que se muestran/ocultan dinámicamente basado en otros valores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider config={conditionalFormConfig}>
                <div className="max-w-2xl">
                  <CrudForm config={conditionalFormConfig} />
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Valores del formulario:</h4>
                    <ConditionalFormValues />
                  </div>
                </div>
              </FormProvider>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Código de Campos Condicionales</CardTitle>
              <CardDescription>Ejemplos de cómo implementar condiciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Condición Simple:</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`field.select('userType')
  .options([
    { value: 'person', label: 'Persona' },
    { value: 'company', label: 'Empresa' },
  ]),

field.text('companyName')
  .showWhen({ field: 'userType', value: 'company' })
  .label('Nombre de Empresa')`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Condición con Función Personalizada:</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`field.number('age')
  .showWhenFn((values) => values.userType === 'person' && values.hasLicense)
  .label('Edad')`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Múltiples Operadores:</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`field.text('discountCode')
  .showWhen({ field: 'total', value: 100, operator: 'greater_than' })
  .label('Código de Descuento')`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="persistence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Persistencia de Drafts</CardTitle>
              <CardDescription>
                Los formularios se guardan automáticamente en localStorage. Completa el formulario parcialmente y actualiza la página para ver la persistencia en acción.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider config={persistenceFormConfig}>
                <div className="space-y-6">
                  <div className="max-w-2xl">
                    <CrudForm config={persistenceFormConfig} />
                  </div>

                  <div className="flex gap-4">
                    <DraftStatus />
                    <DraftControls />
                  </div>
                </div>
              </FormProvider>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Código de Persistencia</CardTitle>
              <CardDescription>Habilitar persistencia automática en formularios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Habilitar Persistencia:</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`const formConfig = createForm('my-form')
  .enablePersistence('unique-form-key', 2000)
  .schema(mySchema)
  .defaultValues(defaults)
  .fields(fields)
  .build();

// O configuración personalizada:
const formConfig = createForm('my-form')
  .persistence({
    enabled: true,
    key: 'my-custom-key',
    debounceMs: 1000,
    excludeFields: ['password', 'sensitiveData']
  })
  .build();`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Usar en Componente:</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`function MyForm() {
  const { draft } = useFormContext();

  return (
    <div>
      {draft?.has() && (
        <Alert>
          <Info className="h-4 w-4" />
          Tienes un borrador guardado. ¿Quieres cargarlo?
          <Button onClick={() => draft.load()}>Cargar</Button>
        </Alert>
      )}

      <CrudForm config={config} />
    </div>
  );
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Conductores</CardTitle>
              <CardDescription>
                Formulario de búsqueda con filtros automáticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider config={driverFormConfigs.search}>
                <CrudSearchForm
                  config={driverFormConfigs.search}
                  autoSearch={true}
                  autoSearchDelay={800}
                />
              </FormProvider>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conductores Encontrados</CardTitle>
              <CardDescription>Lista simulada de resultados de búsqueda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDrivers.map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{driver.firstName} {driver.lastName}</h4>
                      <p className="text-sm text-muted-foreground">{driver.email}</p>
                      <p className="text-sm text-muted-foreground">{driver.carModel} - {driver.licensePlate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={driver.status === 'active' ? 'default' : 'secondary'}>
                        {driver.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDriver(driver)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crud" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operaciones CRUD Completas</CardTitle>
              <CardDescription>
                Crear, Leer, Actualizar y Eliminar conductores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormProvider config={driverFormConfigs.create}>
                  <DriverCreateButton onAction={handleDriverAction} />
                  <CrudModal config={driverFormConfigs.create}>
                    <CrudForm config={driverFormConfigs.create} />
                  </CrudModal>
                </FormProvider>

                <FormProvider config={driverFormConfigs.update}>
                  <DriverUpdateButton
                    driver={selectedDriver}
                    onAction={handleDriverAction}
                  />
                  <CrudModal config={driverFormConfigs.update}>
                    <CrudForm config={driverFormConfigs.update} />
                  </CrudModal>
                </FormProvider>

                <FormProvider config={driverFormConfigs.delete}>
                  <DriverDeleteButton
                    driver={selectedDriver}
                    onAction={handleDriverAction}
                  />
                  <CrudModal config={driverFormConfigs.delete}>
                    <CrudForm config={driverFormConfigs.delete} />
                  </CrudModal>
                </FormProvider>
              </div>
            </CardContent>
          </Card>

          {selectedDriver && (
            <Card>
              <CardHeader>
                <CardTitle>Conductor Seleccionado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium">{selectedDriver.firstName} {selectedDriver.lastName}</h4>
                  <p className="text-sm text-muted-foreground">{selectedDriver.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedDriver.carModel} - {selectedDriver.licensePlate}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componentes helper para las operaciones CRUD
function DriverCreateButton({ onAction }: { onAction: (action: string) => void }) {
  const { openCreate } = useFormContext();

  return (
    <Button onClick={() => { openCreate(); onAction('create'); }} className="w-full">
      <Plus className="h-4 w-4 mr-2" />
      Crear Conductor
    </Button>
  );
}

function DriverUpdateButton({
  driver,
  onAction
}: {
  driver: any;
  onAction: (action: string, driver?: any) => void;
}) {
  const { openUpdate } = useFormContext();

  return (
    <Button
      variant="outline"
      onClick={() => { if (driver) { openUpdate(driver); onAction('update', driver); } }}
      disabled={!driver}
      className="w-full"
    >
      <Edit className="h-4 w-4 mr-2" />
      Actualizar
    </Button>
  );
}

function DriverDeleteButton({
  driver,
  onAction
}: {
  driver: any;
  onAction: (action: string, driver?: any) => void;
}) {
  const { openDelete } = useFormContext();

  return (
    <Button
      variant="destructive"
      onClick={() => { if (driver) { openDelete(driver); onAction('delete', driver); } }}
      disabled={!driver}
      className="w-full"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Eliminar
    </Button>
  );
}
