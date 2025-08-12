# 🚀 CotizAI - Sistema de Cotización Inteligente

## 📋 Descripción

CotizAI es una aplicación web moderna para generar cotizaciones profesionales utilizando inteligencia artificial. El sistema incluye un frontend en React con Material-UI y un backend en NestJS con integración de IA.

## 🏗️ Arquitectura

- **Frontend**: React + TypeScript + Material-UI
- **Backend**: NestJS + TypeScript + PostgreSQL
- **IA**: OpenAI GPT + Google Gemini
- **Autenticación**: JWT
- **Despliegue**: Vercel (configurado)

## 🚀 Características

### ✨ Funcionalidades Principales
- **Autenticación**: Login con roles (admin/cotizador)
- **Cotizador**: Formulario inteligente con IA
- **Gestión de Operaciones**: CRUD de cotizaciones
- **Análisis Web**: Crawler automático de sitios web
- **Generación de PDF**: Cotizaciones profesionales
- **IA Integrada**: Descripción de proyectos y análisis

### 🎯 Roles de Usuario
- **Admin**: Acceso completo (crear, editar, eliminar)
- **Cotizador**: Solo lectura y creación de cotizaciones

## 🛠️ Instalación

### Prerrequisitos
- Node.js 18+
- PostgreSQL
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd cotizai-app
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar base de datos
```bash
# Crear base de datos PostgreSQL
createdb cotizai

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

### 4. Ejecutar migraciones
```bash
cd backend
npm run migration:run
```

### 5. Iniciar desarrollo
```bash
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend
npm run frontend

# O ambos juntos
npm run dev
```

## 🌐 URLs de Desarrollo

- **Frontend**: http://localhost:4200
- **Backend**: http://localhost:3000
- **API**: http://localhost:3000/api

## 🚀 Despliegue en Vercel

### Configuración Automática
El proyecto está configurado para desplegar automáticamente en Vercel:

1. **Variables de entorno en Vercel:**
   ```
   DATABASE_HOST=your-db-host
   DATABASE_PORT=5432
   DATABASE_USERNAME=your-username
   DATABASE_PASSWORD=your-password
   DATABASE_NAME=your-db-name
   JWT_SECRET=your-jwt-secret
   OPENAI_API_KEY=your-openai-key
   GOOGLE_AI_API_KEY=your-google-ai-key
   ```

2. **Desplegar:**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

### URLs de Producción
- **Frontend**: https://tu-proyecto.vercel.app
- **API**: https://tu-proyecto.vercel.app/api

## 📁 Estructura del Proyecto

```
cotizai-app/
├── frontend/                 # React App
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── contexts/        # Contextos (Auth)
│   │   ├── services/        # Servicios (PDF)
│   │   └── config/          # Configuración API
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Autenticación
│   │   ├── entities/       # Entidades TypeORM
│   │   └── services/       # Servicios de IA
├── vercel.json             # Configuración Vercel
└── package.json            # Scripts y dependencias
```

## 🔧 Configuración de Rutas Dinámicas

El proyecto utiliza rutas dinámicas configuradas en `frontend/src/config/api.ts`:

- **Desarrollo**: `http://localhost:3000`
- **Producción**: `https://tu-proyecto.vercel.app/api`

## 📚 Documentación Adicional

- [Guía de Despliegue](DEPLOY.md)
- [Configuración de Vercel](vercel.json)

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico, contacta al equipo de desarrollo o crea un issue en el repositorio.
