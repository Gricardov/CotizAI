# CotizAI - Sistema de Cotizaciones

Sistema completo de cotizaciones con frontend React y backend NestJS.

## 🚀 Scripts de Desarrollo

### **Ejecutar Ambos Servidores (Frontend + Backend)**
```bash
# Opción 1: Usando concurrently (recomendado)
npm run both

# Opción 2: Usando dev
npm run dev:both

# Opción 3: Usando start
npm run start:both
```

### **Ejecutar Servidores Independientemente**

#### **Solo Frontend (React)**
```bash
# Opción 1: Desde la raíz del proyecto
npm run frontend

# Opción 2: Navegar a la carpeta frontend y ejecutar
cd frontend
npm run dev

# Opción 3: Comando directo desde la raíz
npm run frontend:dev
```

#### **Solo Backend (NestJS)**
```bash
# Opción 1: Desde la raíz del proyecto
npm run backend

# Opción 2: Navegar a la carpeta backend y ejecutar
cd backend
npm run dev

# Opción 3: Comando directo desde la raíz
npm run backend:dev
```

## 📋 Comandos Disponibles

### **Desde la Raíz del Proyecto**
| Comando | Descripción | Puertos |
|---------|-------------|---------|
| `npm run both` | Ejecuta frontend y backend juntos | Frontend: 4200, Backend: 3000 |
| `npm run frontend` | Solo frontend | 4200 |
| `npm run backend` | Solo backend | 3000 |
| `npm run dev:both` | Modo desarrollo ambos | Por defecto |
| `npm run dev:frontend` | Solo frontend desarrollo | Por defecto |
| `npm run dev:backend` | Solo backend desarrollo | Por defecto |

### **Navegación a Carpetas**
| Comando | Descripción |
|---------|-------------|
| `npm run cd:frontend` | Navegar a la carpeta frontend |
| `npm run cd:backend` | Navegar a la carpeta backend |

### **Ejecutar desde Carpetas Individuales**
| Comando | Descripción |
|---------|-------------|
| `npm run frontend:dev` | Ejecutar frontend desde su carpeta |
| `npm run backend:dev` | Ejecutar backend desde su carpeta |
| `npm run frontend:start` | Iniciar frontend desde su carpeta |
| `npm run backend:start` | Iniciar backend desde su carpeta |
| `npm run frontend:serve` | Servir frontend desde su carpeta |
| `npm run backend:serve` | Servir backend desde su carpeta |

## 🔧 Configuración

### **Variables de Entorno**
Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=tu_usuario
DATABASE_PASSWORD=tu_password
DATABASE_NAME=cotizai_db

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# APIs
OPENAI_API_KEY=tu_openai_api_key
GOOGLE_AI_API_KEY=tu_google_ai_api_key

# Entorno
NODE_ENV=development
PORT=3000
REACT_APP_API_URL=http://localhost:3000
```

### **Credenciales de Acceso**
- **Usuario Admin:** `admin` / `12345`
- **Usuario Cotizador:** `cotizador` / `12345`

## 🏗️ Build y Despliegue

### **Build para Producción**
```bash
npm run build
```

### **Build para Vercel**
```bash
npm run vercel-build
```

### **Build para Netlify**
```bash
npm run build:netlify
```

### **Despliegue en Netlify**
El proyecto incluye configuración automática para Netlify:

1. **Archivo de configuración:** `netlify.toml`
2. **Comando de build:** `npm run build:netlify`
3. **Directorio de publicación:** `frontend/dist`

### **Variables de Entorno para Netlify**
```env
GEMINI_API_KEY=tu_gemini_api_key
JWT_SECRET=tu_jwt_secret
POSTGRES_DB=tu_base_de_datos
POSTGRES_HOST=tu_host
POSTGRES_PASSWORD=tu_password
POSTGRES_PORT=5432
POSTGRES_USER=tu_usuario
```

## 📁 Estructura del Proyecto

```
cotizai-app/
├── frontend/          # React + Vite
│   ├── package.json   # Scripts del frontend
│   └── src/           # Código fuente React
├── backend/           # NestJS + TypeORM
│   ├── package.json   # Scripts del backend
│   └── src/           # Código fuente NestJS
├── package.json       # Scripts principales
└── README.md         # Este archivo
```

## 🛠️ Tecnologías

- **Frontend:** React, Vite, Material-UI, Axios
- **Backend:** NestJS, TypeORM, PostgreSQL, JWT
- **Herramientas:** Nx, TypeScript, Concurrently

## 📚 Referencias

- [DEV Community - Running Frontend & Backend Together](https://dev.to/sumonta056/how-to-run-frontend-backend-together-with-one-command-no-docker-needed-29nd)
- [Medium - Concurrently for Full-Stack Development](https://medium.com/@rwijayabandu/how-to-run-frontend-and-backend-with-one-command-55d5f2ce952c)
- [LogRocket - Running React and Express with concurrently](https://blog.logrocket.com/running-react-express-concurrently/)
