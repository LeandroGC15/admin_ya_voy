# Configuración de Google Maps para Zonas de Servicio

## ⚠️ Error Actual: InvalidKeyMapError

Si ves el error `InvalidKeyMapError`, significa que la API key configurada no es válida. Sigue esta guía para configurar correctamente Google Maps.

## Requisitos

Para usar las funcionalidades de zonas de servicio con mapas, necesitas configurar una API key válida de Google Maps.

## 📋 Pasos Detallados para Obtener la API Key

### 1. Acceder a Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Inicia sesión con tu cuenta de Google
3. Si es tu primera vez, acepta los términos de servicio

### 2. Crear o Seleccionar un Proyecto

1. En la parte superior, haz clic en el selector de proyectos
2. Haz clic en "NEW PROJECT" (Nuevo Proyecto)
3. Dale un nombre (ej: "Admin YaVoy")
4. Haz clic en "CREATE" (Crear)
5. Espera a que se cree el proyecto (puede tomar unos segundos)

### 3. Habilitar las APIs Necesarias

1. Ve a: https://console.cloud.google.com/apis/library
2. Busca y habilita las siguientes APIs (haz clic en cada una y presiona "ENABLE"):
   - **Maps JavaScript API** (REQUERIDA)
   - **Geocoding API** (Opcional, pero recomendada)
   - **Places API** (Opcional)

### 4. Crear una API Key

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Haz clic en "+ CREATE CREDENTIALS" (Crear Credenciales)
3. Selecciona "API key"
4. Se generará una API key (39 caracteres aproximadamente)
5. **COPIA LA API KEY INMEDIATAMENTE** (ejemplo: `AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY`)

### 5. Configurar Restricciones (Importante para Seguridad)

1. En la ventana de la API key creada, haz clic en "EDIT API KEY" (Editar)
2. En "Application restrictions" (Restricciones de aplicación):
   - Selecciona "HTTP referrers (web sites)"
   - Agrega estos referrers:
     ```
     http://localhost:3000/*
     http://127.0.0.1:3000/*
     https://tu-dominio.com/*
     ```
3. En "API restrictions" (Restricciones de API):
   - Selecciona "Restrict key"
   - Marca solo: "Maps JavaScript API"
4. Haz clic en "SAVE" (Guardar)

## 🔧 Configuración en el Proyecto

### 1. Configurar la API Key

Edita o crea el archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=TU_API_KEY_REAL_AQUI
```

**⚠️ IMPORTANTE**: 
- Reemplaza `TU_API_KEY_REAL_AQUI` con tu API key real de 39 caracteres
- NO uses comillas
- NO agregues espacios
- La variable DEBE empezar con `NEXT_PUBLIC_`

Ejemplo correcto:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY
```

### 2. Reiniciar el Servidor

```bash
# Detén el servidor (Ctrl+C)
# Luego reinicia:
npm run dev
```

**NOTA**: Next.js solo lee las variables de entorno al iniciar, por lo que DEBES reiniciar el servidor después de cambiar `.env.local`.

## ✅ Verificación

Una vez configurada correctamente, deberías ver:

1. En la consola del navegador:
   ```
   GoogleMapProvider - API Key configured: true
   GoogleMapProvider - API Key length: 39
   GoogleMapProvider - Maps loaded successfully
   ```

2. El mapa se carga correctamente sin errores
3. Puedes dibujar polígonos y visualizar zonas

## 💰 Costos

- **$200 USD de crédito gratis mensual** de Google Cloud
- Para desarrollo y testing, es muy probable que no incurras en costos
- El uso típico de desarrollo está muy por debajo del límite gratuito
- Revisa: https://mapsplatform.google.com/pricing/

## 🐛 Troubleshooting

### Error: "InvalidKeyMapError"

**Causa**: La API key no es válida o no tiene permisos.

**Solución**:
1. Verifica que copiaste la API key completa (39 caracteres)
2. Verifica que habilitaste "Maps JavaScript API" en Google Cloud Console
3. Verifica que no hay restricciones que bloqueen localhost
4. Reinicia el servidor de desarrollo
5. Limpia la caché del navegador (Ctrl+Shift+R)

### Error: "Google Maps API Key no configurada"

**Causa**: El archivo `.env.local` no existe o la variable no está definida.

**Solución**:
1. Verifica que el archivo `.env.local` existe en la raíz del proyecto
2. Verifica que la variable se llama exactamente `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. Verifica que no hay espacios ni comillas extra
4. Reinicia el servidor de desarrollo

### Error: "RefererNotAllowedMapError"

**Causa**: El dominio desde el que estás accediendo no está en la lista de referrers permitidos.

**Solución**:
1. Ve a Google Cloud Console > Credentials
2. Edita tu API key
3. Agrega `http://localhost:3000/*` a los HTTP referrers
4. Guarda los cambios

### Mapa no se carga / Pantalla en blanco

**Solución**:
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Busca errores específicos de Google Maps
4. Ve a la pestaña "Network"
5. Busca requests a `maps.googleapis.com` que fallen
6. Verifica el código de error en la respuesta

### API Key demasiado corta (< 30 caracteres)

**Causa**: Estás usando un placeholder o una API key incompleta.

**Solución**:
1. Ve a Google Cloud Console
2. Crea una nueva API key
3. Copia la API key COMPLETA (debe tener ~39 caracteres)
4. Actualiza `.env.local`
5. Reinicia el servidor

## 📚 Recursos Adicionales

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Error Messages Reference](https://developers.google.com/maps/documentation/javascript/error-messages)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)

## 🔒 Seguridad

**IMPORTANTE**:
- ✅ Siempre configura restricciones en tu API key
- ✅ Nunca compartas tu API key públicamente
- ✅ `.env.local` está en `.gitignore` (no se sube a Git)
- ✅ Usa diferentes API keys para desarrollo y producción
- ❌ Nunca pongas la API key directamente en el código
- ❌ Nunca subas `.env.local` a un repositorio público
