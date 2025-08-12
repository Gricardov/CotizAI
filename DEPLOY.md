# 🚀 Despliegue en Vercel - CotizAI

## Pasos para desplegar en Vercel

### 1. Preparación del proyecto

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Variables de entorno necesarias:**
   - `DATABASE_HOST`: Host de la base de datos
   - `DATABASE_PORT`: Puerto de la base de datos (5432)
   - `DATABASE_USERNAME`: Usuario de la base de datos
   - `DATABASE_PASSWORD`: Contraseña de la base de datos
   - `DATABASE_NAME`: Nombre de la base de datos
   - `JWT_SECRET`: Clave secreta para JWT
   - `OPENAI_API_KEY`: Clave de API de OpenAI
   - `GOOGLE_AI_API_KEY`: Clave de API de Google AI

### 2. Despliegue en Vercel

#### Opción A: Usando Vercel CLI

1. **Iniciar sesión en Vercel:**
   ```bash
   vercel login
   ```

2. **Desplegar el proyecto:**
   ```bash
   vercel
   ```

3. **Seguir las instrucciones:**
   - Seleccionar el directorio del proyecto
   - Confirmar la configuración
   - Vercel detectará automáticamente la configuración

#### Opción B: Usando GitHub

1. **Subir el código a GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Conectar con Vercel:**
   - Ir a [vercel.com](https://vercel.com)
   - Crear cuenta o iniciar sesión
   - Hacer clic en "New Project"
   - Importar el repositorio de GitHub
   - Configurar las variables de entorno

### 3. Configuración de la base de datos

Para producción, se recomienda usar:
- **Supabase** (PostgreSQL)
- **PlanetScale** (MySQL)
- **Neon** (PostgreSQL)

### 4. Configuración de dominios

1. **Dominio personalizado:**
   - En el dashboard de Vercel
   - Ir a Settings > Domains
   - Agregar dominio personalizado

2. **Subdominio de Vercel:**
   - Automáticamente asignado
   - Formato: `tu-proyecto.vercel.app`

### 5. Monitoreo y logs

- **Logs en tiempo real:** Dashboard de Vercel
- **Métricas:** Analytics integrado
- **Alertas:** Configurables en el dashboard

## Estructura del proyecto en Vercel

```
cotizai-app/
├── backend/          # API NestJS
├── frontend/         # React App
├── vercel.json       # Configuración de Vercel
└── package.json      # Scripts de build
```

## URLs de la aplicación

- **Frontend:** `https://tu-proyecto.vercel.app`
- **API:** `https://tu-proyecto.vercel.app/api`

## Troubleshooting

### Error de build
- Verificar que todas las dependencias estén en `package.json`
- Revisar los logs de build en Vercel

### Error de base de datos
- Verificar las variables de entorno
- Asegurar que la base de datos sea accesible desde Vercel

### Error de CORS
- Configurar los headers CORS en el backend
- Verificar las URLs permitidas 