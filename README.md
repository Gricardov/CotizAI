# CotizAI - Sistema de Cotización

## 🚀 Descripción

CotizAI es una aplicación fullstack desarrollada con React (frontend) y NestJS (backend) en un monorepo Nx. El sistema incluye:

- **Sistema de autenticación JWT** con validación de roles
- **Dashboard con sidebar retráctil**
- **Formulario de cotización moderno**
- **Diseño responsive con Material-UI**

## 🛠️ Tecnologías

### Frontend
- React 19
- TypeScript
- Material-UI (MUI)
- Vite
- Axios

### Backend
- NestJS
- TypeScript
- JWT Authentication
- Passport
- Express

### Herramientas
- Nx Monorepo
- ESLint
- Prettier

## 📦 Instalación

1. **Clonar el repositorio:**
```bash
cd cotizai-app
```

2. **Instalar dependencias:**
```bash
npm install
```

## 🚀 Comandos Disponibles

### Ejecutar ambas aplicaciones simultáneamente:
```bash
npm run dev
# o
npm start
```

### Ejecutar aplicaciones por separado:
```bash
# Solo backend (puerto 3000)
npm run backend

# Solo frontend (puerto 4200)
npm run frontend
```

### Construir para producción:
```bash
npm run build
```

### Ejecutar tests:
```bash
npm run test
```

## 🔐 Credenciales de Acceso

Para acceder al sistema, usar las siguientes credenciales:

- **Usuario:** `admin`
- **Contraseña:** `12345`
- **Área:** Seleccionar cualquiera de las 5 disponibles:
  - Comercial
  - Administración
  - Marketing
  - Ti
  - Medios

## 🏗️ Estructura del Proyecto

```
cotizai-app/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── app/            # Módulo principal
│   │   ├── auth/           # Autenticación JWT
│   │   └── main.ts         # Punto de entrada
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── app/            # Componente principal
│   │   ├── components/     # Componentes UI
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── CotizadorForm.tsx
│   │   └── contexts/       # Contextos React
│   │       └── AuthContext.tsx
└── package.json           # Scripts y dependencias
```

## 🎯 Funcionalidades

### ✅ Sistema de Autenticación
- Login con usuario, contraseña y área
- Validación JWT en backend
- Protección de rutas por rol
- Persistencia de sesión en localStorage

### ✅ Dashboard
- Sidebar retráctil con navegación
- Información del usuario logueado
- Opción de logout
- Diseño responsive

### ✅ Formulario de Cotización
- **Datos fijos de la empresa:**
  - Razón Social: Alavista Lab SAC
  - RUC: 20607124711
  - Dirección: Av. Benavides 2975, Oficina 809, Miraflores
  - Contacto: Juan Jesús Astete Meza
  - Teléfono: 959271576

- **Campos editables:**
  - Fecha (selector de calendario)
  - Nombre de empresa
  - Proyecto (texto multilínea)
  - Nombre del contacto
  - Correo de contacto

## 🔧 Configuración de Desarrollo

### Puertos por defecto:
- **Frontend:** http://localhost:4200
- **Backend:** http://localhost:3000

### Variables de entorno:
El sistema usa configuraciones por defecto, pero en producción se recomienda:
- Cambiar la clave secreta JWT
- Configurar variables de entorno para la base de datos
- Establecer CORS apropiados para producción

## 🎨 Diseño

El sistema utiliza un esquema de colores moderno:
- **Primario:** #667eea (azul)
- **Secundario:** #764ba2 (púrpura)
- **Gradientes:** Linear gradients para botones y headers
- **UI:** Material Design con componentes de MUI

## 📱 Responsive Design

La aplicación está optimizada para:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🚀 Próximos Pasos

- [ ] Integración con base de datos real
- [ ] Generación de PDFs para cotizaciones
- [ ] Sistema de notificaciones
- [ ] Dashboard con métricas
- [ ] Historial de cotizaciones
- [ ] Roles adicionales de usuario

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para la feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

Desarrollado con ❤️ usando Nx, React y NestJS.
