// Configuración de la API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://tu-proyecto.vercel.app/api'
  : 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  PROFILE: `${API_BASE_URL}/auth/profile`,
  VALIDATE: `${API_BASE_URL}/auth/validate`,
  
  // Operaciones endpoints
  OPERACIONES: `${API_BASE_URL}/auth/operaciones`,
  AREAS: `${API_BASE_URL}/auth/areas`,
  GUARDAR_COTIZACION: `${API_BASE_URL}/auth/guardar-cotizacion`,
  
  // AI endpoints
  ANALIZAR_WEB: `${API_BASE_URL}/auth/analizar-web`,
  ANALIZAR_WEB_AVANZADO: `${API_BASE_URL}/auth/analizar-web-avanzado`,
  ANALIZAR_ESTRUCTURA_WEB: `${API_BASE_URL}/auth/analizar-estructura-web`,
  GENERAR_DESCRIPCION_PROYECTO: `${API_BASE_URL}/auth/generar-descripcion-proyecto`,
  ANALIZAR_TIEMPO_DESARROLLO: `${API_BASE_URL}/auth/analizar-tiempo-desarrollo`,
  MEJORAR_REQUERIMIENTOS: `${API_BASE_URL}/auth/mejorar-requerimientos`,
};

export default API_ENDPOINTS; 