import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Divider,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  CardActions,
  InputAdornment,
  Dialog,
  DialogContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Analytics as AnalyticsIcon,
  SmartToy as RobotIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import axios from 'axios';

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

const caracteristicasDefault = [
  "Diseño Amigable y Atractivo: El diseño de la página web juega un papel crucial en la primera impresión que causa en los visitantes. Una página web renovada y moderna, con un diseño atractivo y amigable, captará la atención de los usuarios y los invita a explorar más a fondo.",
  "Experiencia de Usuario Mejorada: Renovar la página web para ofrecer una experiencia de usuario fluida y agradable. Con una navegación intuitiva, un diseño responsive y tiempos de carga rápidos, los usuarios podrán encontrar fácilmente la información que buscan y disfrutar de una experiencia sin contratiempos.",
  "Optimización para Motores de Búsqueda (SEO): La implementación de técnicas avanzadas de SEO en el diseño y desarrollo de la página web garantiza una mejor visibilidad en los motores de búsqueda. Esto significa que la página web estará mejor posicionada en los resultados de búsqueda, lo que aumentará su visibilidad y alcance entre los clientes potenciales.",
  "Funcionalidades Avanzadas: Al renovar la página web podremos integrar funcionalidades avanzadas que mejoran la experiencia del usuario y facilitan el proceso de búsqueda y compra de propiedades. Desde herramientas de búsqueda avanzada, e-commerce, hasta tours virtuales de los departamentos, estas funcionalidades agregan valor y diferencian a la empresa de la competencia.",
  "Imagen Profesional y Credibilidad: Una página web renovada refleja una imagen profesional y confiable de la empresa. Con un diseño pulido y contenido de calidad, la página web inspira confianza en los visitantes y les da la seguridad de estar tratando con una empresa seria y competente.",
  "Funcionalidades Avanzadas: Al renovar la página web podremos integrar funcionalidades avanzadas que mejoran la experiencia del usuario y facilitan el proceso de búsqueda y compra de propiedades. Desde herramientas de búsqueda avanzada, e-commerce, hasta tours virtuales de los departamentos, estas funcionalidades agregan valor y diferencian a la empresa de la competencia.",
  "Imagen Profesional y Credibilidad: Una página web renovada refleja una imagen profesional y confiable de la empresa. Con un diseño pulido y contenido de calidad, la página web inspira confianza en los visitantes y les da la seguridad de estar tratando con una empresa seria y competente."
];

const itemsPropuestaDefault: ItemPropuesta[] = [
  {
    id: 'item-1',
    descripcion: 'Diseño UX/UI completo',
    monto: '',
    descuento: '',
    subtotal: 0,
    igv: 0,
    total: 0
  },
  {
    id: 'item-2',
    descripcion: 'Desarrollo Frontend Responsive',
    monto: '',
    descuento: '',
    subtotal: 0,
    igv: 0,
    total: 0
  },
  {
    id: 'item-3',
    descripcion: 'Desarrollo Backend y API',
    monto: '',
    descuento: '',
    subtotal: 0,
    igv: 0,
    total: 0
  },
  {
    id: 'item-4',
    descripcion: 'Integración CRM',
    monto: '',
    descuento: '',
    subtotal: 0,
    igv: 0,
    total: 0
  },
  {
    id: 'item-5',
    descripcion: 'Optimización SEO',
    monto: '',
    descuento: '',
    subtotal: 0,
    igv: 0,
    total: 0
  },
  {
    id: 'item-6',
    descripcion: 'Testing y QA',
    monto: '',
    descuento: '',
    subtotal: 0,
    igv: 0,
    total: 0
  },
  {
    id: 'item-7',
    descripcion: 'Despliegue en Producción',
    monto: '',
    descuento: '',
    subtotal: 0,
    igv: 0,
    total: 0
  }
];

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
      p: 3 
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
        Analizando sitio web...
      </Typography>
      <Typography variant="body2" sx={{ color: '#6c757d', textAlign: 'center', mt: 1 }}>
        Nuestro AI está evaluando la estructura, diseño y optimización de la página
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        mt: 2,
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

export const CotizadorForm: React.FC = () => {
  const [formData, setFormData] = useState({
    fecha: '',
    nombreEmpresa: '',
    proyecto: '',
    nombreContacto: '',
    correoContacto: '',
    rubro: '',
    servicio: '',
    tipo: '',
    promptsRequerimientos: '',
    servicioNecesidad: '',
    urlAnalisis: '',
    detallePagina: '',
    tiempoDesarrollo: 'El proyecto tendrá un tiempo de desarrollo de 3 meses o 90 días calendario.',
    crmSeleccionado: '',
    crmOtro: '',
  });

  const [caracteristicas, setCaracteristicas] = useState<Caracteristica[]>(
    caracteristicasDefault.map((texto, index) => ({
      id: `caracteristica-${index}`,
      contenido: texto
    }))
  );

  const [itemsPropuesta, setItemsPropuesta] = useState<ItemPropuesta[]>(itemsPropuestaDefault);
  const [serviciosAdicionales, setServiciosAdicionales] = useState<ServicioAdicional[]>([]);

  const [success, setSuccess] = useState(false);
  const [analizandoWeb, setAnalizandoWeb] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleChange = (field: string) => (event: any) => {
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
      }
    }

    // Limpiar campo "Otros" cuando se cambia la selección de CRM
    if (field === 'crmSeleccionado' && value !== 'Otros') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        crmOtro: ''
      }));
    }
  };

  const handleAnalizarWeb = async () => {
    if (!formData.urlAnalisis) {
      alert('Por favor ingresa una URL para analizar');
      return;
    }

    setAnalizandoWeb(true);
    
    try {
      const response = await axios.post('http://localhost:3000/api/analizar-web', {
        url: formData.urlAnalisis
      });

      setFormData(prev => ({
        ...prev,
        detallePagina: response.data.analisis
      }));
    } catch (error) {
      console.error('Error al analizar web:', error);
      setFormData(prev => ({
        ...prev,
        detallePagina: 'Error al analizar la página web. Por favor, intenta nuevamente.'
      }));
    } finally {
      setAnalizandoWeb(false);
    }
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos del formulario:', {
      ...formData,
      caracteristicas: caracteristicas,
      itemsPropuesta: itemsPropuesta,
      serviciosAdicionales: serviciosAdicionales
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
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
            Datos de la empresa:
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
                InputLabelProps={{
                  shrink: true,
                }}
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
                label="Nombre de empresa"
                variant="outlined"
                value={formData.nombreEmpresa}
                onChange={handleChange('nombreEmpresa')}
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

            <TextField
              label="Proyecto"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={formData.proyecto}
              onChange={handleChange('proyecto')}
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

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Nombre del contacto"
                variant="outlined"
                value={formData.nombreContacto}
                onChange={handleChange('nombreContacto')}
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

            {/* Texto fijo */}
            <Paper sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ color: '#495057', lineHeight: 1.6 }}>
                Señores "<strong>{formData.nombreEmpresa || '[NOMBRE DE LA EMPRESA]'}</strong>"<br />
                De nuestra especial consideración:<br /><br />
                Luego de extenderle un cordial saludo por medio de la presente, tenemos el agrado de hacerles llegar nuestra propuesta para atender su requerimiento.
              </Typography>
            </Paper>

            {/* Combos */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ flex: '1 1 200px' }}>
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
              </FormControl>

              <FormControl sx={{ flex: '1 1 200px' }}>
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
              </FormControl>

              <FormControl sx={{ flex: '1 1 200px' }}>
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
              </FormControl>
            </Box>

            {/* Textarea condicional para Básico */}
            {formData.tipo === 'Básico' && (
              <TextField
                label="Prompts de requerimientos técnicos"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={formData.promptsRequerimientos}
                onChange={handleChange('promptsRequerimientos')}
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

            {/* Servicio (Necesidad) */}
            <TextField
              label="SERVICIO (NECESIDAD)"
              variant="outlined"
              fullWidth
              multiline
              rows={6}
              value={formData.servicioNecesidad}
              onChange={handleChange('servicioNecesidad')}
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
            
            {/* Proceso del Diseño */}
            <Paper sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#495057', fontWeight: 'bold' }}>
                Proceso del Diseño:
              </Typography>
              <Box sx={{ color: '#6c757d', lineHeight: 1.8 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Investigación:</strong> Conocimiento de las necesidades del usuario
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Evaluación:</strong> Evaluaciones heurísticas, benchmarks, pruebas de usabilidad
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Arquitectura navegación:</strong> Flujo (mapa) de la información
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Arquitectura de cada una de las páginas:</strong> Wireframes (prototipo navegable)
                </Typography>
                <Typography variant="body1">
                  <strong>Presentación</strong>
                </Typography>
              </Box>
            </Paper>

            {/* Proceso del Diseño UI */}
            <Paper sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#495057', fontWeight: 'bold' }}>
                Proceso del Diseño UI:
              </Typography>
              <Box sx={{ color: '#6c757d', lineHeight: 1.8 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Diseño de interacción.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Guías de interacción.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Diseño de elementos: botones, documentos, etc.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Diseño visual: iconos, imágenes, ilustraciones.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Guías de estilo: paletas de colores, tipografías.
                </Typography>
                <Typography variant="body1">
                  Diseño de cada una de las páginas: Prototipo navegable web y móvil.
                </Typography>
              </Box>
            </Paper>

            {/* Proceso de Análisis SEO */}
            <Paper sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#495057', fontWeight: 'bold' }}>
                Proceso de Análisis SEO:
              </Typography>
              <Box sx={{ color: '#6c757d', lineHeight: 1.8 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Análisis, búsqueda y creación de Keywords para posicionamiento web.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Correcto nombramiento de archivos.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Nomenclatura de páginas internas y proyectos.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Detalle de Metatags.
                </Typography>
                <Typography variant="body1">
                  Listado de Inlinks y outlinks.
                </Typography>
              </Box>
            </Paper>

            {/* Entregables */}
            <Paper sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#495057', fontWeight: 'bold' }}>
                Entregables:
              </Typography>
              <Box sx={{ color: '#6c757d', lineHeight: 1.8 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Diseño navegable en Figma.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Guía de estilos.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Exportación de elementos visuales en .svg .webp .png .jpg
                </Typography>
                <Typography variant="body1">
                  Informe SEO con listado de palabras, tags, keywords por proyecto.
                </Typography>
              </Box>
            </Paper>

            {/* Maquetación web y mobile */}
            <Paper sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#495057', fontWeight: 'bold' }}>
                Maquetación web y mobile:
              </Typography>
              <Box sx={{ color: '#6c757d', lineHeight: 1.8 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Implementación del diseño web y mobile en ambiente de desarrollo.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Integración de leads desde todos los formularios a CRM
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Implementación y optimización SEO básica para mejorar la visibilidad del sitio web en los motores de búsqueda.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Integración de Google Analytics para el seguimiento y análisis del tráfico web.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Implementación de mapa de calor con Clarity.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  QA, pruebas unitarias y performance.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Pase a producción.
                </Typography>
                <Typography variant="body1">
                  Implementación de un sistema de gestión de contenido (CMS) para facilitar la administración y actualización del sitio web.
                </Typography>
              </Box>
            </Paper>

            {/* Consideraciones */}
            <Paper sx={{ p: 3, backgroundColor: '#fff3cd', borderRadius: 2, border: '1px solid #ffeaa7' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#856404', fontWeight: 'bold' }}>
                Consideraciones:
              </Typography>
              <Box sx={{ color: '#856404', lineHeight: 1.8 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Deberá proveer la redacción del contenido de la página web.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Deberá proveer un banco de fotos, vídeos e imágenes en alta calidad o en formatos de edición.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Deberá proveer las ilustraciones de personajes, mascotas u otros que se desee incluir en el diseño.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  El diseño y desarrollo solo considera el idioma español.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Soporte técnico y mantenimiento básico durante un período inicial de 12 meses después del lanzamiento del sitio web.
                </Typography>
                <Typography variant="body1">
                  El costo final y el tiempo de entrega están sujetos a cambios según los requisitos adicionales del cliente y los ajustes solicitados durante el proceso de desarrollo.
                </Typography>
              </Box>
            </Paper>

            {/* No incluye */}
            <Paper sx={{ p: 3, backgroundColor: '#f8d7da', borderRadius: 2, border: '1px solid #f5c6cb' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#721c24', fontWeight: 'bold' }}>
                No incluye:
              </Typography>
              <Box sx={{ color: '#721c24', lineHeight: 1.8 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Toma de Fotografía, creación o edición de videos.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Redacción de contenido.
                </Typography>
                <Typography variant="body1">
                  Diseño de Ilustraciones e imágenes.
                </Typography>
              </Box>
            </Paper>

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
                  onClick={handleAnalizarWeb}
                  disabled={analizandoWeb || !formData.urlAnalisis}
                  startIcon={analizandoWeb ? null : <AnalyticsIcon />}
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

              {/* Tiempo de desarrollo editable */}
              <TextField
                label="Tiempo de desarrollo:"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={formData.tiempoDesarrollo}
                onChange={handleChange('tiempoDesarrollo')}
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
            </Box>

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
                        <TableCell sx={{ fontWeight: 'bold', minWidth: '120px' }}>Monto (S/.)</TableCell>
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
                              S/. {item.subtotal.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#495057', fontWeight: 'bold' }}>
                              S/. {item.igv.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#28a745', fontWeight: 'bold' }}>
                              S/. {item.total.toFixed(2)}
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
                    Total: S/. {totales.totalPropuesta}
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
                        <TableCell sx={{ fontWeight: 'bold', minWidth: '120px' }}>Monto (S/.)</TableCell>
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
                                S/. {servicio.igv.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: '#28a745', fontWeight: 'bold' }}>
                                S/. {servicio.total.toFixed(2)}
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
                    Total: S/. {totales.totalServicios}
                  </Typography>
                </Box>
              </Paper>

              {/* Total general */}
              <Paper sx={{ p: 3, backgroundColor: '#28a745', color: 'white', mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    TOTAL GENERAL
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    S/. {totales.granTotal}
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
                  <strong>Forma de pago:</strong> {formData.servicio === 'Mejora (solo mostrar el tipo básico)' ? '100% al aceptar la propuesta.' : '50% al aceptar la propuesta y 50% al recibir el acta de conformidad del servicio y su posterior publicación en producción.'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Moneda:</strong> Dólares Americanos.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Duración del Proyecto:</strong> El proyecto tiene una duración estimada de 90 días calendario, divididas en sprints de 2 semanas cada uno. Se entregarán avances cada 15 días.
                </Typography>
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
              
              {/* Imagen dummy de firma */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 3,
                p: 2,
                border: '2px dashed #dee2e6',
                borderRadius: 2,
                backgroundColor: '#f8f9fa'
              }}>
                <Box sx={{
                  width: 200,
                  height: 80,
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: 1,
                  display: 'flex',
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

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                ¡Cotización guardada exitosamente!
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
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
                Generar Cotización
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
    </Box>
  );
}; 