# Subida de Imágenes de Tiers

## 📋 Descripción

Esta funcionalidad permite a los administradores subir imágenes para cada tier de vehículo (Economy, Premium, etc.) que se mostrarán en la aplicación móvil cuando los usuarios seleccionen el tipo de vehículo.

## 🎯 Características

- **Upload directo a MinIO**: Las imágenes se almacenan en el bucket de MinIO del proyecto
- **Validación de archivos**: Solo acepta JPEG, PNG y WebP con un tamaño máximo de 2MB
- **Preview en tiempo real**: Muestra una vista previa de la imagen antes de subirla
- **Reemplazo automático**: Al subir una nueva imagen, la anterior se elimina automáticamente
- **Integración completa**: Las imágenes se muestran automáticamente en la app móvil

## 🚀 Cómo Usar

### Desde el Modal de Edición de Tier

1. Ve a **Dashboard > Configuración > Pricing**
2. Haz clic en el botón de **editar** (lápiz) de cualquier tier existente
3. Desplázate hasta la sección **"Imagen del Tier"**
4. Haz clic en el área de upload o arrastra una imagen
5. Verifica el preview de la imagen
6. Haz clic en **"Subir Imagen"**
7. La imagen se guardará automáticamente y se mostrará en la app

### Desde el Modal de Creación de Tier

1. Ve a **Dashboard > Configuración > Pricing**
2. Haz clic en **"Crear Nuevo Tier"**
3. Completa todos los campos requeridos
4. **Guarda el tier primero** (no puedes subir imagen sin un ID de tier)
5. Luego edita el tier para agregar la imagen

## 📐 Especificaciones Técnicas

### Formatos Permitidos
- JPEG / JPG
- PNG
- WebP

### Limitaciones
- Tamaño máximo: **2MB**
- Dimensiones recomendadas: **500x500px** o similar (cuadrada)
- Proporción recomendada: **1:1** (cuadrada)

### Almacenamiento
- **Ubicación**: `tiers/{tierId}/images/` en MinIO
- **Nombre del archivo**: Se genera automáticamente con timestamp y UUID
- **URL pública**: Se genera automáticamente y se guarda en la base de datos

## 🔧 Arquitectura

### Backend
- **Endpoint**: `POST /v1/admin/pricing/ride-tiers/:id/image`
- **Servicio**: `RideTiersService.uploadTierImage()`
- **Storage**: `StorageService` (MinIO)
- **Permisos**: Requiere `PRICING_WRITE`

### Frontend (Admin)
- **Componente**: `TierImageUpload.tsx`
- **Hook**: `useUploadTierImage()`
- **Endpoint helper**: `ENDPOINTS.pricing.rideTierUploadImage(id)`

### App Móvil
La app móvil consume automáticamente el campo `imageUrl` del tier:

```typescript
// components/customer/steps/SelectVehicleTypeStep/SelectVehicleTypeStep.tsx
{
  id: tier.id,
  name: tier.name,
  imageUrl: tier.imageUrl, // ← Se usa aquí
  // ... otros campos
}
```

## 🎨 Interfaz de Usuario

El componente muestra:

1. **Vista de Preview**: Si hay una imagen, muestra una vista previa
2. **Botón de Eliminar**: Permite quitar la imagen actual
3. **Área de Drop**: Zona para hacer clic o arrastrar archivos
4. **Indicador de Carga**: Durante la subida muestra un spinner
5. **Mensajes de Error**: Si hay problemas con el archivo

## ⚠️ Validaciones

El sistema valida:

- ✅ Tipo de archivo (MIME type)
- ✅ Tamaño del archivo
- ✅ Existencia del tier antes de subir
- ✅ Permisos del usuario administrador

## 🔄 Flujo Completo

```
1. Admin selecciona imagen
   ↓
2. Validación en frontend (tipo y tamaño)
   ↓
3. Se muestra preview
   ↓
4. Admin hace clic en "Subir Imagen"
   ↓
5. FormData se envía al backend
   ↓
6. Backend valida archivo
   ↓
7. Imagen se sube a MinIO
   ↓
8. Se elimina imagen anterior (si existe)
   ↓
9. Se actualiza tier.imageUrl en BD
   ↓
10. Se invalida caché de tiers
   ↓
11. App móvil recibe nueva imageUrl
```

## 📱 Visualización en App Móvil

Las imágenes se muestran en:
- **SelectVehicleTypeStep**: Al seleccionar tipo de vehículo
- **VehicleTypeCard**: En la tarjeta de cada tier

## 🐛 Solución de Problemas

### "El archivo es muy grande"
- Comprime la imagen antes de subirla
- Usa herramientas online como TinyPNG o Squoosh

### "Tipo de archivo no permitido"
- Asegúrate de usar JPEG, PNG o WebP
- Convierte la imagen si es necesario

### "Primero guarda el tier"
- No puedes subir imagen en modo creación
- Guarda el tier primero, luego edítalo para agregar la imagen

### La imagen no se muestra en la app
- Verifica que el tier esté activo
- Confirma que la URL de la imagen esté guardada en la BD
- Revisa la consola de la app para errores de red

## 📚 Referencias

### Archivos Relevantes

**Backend:**
- `yavoybackend/src/admin/modules/pricing/services/ride-tiers.service.ts`
- `yavoybackend/src/admin/modules/pricing/controllers/ride-tiers.controller.ts`
- `yavoybackend/src/storage/storage.service.ts`

**Admin Frontend:**
- `admin_ya_voy/src/features/config/components/pricing/TierImageUpload.tsx`
- `admin_ya_voy/src/features/config/hooks/use-pricing.ts`
- `admin_ya_voy/src/lib/endpoints.ts`

**App Móvil:**
- `yavoyapp/components/customer/steps/SelectVehicleTypeStep/SelectVehicleTypeStep.tsx`
- `yavoyapp/components/customer/components/VehicleTypeCard/VehicleTypeCard.tsx`

### Documentación Adicional
- [Backend: Tier Image Upload API](../../yavoybackend/docs/tier-image-upload-api.md)
- [Backend: Implementation Guide](../../yavoybackend/TIER_IMAGE_UPLOAD_IMPLEMENTATION.md)

