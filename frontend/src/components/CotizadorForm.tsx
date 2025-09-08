import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  SmartToy as RobotIcon,
  Language as LanguageIcon,
  Save as SaveIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import apiClient from '../config/axios';
import API_ENDPOINTS from '../config/api';
import { PDFGeneratorService } from '../services/pdf-generator.service';

interface Caracteristica {
  id: string;
  contenido: string;
}

interface ItemPropuesta {
  id: string;
  descripcion: string;
  monto: number | string;
  descuento: number | string;
  subtotal: number;
  igv: number;
  total: number;
}

interface ServicioAdicional {
  id: string;
  descripcion: string;
  monto: number | string;
  igv: number;
  total: number;
}

const rubros = [
  'Inmobiliario',
  'Retail',
  'Financiero',
  'Mobiliario',
  'Productos',
  'Pet',
  'Restaurante',
  'Otros'
];

const servicios = [
  'Landing',
  'Web Multiproyecto',
  'One Page',
  'Aplicación',
  'E-Commerce',
  'Mejora (solo mostrar el tipo básico)',
  'Bolsa De Horas',
  'Otros'
];

const tipos = ['Básico', 'Complejo'];

const opcionesCRM = ['Sperant', 'Evolta', 'Otros'];

const defaultFormData = {
  formData: {
    fecha: new Date().toISOString().split('T')[0],
    nombreEmpresa: '',
    nombreProyecto: '',
    nombreContacto: '',
    correoContacto: '',
    rubro: '',
    servicio: '',
    tipo: '',
    promptsRequerimientos: '',
    requerimientosMejorados: '',
    servicioNecesidad: '',
    descripcionProyecto: '',
    urlAnalisis: '',
    detallePagina: '',
    duracionProyecto: 'El proyecto tiene una duración estimada de 3 meses (90 días calendario), divididos en sprints de 2 semanas cada uno. Se entregarán avances cada 15 días con revisiones y ajustes según el feedback del cliente.',
    formaPago: '50% al aceptar la propuesta y 50% al recibir el acta de conformidad del servicio y su posterior publicación en producción.',
    crmSeleccionado: '',
    crmOtro: '',
    tiempoAnalizado: ''
  },
  caracteristicas: [
    { id: '1', contenido: 'Diseño responsivo y moderno que se adapte a todos los dispositivos' },
    { id: '2', contenido: 'Optimización SEO para mejorar la visibilidad en motores de búsqueda' },
    { id: '3', contenido: 'Integración con redes sociales y herramientas de marketing digital' },
    { id: '4', contenido: 'Panel de administración intuitivo para gestionar contenido' },
    { id: '5', contenido: 'Sistema de formularios de contacto y captura de leads' },
    { id: '6', contenido: 'Funcionalidades Avanzadas' },
    { id: '7', contenido: 'Imagen Profesional y Credibilidad' }
  ],
  itemsPropuesta: [
    { id: '1', descripcion: 'Diseño UX/UI', monto: '', descuento: '', subtotal: 0, igv: 0, total: 0 },
    { id: '2', descripcion: 'Desarrollo Frontend', monto: '', descuento: '', subtotal: 0, igv: 0, total: 0 },
    { id: '3', descripcion: 'Desarrollo Backend', monto: '', descuento: '', subtotal: 0, igv: 0, total: 0 },
    { id: '4', descripcion: 'Integración con CRM', monto: '', descuento: '', subtotal: 0, igv: 0, total: 0 },
    { id: '5', descripcion: 'Optimización SEO', monto: '', descuento: '', subtotal: 0, igv: 0, total: 0 },
    { id: '6', descripcion: 'Testing y QA', monto: '', descuento: '', subtotal: 0, igv: 0, total: 0 },
    { id: '7', descripcion: 'Despliegue y Configuración', monto: '', descuento: '', subtotal: 0, igv: 0, total: 0 }
  ],
  serviciosAdicionales: [],
  procesosVisibles: {
    procesoUX: true,
    procesoUI: true,
    procesoSEO: true,
    entregables: true,
    maquetacion: true,
    consideraciones: true,
    noIncluye: true
  }
};

// Componente para tarjeta sorteable
interface SortableCardProps {
  caracteristica: Caracteristica;
  index: number;
  onEdit: (id: string, valor: string) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

const SortableCard: React.FC<SortableCardProps> = ({ 
  caracteristica, 
  index, 
  onEdit, 
  onDelete, 
  canDelete 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: caracteristica.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      sx={{ 
        boxShadow: 2,
        cursor: isDragging ? 'grabbing' : 'auto',
        '&:hover': {
          boxShadow: 4,
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
          <IconButton
            size="small"
            sx={{ 
              cursor: 'grab',
              '&:active': { cursor: 'grabbing' },
              color: '#999',
              mt: 0.5
            }}
            {...attributes}
            {...listeners}
          >
            <DragIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#495057' }}>
            Característica {index + 1}
          </Typography>
        </Box>
        <TextField
          multiline
          rows={4}
          fullWidth
          value={caracteristica.contenido}
          onChange={(e) => onEdit(caracteristica.id, e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#667eea',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#667eea',
              },
            },
          }}
        />
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete(caracteristica.id)}
          disabled={!canDelete}
        >
          Eliminar
        </Button>
      </CardActions>
    </Card>
  );
};

// Componente de robot pensando
const RobotThinking: React.FC = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      p: 4 
    }}>
      <Box sx={{ 
        position: 'relative',
        animation: 'bounce 2s infinite',
        '@keyframes bounce': {
          '0%, 20%, 53%, 80%, 100%': {
            transform: 'translate3d(0,0,0)',
          },
          '40%, 43%': {
            transform: 'translate3d(0, -15px, 0)',
          },
          '70%': {
            transform: 'translate3d(0, -7px, 0)',
          },
          '90%': {
            transform: 'translate3d(0, -3px, 0)',
          },
        },
      }}>
        <RobotIcon sx={{ 
          fontSize: 60, 
          color: '#667eea',
          filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))',
        }} />
        <Box sx={{
          position: 'absolute',
          top: -10,
          right: -10,
          animation: 'pulse 1.5s infinite',
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(1)',
              opacity: 1,
            },
            '50%': {
              transform: 'scale(1.2)',
              opacity: 0.7,
            },
            '100%': {
              transform: 'scale(1)',
              opacity: 1,
            },
          },
        }}>
          <CircularProgress size={20} sx={{ color: '#764ba2' }} />
        </Box>
      </Box>
      <Typography variant="h6" sx={{ mt: 2, color: '#667eea', fontWeight: 'bold' }}>
        Analizando estructura web...
      </Typography>
      <Typography variant="body2" sx={{ color: '#6c757d', textAlign: 'center', mt: 1, maxWidth: 300 }}>
        🔍 Detectando secciones existentes<br />
        📋 Identificando contenido faltante<br />
        🎯 Evaluando estructura por sector<br />
        💡 Generando recomendaciones IA
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        mt: 3,
        animation: 'dots 1.5s infinite',
        '@keyframes dots': {
          '0%, 20%': {
            color: '#667eea',
          },
          '50%': {
            color: '#764ba2',
          },
          '80%, 100%': {
            color: '#667eea',
          },
        },
      }}>
        <Box sx={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          backgroundColor: 'currentColor',
          animation: 'dot1 1.5s infinite',
          '@keyframes dot1': {
            '0%, 80%, 100%': { opacity: 0 },
            '40%': { opacity: 1 },
          },
        }} />
        <Box sx={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          backgroundColor: 'currentColor',
          animation: 'dot2 1.5s infinite',
          '@keyframes dot2': {
            '0%, 80%, 100%': { opacity: 0 },
            '40%': { opacity: 1 },
          },
          animationDelay: '0.2s',
        }} />
        <Box sx={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          backgroundColor: 'currentColor',
          animation: 'dot3 1.5s infinite',
          '@keyframes dot3': {
            '0%, 80%, 100%': { opacity: 0 },
            '40%': { opacity: 1 },
          },
          animationDelay: '0.4s',
        }} />
      </Box>
    </Box>
  );
};

// Componente para tarjetas de proceso con botón eliminar
interface ProcessCardProps {
  title: string;
  children: React.ReactNode;
  onDelete: () => void;
}

const ProcessCard: React.FC<ProcessCardProps> = ({ title, children, onDelete }) => {
  return (
    <Paper sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: '#495057', fontWeight: 'bold' }}>
          {title}
        </Typography>
        <IconButton
          size="small"
          color="error"
          onClick={onDelete}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
            },
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
      <Box>{children}</Box>
    </Paper>
  );
};

// Componente específico para mejora de requerimientos
const RobotMejorandoRequerimientos: React.FC = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      p: 4 
    }}>
      <Box sx={{ 
        position: 'relative',
        animation: 'bounce 2s infinite',
        '@keyframes bounce': {
          '0%, 20%, 53%, 80%, 100%': {
            transform: 'translate3d(0,0,0)',
          },
          '40%, 43%': {
            transform: 'translate3d(0, -15px, 0)',
          },
          '70%': {
            transform: 'translate3d(0, -7px, 0)',
          },
          '90%': {
            transform: 'translate3d(0, -3px, 0)',
          },
        },
      }}>
        <RobotIcon sx={{ 
          fontSize: 60, 
          color: '#667eea',
          filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))',
        }} />
        <Box sx={{
          position: 'absolute',
          top: -10,
          right: -10,
          animation: 'pulse 1.5s infinite',
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(1)',
              opacity: 1,
            },
            '50%': {
              transform: 'scale(1.2)',
              opacity: 0.7,
            },
            '100%': {
              transform: 'scale(1)',
              opacity: 1,
            },
          },
        }}>
          <CircularProgress size={20} sx={{ color: '#764ba2' }} />
        </Box>
      </Box>
      <Typography variant="h6" sx={{ mt: 2, color: '#667eea', fontWeight: 'bold' }}>
        Mejorando requerimientos...
      </Typography>
      <Typography variant="body2" sx={{ color: '#6c757d', textAlign: 'center', mt: 1, maxWidth: 300 }}>
        🤖 Analizando requerimientos técnicos<br />
        ✨ Generando características mejoradas<br />
        🎯 Optimizando para el sector<br />
        💡 Aplicando mejores prácticas
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        mt: 3,
        animation: 'dots 1.5s infinite',
        '@keyframes dots': {
          '0%, 20%': {
            color: '#667eea',
          },
          '50%': {
            color: '#764ba2',
          },
          '80%, 100%': {
            color: '#667eea',
          },
        },
      }}>
        <Box sx={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          backgroundColor: 'currentColor',
          animation: 'dot1 1.5s infinite',
          '@keyframes dot1': {
            '0%, 80%, 100%': { opacity: 0 },
            '40%': { opacity: 1 },
          },
        }} />
        <Box sx={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          backgroundColor: 'currentColor',
          animation: 'dot2 1.5s infinite',
          '@keyframes dot2': {
            '0%, 80%, 100%': { opacity: 0 },
            '40%': { opacity: 1 },
          },
          animationDelay: '0.2s',
        }} />
        <Box sx={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          backgroundColor: 'currentColor',
          animation: 'dot3 1.5s infinite',
          '@keyframes dot3': {
            '0%, 80%, 100%': { opacity: 0 },
            '40%': { opacity: 1 },
          },
          animationDelay: '0.4s',
        }} />
      </Box>
    </Box>
  );
};

interface CotizadorFormProps {
  cotizacionToLoad?: any;
  onCotizacionLoaded?: () => void;
}

export const CotizadorForm: React.FC<CotizadorFormProps> = ({ cotizacionToLoad, onCotizacionLoaded }) => {
  // Helper para cargar datos desde localStorage una sola vez
  const getInitialData = () => {
    try {
      const datosGuardados = localStorage.getItem('cotizacionLocal');
      if (datosGuardados) {
        const datos = JSON.parse(datosGuardados);
        return datos;
      }
    } catch (error) {
      console.error('❌ Error al cargar desde localStorage:', error);
    }
    return null;
  };

  const initialData = getInitialData();

  // Inicialización de estados usando los datos cargados
  const [formData, setFormData] = useState(() => {
    return initialData?.formData || defaultFormData.formData;
  });

  const [caracteristicas, setCaracteristicas] = useState<Caracteristica[]>(() => {
    return initialData?.caracteristicas || defaultFormData.caracteristicas;
  });

  const [itemsPropuesta, setItemsPropuesta] = useState<ItemPropuesta[]>(() => {
    return initialData?.itemsPropuesta || defaultFormData.itemsPropuesta;
  });

  const [serviciosAdicionales, setServiciosAdicionales] = useState<ServicioAdicional[]>(() => {
    return initialData?.serviciosAdicionales || defaultFormData.serviciosAdicionales;
  });

  // Hook personalizado para procesosVisibles con localStorage
  const useLocalStorageState = (key: string, defaultValue: any) => {
    const [state, setState] = useState(() => {
      try {
        const storedValue = localStorage.getItem(key);
        return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
      } catch (error) {
        return defaultValue;
      }
    });

    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
  };

  const [procesosVisibles, setProcesosVisibles] = useLocalStorageState('procesosVisibles', defaultFormData.procesosVisibles);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [analizandoWeb, setAnalizandoWeb] = useState(false);
  const [generandoDescripcion, setGenerandoDescripcion] = useState(false);
  const [mejorandoRequerimientos, setMejorandoRequerimientos] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [descripcionProyectoVisible, setDescripcionProyectoVisible] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [guardandoLocal, setGuardandoLocal] = useState(false);
  const [guardadoLocalExitoso, setGuardadoLocalExitoso] = useState(false);
  const [restauracionExitosa, setRestauracionExitosa] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Función para validar el formulario
  const validarFormulario = () => {
    const nuevosErrores: {[key: string]: string} = {};

    // Validar campos requeridos
    if (!formData.fecha.trim()) {
      nuevosErrores.fecha = 'La fecha es requerida';
    }
    if (!formData.nombreEmpresa.trim()) {
      nuevosErrores.nombreEmpresa = 'El nombre de la empresa es requerido';
    }
    if (!formData.nombreProyecto.trim()) {
      nuevosErrores.nombreProyecto = 'El nombre del proyecto es requerido';
    }
    if (!formData.nombreContacto.trim()) {
      nuevosErrores.nombreContacto = 'El nombre del contacto es requerido';
    }
    if (!formData.correoContacto.trim()) {
      nuevosErrores.correoContacto = 'El correo de contacto es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoContacto)) {
      nuevosErrores.correoContacto = 'El correo debe tener un formato válido';
    }
    if (!formData.rubro.trim()) {
      nuevosErrores.rubro = 'El rubro es requerido';
    }
    if (!formData.servicio.trim()) {
      nuevosErrores.servicio = 'El servicio es requerido';
    }
    if (!formData.tipo.trim()) {
      nuevosErrores.tipo = 'El tipo es requerido';
    }
    if (!formData.promptsRequerimientos.trim()) {
      nuevosErrores.promptsRequerimientos = 'Los requerimientos técnicos son requeridos';
    }
    if (!formData.formaPago.trim()) {
      nuevosErrores.formaPago = 'La forma de pago es requerida';
    }
    if (!formData.duracionProyecto.trim()) {
      nuevosErrores.duracionProyecto = 'La duración del proyecto es requerida';
    }

    // Validar que al menos un item de propuesta tenga monto
    const tieneMonto = itemsPropuesta.some(item => 
      (typeof item.monto === 'string' ? item.monto !== '' : item.monto > 0)
    );
    if (!tieneMonto) {
      nuevosErrores.itemsPropuesta = 'Al menos un item de propuesta debe tener un monto';
    }

    // Validar que las características no estén vacías
    const caracteristicasVacias = caracteristicas.some(car => !car.contenido.trim());
    if (caracteristicasVacias) {
      nuevosErrores.caracteristicas = 'Todas las características deben tener contenido';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Cargar datos de cotización cuando se reciben las props (sobrescribe localStorage)
  useEffect(() => {
    if (cotizacionToLoad) {
      try {
        // Cargar datos del formulario
        setFormData(prev => ({
          ...prev,
          fecha: cotizacionToLoad.fecha || '',
          nombreEmpresa: cotizacionToLoad.nombreEmpresa || '',
          nombreProyecto: cotizacionToLoad.nombreProyecto || '',
          nombreContacto: cotizacionToLoad.nombreContacto || '',
          correoContacto: cotizacionToLoad.correoContacto || '',
          rubro: cotizacionToLoad.rubro || '',
          servicio: cotizacionToLoad.servicio || '',
          tipo: cotizacionToLoad.tipo || '',
          promptsRequerimientos: cotizacionToLoad.promptsRequerimientos || '',
          requerimientosMejorados: cotizacionToLoad.requerimientosMejorados || '',
          servicioNecesidad: cotizacionToLoad.servicioNecesidad || '',
          descripcionProyecto: cotizacionToLoad.descripcionProyecto || '',
          urlAnalisis: cotizacionToLoad.urlAnalisis || '',
          detallePagina: cotizacionToLoad.detallePagina || '',
          duracionProyecto: cotizacionToLoad.duracionProyecto || '',
          formaPago: cotizacionToLoad.formaPago || '',
          crmSeleccionado: cotizacionToLoad.crmSeleccionado || '',
          crmOtro: cotizacionToLoad.crmOtro || '',
          tiempoAnalizado: cotizacionToLoad.tiempoAnalizado || ''
        }));

        // Cargar características
        if (cotizacionToLoad.caracteristicas && Array.isArray(cotizacionToLoad.caracteristicas)) {
          setCaracteristicas(cotizacionToLoad.caracteristicas);
        }

        // Cargar items de propuesta
        if (cotizacionToLoad.itemsPropuesta && Array.isArray(cotizacionToLoad.itemsPropuesta)) {
          setItemsPropuesta(cotizacionToLoad.itemsPropuesta);
        }

        // Cargar servicios adicionales
        if (cotizacionToLoad.serviciosAdicionales && Array.isArray(cotizacionToLoad.serviciosAdicionales)) {
          setServiciosAdicionales(cotizacionToLoad.serviciosAdicionales);
        }

        // Cargar procesos visibles - si no existen, usar valores por defecto (todas visibles)
        if (cotizacionToLoad.procesosVisibles && typeof cotizacionToLoad.procesosVisibles === 'object') {
          setProcesosVisibles({
            ...defaultFormData.procesosVisibles, // Empezar con todos los valores por defecto
            ...cotizacionToLoad.procesosVisibles // Sobrescribir solo los que existen
          });
        } else {
          // Si no existe procesosVisibles en la cotización cargada, usar valores por defecto
          setProcesosVisibles(defaultFormData.procesosVisibles);
        }

        // Mostrar mensaje de éxito
        setSuccessMessage('¡Cotización cargada exitosamente desde la base de datos!');
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setSuccessMessage('');
        }, 3000);

        // Notificar que se han cargado los datos
        if (onCotizacionLoaded) {
          onCotizacionLoaded();
        }
      } catch (error) {
        console.error('Error al cargar cotización:', error);
      }
    }
  }, [cotizacionToLoad, onCotizacionLoaded]);

  // Guardar en localStorage cuando cambien los datos (guardado automático)
  useEffect(() => {
    // Solo guardar si no estamos cargando datos desde cotizacionToLoad
    if (!cotizacionToLoad) {
      const datosParaGuardar = {
        formData,
        caracteristicas,
        itemsPropuesta,
        serviciosAdicionales,
        procesosVisibles,
        fechaGuardado: new Date().toISOString()
      };
      localStorage.setItem('cotizacionLocal', JSON.stringify(datosParaGuardar));
    }
  }, [formData, caracteristicas, itemsPropuesta, serviciosAdicionales, procesosVisibles, cotizacionToLoad]);

  // Función para guardar en localStorage
  const guardarEnLocalStorage = () => {
    setGuardandoLocal(true);
    try {
      const datosParaGuardar = {
        formData,
        caracteristicas,
        itemsPropuesta,
        serviciosAdicionales,
        procesosVisibles,
        fechaGuardado: new Date().toISOString()
      };
      localStorage.setItem('cotizacionLocal', JSON.stringify(datosParaGuardar));
      setGuardadoLocalExitoso(true);
      setTimeout(() => setGuardadoLocalExitoso(false), 3000);
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
      setError('Error al guardar localmente');
    } finally {
      setGuardandoLocal(false);
    }
  };

  // Cargar datos de cotización cuando se reciben las props
  useEffect(() => {
    if (cotizacionToLoad) {
      try {
        // Cargar datos del formulario
        setFormData(prev => ({
          ...prev,
          fecha: cotizacionToLoad.fecha || '',
          nombreEmpresa: cotizacionToLoad.nombreEmpresa || '',
          nombreProyecto: cotizacionToLoad.nombreProyecto || '',
          nombreContacto: cotizacionToLoad.nombreContacto || '',
          correoContacto: cotizacionToLoad.correoContacto || '',
          rubro: cotizacionToLoad.rubro || '',
          servicio: cotizacionToLoad.servicio || '',
          tipo: cotizacionToLoad.tipo || '',
          promptsRequerimientos: cotizacionToLoad.promptsRequerimientos || '',
          requerimientosMejorados: cotizacionToLoad.requerimientosMejorados || '',
          servicioNecesidad: cotizacionToLoad.servicioNecesidad || '',
          descripcionProyecto: cotizacionToLoad.descripcionProyecto || '',
          urlAnalisis: cotizacionToLoad.urlAnalisis || '',
          detallePagina: cotizacionToLoad.detallePagina || '',
          duracionProyecto: cotizacionToLoad.duracionProyecto || '',
          formaPago: cotizacionToLoad.formaPago || '',
          crmSeleccionado: cotizacionToLoad.crmSeleccionado || '',
          crmOtro: cotizacionToLoad.crmOtro || '',
          tiempoAnalizado: cotizacionToLoad.tiempoAnalizado || ''
        }));

        // Cargar características
        if (cotizacionToLoad.caracteristicas && Array.isArray(cotizacionToLoad.caracteristicas)) {
          setCaracteristicas(cotizacionToLoad.caracteristicas);
        }

        // Cargar items de propuesta
        if (cotizacionToLoad.itemsPropuesta && Array.isArray(cotizacionToLoad.itemsPropuesta)) {
          setItemsPropuesta(cotizacionToLoad.itemsPropuesta);
        }

        // Cargar servicios adicionales
        if (cotizacionToLoad.serviciosAdicionales && Array.isArray(cotizacionToLoad.serviciosAdicionales)) {
          setServiciosAdicionales(cotizacionToLoad.serviciosAdicionales);
        }
        
        // Mostrar mensaje de éxito
        setSuccessMessage('¡Cotización cargada exitosamente desde la base de datos!');
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setSuccessMessage('');
        }, 3000);

        // Notificar que se han cargado los datos
        if (onCotizacionLoaded) {
          onCotizacionLoaded();
        }
      } catch (error) {
        console.error('Error al cargar cotización:', error);
      }
    }
  }, [cotizacionToLoad, onCotizacionLoaded]);

  // Función para calcular valores de items de propuesta
  const calcularItemPropuesta = (monto: number | string, descuento: number | string): Partial<ItemPropuesta> => {
    const montoValue = typeof monto === 'string' ? (monto === '' ? 0 : Number(monto)) : monto;
    const descuentoValue = typeof descuento === 'string' ? (descuento === '' ? 0 : Number(descuento)) : descuento;
    const montoNum = isNaN(montoValue) ? 0 : montoValue;
    const descuentoNum = isNaN(descuentoValue) ? 0 : descuentoValue;
    const subtotal = montoNum - descuentoNum;
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    return { subtotal, igv, total };
  };

  // Función para calcular valores de servicios adicionales
  const calcularServicioAdicional = (monto: number | string): Partial<ServicioAdicional> => {
    const montoValue = typeof monto === 'string' ? (monto === '' ? 0 : Number(monto)) : monto;
    const montoNum = isNaN(montoValue) ? 0 : montoValue;
    const igv = montoNum * 0.18;
    const total = montoNum + igv;
    return { igv, total };
  };

  // Manejar cambios en items de propuesta
  const handleItemPropuestaChange = (id: string, field: keyof ItemPropuesta, value: string | number) => {
    setItemsPropuesta(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalcular cuando cambien monto o descuento
        if (field === 'monto' || field === 'descuento') {
          const montoValue = field === 'monto' ? value : updatedItem.monto;
          const descuentoValue = field === 'descuento' ? value : updatedItem.descuento;
          const calculatedValues = calcularItemPropuesta(montoValue, descuentoValue);
          return { ...updatedItem, ...calculatedValues };
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  // Manejar cambios en servicios adicionales
  const handleServicioAdicionalChange = (id: string, field: keyof ServicioAdicional, value: string | number) => {
    setServiciosAdicionales(prev => prev.map(servicio => {
      if (servicio.id === id) {
        const updatedServicio = { ...servicio, [field]: value };
        
        // Recalcular cuando cambie el monto
        if (field === 'monto') {
          const calculatedValues = calcularServicioAdicional(value);
          return { ...updatedServicio, ...calculatedValues };
        }
        
        return updatedServicio;
      }
      return servicio;
    }));
  };

  // Agregar nuevo item de propuesta
  const agregarItemPropuesta = () => {
    const nuevoItem: ItemPropuesta = {
      id: `item-${Date.now()}`,
      descripcion: '',
      monto: '',
      descuento: '',
      subtotal: 0,
      igv: 0,
      total: 0
    };
    setItemsPropuesta(prev => [...prev, nuevoItem]);
  };

  // Eliminar item de propuesta
  const eliminarItemPropuesta = (id: string) => {
    setItemsPropuesta(prev => prev.filter(item => item.id !== id));
  };

  // Agregar nuevo servicio adicional
  const agregarServicioAdicional = () => {
    const nuevoServicio: ServicioAdicional = {
      id: `servicio-${Date.now()}`,
      descripcion: '',
      monto: '',
      igv: 0,
      total: 0
    };
    setServiciosAdicionales(prev => [...prev, nuevoServicio]);
  };

  // Eliminar servicio adicional
  const eliminarServicioAdicional = (id: string) => {
    setServiciosAdicionales(prev => prev.filter(servicio => servicio.id !== id));
  };

  // Calcular totales generales
  const calcularTotales = () => {
    const totalPropuesta = itemsPropuesta.reduce((sum, item) => sum + item.total, 0);
    const totalServicios = serviciosAdicionales.reduce((sum, servicio) => sum + servicio.total, 0);
    const granTotal = totalPropuesta + totalServicios;
    
    return {
      totalPropuesta: totalPropuesta.toFixed(2),
      totalServicios: totalServicios.toFixed(2),
      granTotal: granTotal.toFixed(2)
    };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setCaracteristicas((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleChange = (field: string) => async (event: any) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Generar texto automático cuando se selecciona rubro y servicio
    if (field === 'rubro' || field === 'servicio') {
      const newFormData = { ...formData, [field]: value };
      if (newFormData.rubro && newFormData.servicio) {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          servicioNecesidad: generarTextoServicio(newFormData.rubro, newFormData.servicio)
        }));
        
        // Generar descripción del proyecto automáticamente cuando se seleccionen rubro y servicio
        generarDescripcionProyecto(newFormData.rubro, newFormData.servicio);
      } else {
        // Si no están todos los campos, ocultar el textarea
        setDescripcionProyectoVisible(false);
        setFormData(prev => ({
          ...prev,
          descripcionProyecto: ''
        }));
      }
    }

    // Limpiar campo "Otros" cuando se cambie la selección de CRM
    if (field === 'crmSeleccionado' && value !== 'Otros') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        crmOtro: ''
      }));
    }
  };

  const analizarEstructuraWeb = async () => {
    if (!formData.urlAnalisis) {
      alert('Por favor ingresa una URL para analizar');
      return;
    }

    if (!formData.rubro || !formData.servicio || !formData.tipo) {
      alert('Por favor selecciona el rubro, servicio y tipo antes de analizar la web');
      return;
    }

    setAnalizandoWeb(true);
    
    try {
      const response = await apiClient.post(API_ENDPOINTS.ANALIZAR_ESTRUCTURA_WEB, {
        url: formData.urlAnalisis,
        rubro: formData.rubro,
        servicio: formData.servicio,
        tipo: formData.tipo
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        const structureData = response.data.data;
        
        // Mostrar solo el análisis en el formato específico solicitado
        setFormData(prev => ({
          ...prev,
          detallePagina: structureData.overall_analysis
        }));
      } else {
        // En caso de error, usar los datos del fallback
        setFormData(prev => ({
          ...prev,
          detallePagina: response.data.data.overall_analysis
        }));
      }
    } catch (error) {
      console.error('Error al analizar web:', error);
      setFormData(prev => ({
        ...prev,
        detallePagina: `Error al analizar la estructura de la página web: ${formData.urlAnalisis}

No fue posible conectar con el sitio web especificado. Esto puede deberse a:
• El sitio web no está disponible o accesible públicamente
• Problemas de conectividad temporal
• Restricciones de acceso del servidor
• URL incorrecta o incompleta

RECOMENDACIONES GENERALES PARA ${formData.rubro.toUpperCase()} - ${formData.servicio.toUpperCase()}:

Para maximizar el potencial de su sitio web en el sector ${formData.rubro.toLowerCase()}, considere implementar las siguientes secciones:

📋 SECCIONES ESENCIALES:
• Inicio (Home) con navegación clara y formulario de contacto
• Sección de proyectos o productos con galería
• Página de contacto con información completa
• Sección "Nosotros" con historia y valores de la empresa

🔧 FUNCIONALIDADES ESPECÍFICAS DEL SECTOR:
${formData.rubro === 'Inmobiliario' ? 
  '• Galería de propiedades con filtros avanzados\n• Calculadora de préstamos\n• Sistema de reservas online\n• Tours virtuales' :
  formData.rubro === 'Retail' ? 
  '• Catálogo de productos con carrito de compras\n• Sistema de pagos online\n• Reviews y ratings\n• Programa de lealtad' :
  '• Calculadoras financieras\n• Simuladores de crédito\n• Dashboard personalizado\n• Sistema de seguridad 2FA'}

Una estructura web optimizada mejorará significativamente la experiencia del usuario y la conversión de visitantes en clientes potenciales.

Por favor, verifique la URL e intente nuevamente.`
      }));
    } finally {
      setAnalizandoWeb(false);
    }
  };

  // Analizar tiempo de desarrollo al cargar el componente
  useEffect(() => {
    // Removed tiempoDesarrollo functionality
  }, []);

  const generarTextoServicio = (rubro: string, servicio: string): string => {
    const textos: { [key: string]: { [key: string]: string } } = {
      'Inmobiliario': {
        'Landing': 'En un mercado inmobiliario en constante evolución, la presencia en línea se ha convertido en un elemento indispensable para el éxito y la competitividad de las empresas del sector. En este contexto, la implementación de una nueva página web completa no solo responde a una necesidad operativa, sino que representa una oportunidad estratégica para destacar y posicionarse de manera efectiva en el mercado.',
        'E-Commerce': 'El sector inmobiliario requiere una plataforma de comercio electrónico robusta que permita a los clientes explorar, comparar y adquirir propiedades de manera eficiente y segura.',
        'Aplicación': 'Una aplicación móvil especializada para el sector inmobiliario facilitará la búsqueda de propiedades, visualización de tours virtuales y comunicación directa con agentes.'
      },
      'Retail': {
        'E-Commerce': 'En el competitivo mundo del retail, una plataforma de comercio electrónico moderna es esencial para captar clientes, mostrar productos de manera atractiva y facilitar las ventas online.',
        'Landing': 'Una página web efectiva para retail debe combinar diseño atractivo con funcionalidad comercial, creando una experiencia que convierta visitantes en compradores.',
        'Aplicación': 'Una aplicación móvil para retail permite a los clientes acceder fácilmente al catálogo, realizar compras y recibir notificaciones sobre ofertas especiales.'
      },
      'Financiero': {
        'Landing': 'En el sector financiero, la confianza y seguridad son primordiales. Una página web profesional debe transmitir estos valores mientras facilita el acceso a servicios financieros.',
        'Aplicación': 'Una aplicación financiera segura permite a los usuarios gestionar sus finanzas, realizar transacciones y acceder a servicios bancarios de manera conveniente.',
        'Web Multiproyecto': 'Un ecosistema web completo para servicios financieros que integre múltiples productos y servicios bajo una marca cohesiva.'
      }
    };

    return textos[rubro]?.[servicio] || `En el sector ${rubro.toLowerCase()}, la implementación de ${servicio.toLowerCase()} representa una oportunidad estratégica para mejorar la presencia digital y optimizar la experiencia del cliente, adaptándose a las demandas actuales del mercado.`;
  };

  const generarDescripcionProyecto = async (rubro: string, servicio: string) => {
    setGenerandoDescripcion(true);
    setDescripcionProyectoVisible(false);
    
    try {
      const response = await apiClient.post(API_ENDPOINTS.GENERAR_DESCRIPCION_PROYECTO, {
        rubro,
        servicio
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data && response.data.descripcion) {
        setFormData(prev => ({
          ...prev,
          descripcionProyecto: response.data.descripcion
        }));
      } else {
        // Si no hay respuesta, limpiar el campo
        setFormData(prev => ({
          ...prev,
          descripcionProyecto: ''
        }));
      }
    } catch (error) {
      console.error('Error generando descripción del proyecto:', error);
      // En caso de error, limpiar el campo
      setFormData(prev => ({
        ...prev,
        descripcionProyecto: ''
      }));
    } finally {
      setGenerandoDescripcion(false);
      setDescripcionProyectoVisible(true);
    }
  };

  const mejorarRequerimientos = async () => {
    if (!formData.promptsRequerimientos.trim()) {
      alert('Por favor, ingrese los requerimientos técnicos antes de mejorarlos.');
      return;
    }

    setMejorandoRequerimientos(true);
    try {
      const response = await apiClient.post(API_ENDPOINTS.MEJORAR_REQUERIMIENTOS, {
        requerimientos: formData.promptsRequerimientos,
        rubro: formData.rubro,
        servicio: formData.servicio
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data && response.data.requerimientosMejorados) {
        setFormData(prev => ({
          ...prev,
          requerimientosMejorados: response.data.requerimientosMejorados
        }));
      }
    } catch (error) {
      console.error('Error mejorando requerimientos:', error);
      alert('Error al mejorar los requerimientos. Por favor, intente nuevamente.');
    } finally {
      setMejorandoRequerimientos(false);
    }
  };

  const handleCaracteristicaChange = (id: string, valor: string) => {
    setCaracteristicas(prev => 
      prev.map(item => 
        item.id === id ? { ...item, contenido: valor } : item
      )
    );
  };

  const agregarCaracteristica = () => {
    const nuevaCaracteristica: Caracteristica = {
      id: `caracteristica-${Date.now()}`,
      contenido: ''
    };
    setCaracteristicas(prev => [...prev, nuevaCaracteristica]);
  };

  const eliminarCaracteristica = (id: string) => {
    setCaracteristicas(prev => prev.filter(item => item.id !== id));
  };

  // Función para alternar visibilidad de procesos
  const toggleProcesoVisibilidad = (proceso: keyof typeof procesosVisibles) => {
    setProcesosVisibles((prev: any) => ({
      ...prev,
      [proceso]: !prev[proceso]
    }));
  };

  // Función para restaurar todas las tarjetas eliminables
  const restaurarTodasLasTarjetas = () => {
    setProcesosVisibles(defaultFormData.procesosVisibles);
  };

  // Función para restaurar completamente el formulario
  const restaurarFormularioCompleto = () => {
    // Limpiar localStorage
    localStorage.removeItem('cotizacionLocal');
    localStorage.removeItem('procesosVisibles');
    
    // Restaurar todos los estados a sus valores por defecto
    setFormData(defaultFormData);
    setCaracteristicas(defaultFormData.caracteristicas);
    setItemsPropuesta(defaultFormData.itemsPropuesta);
    setServiciosAdicionales(defaultFormData.serviciosAdicionales);
    setProcesosVisibles(defaultFormData.procesosVisibles);
    
    // Limpiar estados de UI
    setError('');
    setErrors({});
    setDescripcionProyectoVisible(false);
    setGenerandoDescripcion(false);
    
    // Mostrar mensaje de confirmación
    setRestauracionExitosa(true);
    setTimeout(() => setRestauracionExitosa(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulario antes de proceder
    if (!validarFormulario()) {
      setError('Por favor, complete todos los campos requeridos correctamente.');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    try {
      // Preparar datos para el PDF
      const cotizacionData = {
        fecha: formData.fecha,
        nombreEmpresa: formData.nombreEmpresa,
        nombreProyecto: formData.nombreProyecto,
        nombreContacto: formData.nombreContacto,
        correoContacto: formData.correoContacto,
        rubro: formData.rubro,
        servicio: formData.servicio,
        tipo: formData.tipo,
        promptsRequerimientos: formData.promptsRequerimientos,
        requerimientosMejorados: formData.requerimientosMejorados,
        servicioNecesidad: formData.servicioNecesidad,
        descripcionProyecto: formData.descripcionProyecto,
        urlAnalisis: formData.urlAnalisis,
        detallePagina: formData.detallePagina,
        duracionProyecto: formData.duracionProyecto,
        formaPago: formData.formaPago,
        crmSeleccionado: formData.crmSeleccionado,
        crmOtro: formData.crmOtro,
        caracteristicas: caracteristicas,
        itemsPropuesta: itemsPropuesta,
        serviciosAdicionales: serviciosAdicionales,
        tiempoAnalizado: formData.tiempoAnalizado,
        procesosVisibles: procesosVisibles
      };

      // Generar PDF
      await PDFGeneratorService.generateCotizacionPDF(cotizacionData);
      
      console.log('Datos del formulario:', cotizacionData);
      setSuccessMessage('¡Cotización PDF generada y descargada exitosamente!');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  };

  const enviarCotizacion = async () => {
    // Validar formulario antes de proceder
    if (!validarFormulario()) {
      setError('Por favor, complete todos los campos requeridos correctamente.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setGuardando(true);
    try {
      const token = localStorage.getItem('token');

      const nombreCotizacion = formData.nombreEmpresa
        ? `Cotización - ${formData.nombreEmpresa}`
        : 'Cotización sin nombre';

      const cotizacionData = {
        nombre: nombreCotizacion,
        data: {
          ...formData,
          caracteristicas: caracteristicas,
          itemsPropuesta: itemsPropuesta,
          serviciosAdicionales: serviciosAdicionales,
          procesosVisibles: procesosVisibles,
        requerimientosMejorados: formData.requerimientosMejorados,
          fechaCreacion: new Date().toISOString()
        }
      };

      const response = await apiClient.post(API_ENDPOINTS.GUARDAR_COTIZACION, cotizacionData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201) {
        localStorage.clear();
        setFormData(defaultFormData);
      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 3000);
      }
    } catch (error) {
      console.error('Error enviando cotización:', error);
      setError('Error al enviar la cotización');
    } finally {
      setGuardando(false);
    }
  };

  const totales = calcularTotales();

  return (
    <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          background: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 4, 
            color: '#333',
            fontWeight: 'bold',
            textAlign: 'center',
            borderBottom: '2px solid #667eea',
            pb: 2
          }}
        >
          Cotizador
        </Typography>

        <Paper 
          sx={{ 
            p: 3, 
            mb: 4, 
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: 2
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              color: '#495057',
              fontWeight: 'bold'
            }}
          >
            Datos basicos del proyecto:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 300px' }}>
              <Typography variant="body1" sx={{ mb: 1, color: '#6c757d' }}>
                <strong>Razón Social:</strong> Alavista Lab SAC
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, color: '#6c757d' }}>
                <strong>RUC:</strong> 20607124711
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, color: '#6c757d' }}>
                <strong>Dirección:</strong> Av. Benavides 2975, Oficina 809, Miraflores
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 300px' }}>
              <Typography variant="body1" sx={{ mb: 1, color: '#6c757d' }}>
                <strong>Contacto:</strong> Juan Jesús Astete Meza
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, color: '#6c757d' }}>
                <strong>Teléfono:</strong> 959271576
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Fecha"
                type="date"
                variant="outlined"
                value={formData.fecha}
                onChange={handleChange('fecha')}
                error={!!errors.fecha}
                helperText={errors.fecha}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  flex: '1 1 200px',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

              <TextField
                label="Nombre de empresa"
                variant="outlined"
                value={formData.nombreEmpresa}
                onChange={handleChange('nombreEmpresa')}
                error={!!errors.nombreEmpresa}
                helperText={errors.nombreEmpresa}
                required
                sx={{
                  flex: '1 1 200px',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

              <TextField
                label="Nombre del proyecto"
                variant="outlined"
                value={formData.nombreProyecto}
                onChange={handleChange('nombreProyecto')}
                error={!!errors.nombreProyecto}
                helperText={errors.nombreProyecto}
                required
                sx={{
                  flex: '1 1 200px',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Nombre del contacto"
                variant="outlined"
                value={formData.nombreContacto}
                onChange={handleChange('nombreContacto')}
                error={!!errors.nombreContacto}
                helperText={errors.nombreContacto}
                required
                sx={{
                  flex: '1 1 250px',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

              <TextField
                label="Correo de contacto"
                variant="outlined"
                type="email"
                value={formData.correoContacto}
                onChange={handleChange('correoContacto')}
                error={!!errors.correoContacto}
                helperText={errors.correoContacto}
                required
                sx={{
                  flex: '1 1 250px',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Box>

            {/* Combos reorganizados */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ flex: '1 1 200px' }} error={!!errors.rubro} required>
                <InputLabel>Rubro</InputLabel>
                <Select
                  value={formData.rubro}
                  label="Rubro"
                  onChange={handleChange('rubro')}
                  sx={{
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                  }}
                >
                  {rubros.map((rubro) => (
                    <MenuItem key={rubro} value={rubro}>
                      {rubro}
                    </MenuItem>
                  ))}
                </Select>
                {errors.rubro && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.rubro}
                  </Typography>
                )}
              </FormControl>

              <FormControl sx={{ flex: '1 1 200px' }} error={!!errors.servicio} required>
                <InputLabel>Servicio</InputLabel>
                <Select
                  value={formData.servicio}
                  label="Servicio"
                  onChange={handleChange('servicio')}
                  sx={{
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                  }}
                >
                  {servicios.map((servicio) => (
                    <MenuItem key={servicio} value={servicio}>
                      {servicio}
                    </MenuItem>
                  ))}
                </Select>
                {errors.servicio && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.servicio}
                  </Typography>
                )}
              </FormControl>

              <FormControl sx={{ flex: '1 1 200px' }} error={!!errors.tipo} required>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.tipo}
                  label="Tipo"
                  onChange={handleChange('tipo')}
                  sx={{
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                  }}
                >
                  {tipos.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </Select>
                {errors.tipo && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.tipo}
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* Descripción del proyecto */}
            {descripcionProyectoVisible && (
            <TextField
              label="Descripción del proyecto"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={formData.descripcionProyecto}
              onChange={handleChange('descripcionProyecto')}
              placeholder="Descripción detallada del proyecto..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            />
            )}

            {/* Animación de procesamiento para descripción del proyecto */}
            {generandoDescripcion && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 3,
                border: '2px dashed #667eea',
                borderRadius: 2,
                backgroundColor: '#f8f9fa'
              }}>
                <Box sx={{
                  position: 'relative',
                  animation: 'bounce 2s infinite',
                  '@keyframes bounce': {
                    '0%, 20%, 53%, 80%, 100%': {
                      transform: 'translate3d(0,0,0)',
                    },
                    '40%, 43%': {
                      transform: 'translate3d(0, -15px, 0)',
                    },
                    '70%': {
                      transform: 'translate3d(0, -7px, 0)',
                    },
                    '90%': {
                      transform: 'translate3d(0, -3px, 0)',
                    },
                  },
                }}>
                  <RobotIcon sx={{
                    fontSize: 50,
                    color: '#667eea',
                    filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))',
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    animation: 'pulse 1.5s infinite',
                    '@keyframes pulse': {
                      '0%': {
                        transform: 'scale(1)',
                        opacity: 1,
                      },
                      '50%': {
                        transform: 'scale(1.2)',
                        opacity: 0.7,
                      },
                      '100%': {
                        transform: 'scale(1)',
                        opacity: 1,
                      },
                    },
                  }}>
                    <CircularProgress size={16} sx={{ color: '#764ba2' }} />
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ mt: 2, color: '#667eea', fontWeight: 'bold' }}>
                  Generando descripción del proyecto...
                </Typography>
                <Typography variant="body2" sx={{ color: '#6c757d', textAlign: 'center', mt: 1, maxWidth: 300 }}>
                  🤖 Analizando requerimientos<br />
                  ✨ Generando descripción personalizada<br />
                  🎯 Adaptando al sector {formData.rubro}<br />
                  💡 Optimizando para {formData.servicio}
                </Typography>
              </Box>
            )}

            {/* Campo de prompts de requerimientos técnicos - siempre visible */}
              <Box>
                <TextField
                label="Prompt de requerimientos técnicos"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.promptsRequerimientos}
                  onChange={handleChange('promptsRequerimientos')}
                error={!!errors.promptsRequerimientos}
                helperText={errors.promptsRequerimientos}
                required
                placeholder="Ingrese los requerimientos técnicos del proyecto..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                />
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    onClick={mejorarRequerimientos}
                    variant="contained"
                    startIcon={<RobotIcon />}
                    disabled={mejorandoRequerimientos}
                    sx={{
                      backgroundColor: '#667eea',
                      '&:hover': {
                        backgroundColor: '#5a6fd8',
                      },
                      '&:disabled': {
                        backgroundColor: '#ccc',
                      },
                    }}
                  >
                    {mejorandoRequerimientos ? 'Mejorando...' : 'Mejorar con IA'}
                  </Button>
                </Box>

                {/* Card con resultado mejorado */}
                {formData.requerimientosMejorados && (
                  <Card sx={{ mt: 3, backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: '#495057', fontWeight: 'bold' }}>
                        Requerimientos Técnicos Mejorados:
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.requerimientosMejorados}
                        onChange={handleChange('requerimientosMejorados')}
                        placeholder="Requerimientos técnicos mejorados..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            },
                          },
                        }}
                      />
                    </CardContent>
                  </Card>
                )}
              </Box>

            {/* Texto fijo */}
            <Paper sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ color: '#495057', lineHeight: 1.6 }}>
                Señores "<strong>{formData.nombreEmpresa || '[NOMBRE DE LA EMPRESA]'}</strong>"<br />
                De nuestra especial consideración:<br /><br />
                Luego de extenderle un cordial saludo por medio de la presente, tenemos el agrado de hacerles llegar nuestra propuesta para atender su requerimiento.
              </Typography>
            </Paper>

            {/* Sección de Características */}
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#333',
                  fontWeight: 'bold',
                  mb: 3,
                }}
              >
                PRINCIPALES CARACTERÍSTICAS A IMPLEMENTAR
              </Typography>
              
              {errors.caracteristicas && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.caracteristicas}
                </Alert>
              )}

              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={caracteristicas.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {caracteristicas.map((caracteristica, index) => (
                      <SortableCard
                        key={caracteristica.id}
                        caracteristica={caracteristica}
                        index={index}
                        onEdit={handleCaracteristicaChange}
                        onDelete={eliminarCaracteristica}
                        canDelete={caracteristicas.length > 1}
                      />
                    ))}
                  </Box>
                </SortableContext>
              </DndContext>

              {/* Botón agregar al final */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  onClick={agregarCaracteristica}
                  startIcon={<AddIcon />}
                  variant="outlined"
                  sx={{
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#5a6fd8',
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                    },
                  }}
                >
                  Agregar Característica
                </Button>
              </Box>
            </Box>

            {/* Contenido fijo adicional */}
            <Divider sx={{ my: 3 }} />
            
            {/* Botón para restaurar tarjetas eliminables */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3 }}>
              <Button
                variant="outlined"
                onClick={restaurarTodasLasTarjetas}
                sx={{
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5a6fd8',
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  },
                }}
              >
                🔄 Restaurar todas las secciones de proceso
              </Button>
              {/* Indicador de tarjetas ocultas */}
              {Object.values(procesosVisibles).some(visible => !visible) && (
                <Chip
                  label={`${Object.values(procesosVisibles).filter(visible => !visible).length} sección(es) oculta(s)`}
                  color="warning"
                  size="small"
                />
              )}
            </Box>
            
            {/* Proceso del Diseño UX */}
            {procesosVisibles.procesoUX && (
              <ProcessCard
                title="Proceso del Diseño UX:"
                onDelete={() => toggleProcesoVisibilidad('procesoUX')}
              >
              <Box sx={{ color: '#6c757d', lineHeight: 1.6 }}>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span><strong>Investigación:</strong> Conocimiento de las necesidades del usuario</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span><strong>Evaluación:</strong> Evaluaciones heurísticas, benchmarks, pruebas de usabilidad</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span><strong>Arquitectura navegación:</strong> Flujo (mapa) de la información</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span><strong>Arquitectura de cada una de las páginas:</strong> Wireframes (prototipo navegable)</span>
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span><strong>Presentación</strong></span>
                </Typography>
              </Box>
              </ProcessCard>
            )}

            {/* Proceso del Diseño UI */}
            {procesosVisibles.procesoUI && (
              <ProcessCard
                title="Proceso del Diseño UI:"
                onDelete={() => toggleProcesoVisibilidad('procesoUI')}
              >
              <Box sx={{ color: '#6c757d', lineHeight: 1.6 }}>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Diseño de interacción.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Guías de interacción.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Diseño de elementos: botones, documentos, etc.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Diseño visual: iconos, imágenes, ilustraciones.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Guías de estilo: paletas de colores, tipografías.</span>
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Diseño de cada una de las páginas: Prototipo navegable web y móvil.</span>
                </Typography>
              </Box>
              </ProcessCard>
            )}

            {/* Proceso de Análisis SEO */}
            {procesosVisibles.procesoSEO && (
              <ProcessCard
                title="Proceso de Análisis SEO:"
                onDelete={() => toggleProcesoVisibilidad('procesoSEO')}
              >
              <Box sx={{ color: '#6c757d', lineHeight: 1.6 }}>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Análisis, búsqueda y creación de Keywords para posicionamiento web.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Correcto nombramiento de archivos.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Nomenclatura de páginas internas y proyectos.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Detalle de Metatags.</span>
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Listado de Inlinks y outlinks.</span>
                </Typography>
              </Box>
              </ProcessCard>
            )}

            {/* Entregables */}
            {procesosVisibles.entregables && (
              <ProcessCard
                title="Entregables:"
                onDelete={() => toggleProcesoVisibilidad('entregables')}
              >
              <Box sx={{ color: '#6c757d', lineHeight: 1.6 }}>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Diseño navegable en Figma.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Guía de estilos.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Exportación de elementos visuales en .svg .webp .png .jpg</span>
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Informe SEO con listado de palabras, tags, keywords por proyecto.</span>
                </Typography>
              </Box>
              </ProcessCard>
            )}

            {/* Maquetación web y mobile */}
            {procesosVisibles.maquetacion && (
              <ProcessCard
                title="Maquetación web y mobile:"
                onDelete={() => toggleProcesoVisibilidad('maquetacion')}
              >
              <Box sx={{ color: '#6c757d', lineHeight: 1.6 }}>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Implementación del diseño web y mobile en ambiente de desarrollo.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Integración de leads desde todos los formularios a CRM</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Implementación y optimización SEO básica para mejorar la visibilidad del sitio web en los motores de búsqueda.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Integración de Google Analytics para el seguimiento y análisis del tráfico web.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Implementación de mapa de calor con Clarity.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>QA, pruebas unitarias y performance.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Pase a producción.</span>
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Implementación de un sistema de gestión de contenido (CMS) para facilitar la administración y actualización del sitio web.</span>
                </Typography>
              </Box>
              </ProcessCard>
            )}

            {/* Consideraciones */}
            {procesosVisibles.consideraciones && (
              <Paper sx={{ p: 3, backgroundColor: '#fff3cd', borderRadius: 2, border: '1px solid #ffeaa7', position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#856404', fontWeight: 'bold' }}>
                Consideraciones:
              </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => toggleProcesoVisibilidad('consideraciones')}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              <Box sx={{ color: '#856404', lineHeight: 1.6 }}>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Deberá proveer la redacción del contenido de la página web.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Deberá proveer un banco de fotos, vídeos e imágenes en alta calidad o en formatos de edición.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Deberá proveer las ilustraciones de personajes, mascotas u otros que se desee incluir en el diseño.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>El diseño y desarrollo solo considera el idioma español.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Soporte técnico y mantenimiento básico durante un período inicial de 12 meses después del lanzamiento del sitio web.</span>
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>El costo final y el tiempo de entrega están sujetos a cambios según los requisitos adicionales del cliente y los ajustes solicitados durante el proceso de desarrollo.</span>
                </Typography>
              </Box>
            </Paper>
            )}

            {/* No incluye */}
            {procesosVisibles.noIncluye && (
              <Paper sx={{ p: 3, backgroundColor: '#f8d7da', borderRadius: 2, border: '1px solid #f5c6cb', position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#721c24', fontWeight: 'bold' }}>
                No incluye:
              </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => toggleProcesoVisibilidad('noIncluye')}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              <Box sx={{ color: '#721c24', lineHeight: 1.6 }}>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Toma de Fotografía, creación o edición de videos.</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Redacción de contenido.</span>
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ marginRight: '8px', marginTop: '2px' }}>•</span>
                  <span>Diseño de Ilustraciones e imágenes.</span>
                </Typography>
              </Box>
            </Paper>
            )}

            {/* Nueva sección: Estructura propuesta del sitio web */}
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#333',
                  fontWeight: 'bold',
                  mb: 3,
                }}
              >
                Estructura propuesta del sitio web
              </Typography>

              {/* Input URL con botón Analizar */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 3 }}>
                <TextField
                  label="URL del sitio web (opcional)"
                  variant="outlined"
                  placeholder="https://ejemplo.com"
                  value={formData.urlAnalisis}
                  onChange={handleChange('urlAnalisis')}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        🌐
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={analizarEstructuraWeb}
                  disabled={analizandoWeb || !formData.urlAnalisis}
                  startIcon={analizandoWeb ? null : <LanguageIcon />}
                  sx={{
                    py: 1.8,
                    px: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    },
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    minWidth: '140px',
                  }}
                >
                  {analizandoWeb ? 'Analizando...' : 'Analizar web'}
                </Button>
              </Box>

              {/* Textarea para detalle de la página */}
              <TextField
                label="Detalle de la página (opcional)"
                variant="outlined"
                fullWidth
                multiline
                rows={6}
                value={formData.detallePagina}
                onChange={handleChange('detallePagina')}
                placeholder="Descripción del análisis de la estructura actual del sitio web..."
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Box>

            {/* Nueva sección: Agregar otros servicios */}
            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: '#333',
                  fontWeight: 'bold',
                  mb: 3,
                }}
              >
                Agregar otros servicios
              </Typography>
            </Box>

              {/* Campos fijos de integración con combobox CRM */}
              <Paper sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#495057', fontWeight: 'bold' }}>
                  INTEGRACIÓN:
                </Typography>
                <Box sx={{ color: '#6c757d', lineHeight: 1.8, mb: 3 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Integración de leads e inventario de unidades por proyecto.
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Pruebas de integración con proveedor.
                  </Typography>
                </Box>
                
                {/* Combo CRM */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Integración: Mediante API a CRM</InputLabel>
                    <Select
                      value={formData.crmSeleccionado}
                      label="Integración: Mediante API a CRM"
                      onChange={handleChange('crmSeleccionado')}
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                      }}
                    >
                      {opcionesCRM.map((crm) => (
                        <MenuItem key={crm} value={crm}>
                          {crm}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {/* Input para "Otros" */}
                  {formData.crmSeleccionado === 'Otros' && (
                    <TextField
                      label="Especificar CRM"
                      variant="outlined"
                      fullWidth
                      value={formData.crmOtro}
                      onChange={handleChange('crmOtro')}
                      placeholder="Ingrese el nombre del CRM..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                          },
                        },
                      }}
                    />
                  )}
                </Box>
              </Paper>

            {/* NUEVA SECCIÓN: PROPUESTA ECONÓMICA */}
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#333',
                  fontWeight: 'bold',
                  mb: 3,
                }}
              >
                Propuesta Económica
              </Typography>
              
              {errors.itemsPropuesta && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.itemsPropuesta}
                </Alert>
              )}

              {/* Tabla principal: Diseño y desarrollo de página web */}
              <Paper sx={{ mb: 3 }}>
                <Box sx={{ p: 3, backgroundColor: '#667eea', color: 'white' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Diseño y desarrollo de página web Inmobiliaria
                  </Typography>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: '250px' }}>Descripción</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: '120px' }}>Monto ($)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: '120px' }}>Descuento</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: '120px' }}>Subtotal</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: '120px' }}>IGV (18%)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: '120px' }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '60px' }}>Acción</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itemsPropuesta.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <TextField
                              fullWidth
                              variant="outlined"
                              size="small"
                              value={item.descripcion}
                              onChange={(e) => handleItemPropuestaChange(item.id, 'descripcion', e.target.value)}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&:hover fieldset': { borderColor: '#667eea' },
                                  '&.Mui-focused fieldset': { borderColor: '#667eea' },
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              variant="outlined"
                              size="small"
                              type="number"
                              value={item.monto === '' ? '' : item.monto}
                              onChange={(e) => handleItemPropuestaChange(item.id, 'monto', e.target.value)}
                              placeholder="0.00"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&:hover fieldset': { borderColor: '#667eea' },
                                  '&.Mui-focused fieldset': { borderColor: '#667eea' },
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              variant="outlined"
                              size="small"
                              type="number"
                              value={item.descuento === '' ? '' : item.descuento}
                              onChange={(e) => handleItemPropuestaChange(item.id, 'descuento', e.target.value)}
                              placeholder="0.00"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&:hover fieldset': { borderColor: '#667eea' },
                                  '&.Mui-focused fieldset': { borderColor: '#667eea' },
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#495057', fontWeight: 'bold' }}>
                              $ {item.subtotal.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#495057', fontWeight: 'bold' }}>
                              $ {item.igv.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#28a745', fontWeight: 'bold' }}>
                              $ {item.total.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => eliminarItemPropuesta(item.id)}
                              disabled={itemsPropuesta.length <= 1}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={agregarItemPropuesta}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: '#667eea',
                      color: '#667eea',
                      '&:hover': { borderColor: '#5a6fd8', backgroundColor: 'rgba(102, 126, 234, 0.05)' },
                    }}
                  >
                    Agregar Item
                  </Button>
                  <Typography variant="h6" sx={{ color: '#495057', fontWeight: 'bold' }}>
                    Total: $ {totales.totalPropuesta}
                  </Typography>
                </Box>
              </Paper>

              {/* Tabla de servicios adicionales */}
              <Paper sx={{ mb: 3 }}>
                <Box sx={{ p: 3, backgroundColor: '#764ba2', color: 'white' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Servicios adicionales
                  </Typography>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: '250px' }}>Descripción</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: '120px' }}>Monto ($)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: '120px' }}>IGV (18%)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: '120px' }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '60px' }}>Acción</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {serviciosAdicionales.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: '#6c757d' }}>
                            No hay servicios adicionales agregados
                          </TableCell>
                        </TableRow>
                      ) : (
                        serviciosAdicionales.map((servicio) => (
                          <TableRow key={servicio.id}>
                            <TableCell>
                              <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={servicio.descripcion}
                                onChange={(e) => handleServicioAdicionalChange(servicio.id, 'descripcion', e.target.value)}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': { borderColor: '#667eea' },
                                    '&.Mui-focused fieldset': { borderColor: '#667eea' },
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                type="number"
                                value={servicio.monto === '' ? '' : servicio.monto}
                                onChange={(e) => handleServicioAdicionalChange(servicio.id, 'monto', e.target.value)}
                                placeholder="0.00"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': { borderColor: '#667eea' },
                                    '&.Mui-focused fieldset': { borderColor: '#667eea' },
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: '#495057', fontWeight: 'bold' }}>
                                $ {servicio.igv.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: '#28a745', fontWeight: 'bold' }}>
                                $ {servicio.total.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => eliminarServicioAdicional(servicio.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={agregarServicioAdicional}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: '#764ba2',
                      color: '#764ba2',
                      '&:hover': { borderColor: '#6a4190', backgroundColor: 'rgba(118, 75, 162, 0.05)' },
                    }}
                  >
                    Agregar Servicio
                  </Button>
                  <Typography variant="h6" sx={{ color: '#495057', fontWeight: 'bold' }}>
                    Total: $ {totales.totalServicios}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {/* Condiciones */}
            <Paper sx={{ p: 4, backgroundColor: '#f8f9fa', borderRadius: 2, border: '2px solid #dee2e6' }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#495057', fontWeight: 'bold' }}>
                Condiciones:
              </Typography>
              <Box sx={{ color: '#495057', lineHeight: 1.8 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Validez de la Cotización:</strong> 30 días.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Forma de pago:</strong>
                </Typography>
                <TextField
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.formaPago}
                  onChange={handleChange('formaPago')}
                  error={!!errors.formaPago}
                  helperText={errors.formaPago}
                  required
                  placeholder="Especifique la forma de pago..."
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                />
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Moneda:</strong> Dólares Americanos.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Duración del Proyecto:</strong>
                </Typography>
                <TextField
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.duracionProyecto}
                  onChange={handleChange('duracionProyecto')}
                  error={!!errors.duracionProyecto}
                  helperText={errors.duracionProyecto}
                  required
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                />
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Variaciones en el Tiempo de Entrega:</strong>
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, ml: 2 }}>
                  • <strong>Factores Externos:</strong> El tiempo estimado para la finalización de cada fase puede variar debido a factores externos fuera de nuestro control, como interrupciones en el servicio de las plataformas, cambios en las regulaciones legales, o eventos de fuerza mayor.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, ml: 2 }}>
                  • <strong>Factores Propios del Cliente:</strong> Cualquier retraso en el feedback, la aceptación de entregables o cambios en los requisitos por parte del cliente puede afectar el cronograma establecido. Es esencial que el cliente proporcione respuestas y aprobaciones de manera oportuna para mantener el cronograma previsto.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, ml: 2 }}>
                  • <strong>Revisión y Ajustes:</strong> Al finalizar cada sprint, se realizarán revisiones y ajustes necesarios en función del feedback recibido del cliente. Cualquier cambio significativo que requiera un esfuerzo adicional será discutido y presupuestado por separado.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Propiedad Intelectual:</strong> Todos los derechos de propiedad intelectual desarrollados durante este proyecto serán transferidos al cliente una vez se hayan realizado todos los pagos acordados.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Confidencialidad:</strong> Ambas partes acuerdan mantener la confidencialidad de toda la información compartida durante el proyecto.
                </Typography>
                <Typography variant="body1">
                  <strong>Garantía:</strong> Se garantiza soporte y mantenimiento por un período de 6 meses después del despliegue final.
                </Typography>
              </Box>
            </Paper>

            {/* Firma */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#495057', fontWeight: 'bold' }}>
                FIRMA:
              </Typography>
              
              {/* Imagen de firma */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 3,
                p: 2,
                border: '2px dashed #dee2e6',
                borderRadius: 2,
                backgroundColor: '#f8f9fa'
              }}>
                <img 
                  src="/images/firma.png" 
                  alt="Firma"
                  style={{
                    width: '250px',
                    height: '100px',
                    objectFit: 'contain',
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    padding: '8px'
                  }}
                  onError={(e) => {
                    // Si la imagen no existe, mostrar placeholder
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = target.nextElementSibling as HTMLElement;
                    if (placeholder) {
                      placeholder.style.display = 'flex';
                    }
                  }}
                />
                <Box sx={{
                  width: 250,
                  height: 100,
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: 1,
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: '#6c757d',
                  fontStyle: 'italic'
                }}>
                  [Firma]
                </Box>
              </Box>
              
              <Typography variant="body1" sx={{ color: '#495057', fontWeight: 'bold', mb: 1 }}>
                Juan Jesús Astete Meza
              </Typography>
              <Typography variant="body1" sx={{ color: '#6c757d' }}>
                Cargo: CTO
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}

            {guardadoExitoso && (
              <Alert severity="success" sx={{ mb: 2 }}>
                ¡Cotización enviada exitosamente a la base de datos!
              </Alert>
            )}
            
            {guardadoLocalExitoso && (
              <Alert severity="success" sx={{ mb: 2 }}>
                ¡Cotización guardada exitosamente en el navegador!
              </Alert>
            )}
            
            {restauracionExitosa && (
              <Alert severity="info" sx={{ mb: 2 }}>
                ¡Formulario restaurado exitosamente!
              </Alert>
            )}

            <Alert severity="info" sx={{ mb: 2 }}>
              💾 Los datos se guardan automáticamente mientras editas. El botón "Guardar" hace una copia de seguridad manual. Al recargar la página se restaurarán automáticamente.
            </Alert>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={guardarEnLocalStorage}
                disabled={guardandoLocal}
                sx={{
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #138496 0%, #117a8b 100%)',
                  },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                }}
              >
                {guardandoLocal ? <CircularProgress size={20} color="inherit" /> : 'Guardar'}
              </Button>

              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={enviarCotizacion}
                disabled={guardando}
                sx={{
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #218838 0%, #1ea085 100%)',
                  },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                }}
              >
                {guardando ? <CircularProgress size={20} color="inherit" /> : 'Enviar'}
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<PdfIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                }}
              >
                Imprimir cotización en PDF
              </Button>
              
              <Button
                type="button"
                variant="contained"
                size="large"
                onClick={restaurarFormularioCompleto}
                sx={{
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #e55a2b 0%, #e0841a 100%)',
                  },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                }}
              >
                🔄 Restaurar
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>

      {/* Dialog para mostrar animación del robot */}
      <Dialog
        open={analizandoWeb}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            minWidth: '400px',
          },
        }}
      >
        <DialogContent>
          <RobotThinking />
        </DialogContent>
      </Dialog>

      {/* Dialog para mostrar animación del robot en mejora de requerimientos */}
      <Dialog
        open={mejorandoRequerimientos}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            minWidth: '400px',
          },
        }}
      >
        <DialogContent>
          <RobotMejorandoRequerimientos />
        </DialogContent>
      </Dialog>
    </Box>
  );
}; 