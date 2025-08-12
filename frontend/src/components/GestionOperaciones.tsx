import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Card,
  CardContent,
  Pagination,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import axios from 'axios';
import API_ENDPOINTS from '../config/api';
import { useAuth } from '../contexts/AuthContext';

interface Operacion {
  id: number;
  nombre: string;
  fecha: string;
  estado: 'aprobado' | 'en_revision' | 'desestimado';
  userId: number;
  area: string;
  data?: any;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    nombre: string;
    username: string;
  };
}

const estados = [
  { value: 'en_revision', label: 'En Revisión', color: 'warning' },
  { value: 'aprobado', label: 'Aprobado', color: 'success' },
  { value: 'desestimado', label: 'Desestimado', color: 'error' },
];

interface GestionOperacionesProps {
  onLoadCotizacion?: (data: any) => void;
}

export const GestionOperaciones: React.FC<GestionOperacionesProps> = ({ onLoadCotizacion }) => {
  const { user } = useAuth();
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOperacion, setEditingOperacion] = useState<Operacion | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'en_revision',
  });

  // Estados para filtros y paginación
  const [filtroArea, setFiltroArea] = useState('todas');
  const [areas, setAreas] = useState<string[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalOperaciones, setTotalOperaciones] = useState(0);
  const [operacionesPorPagina] = useState(10); // Cambiado de 9 a 10

  // Verificar si el usuario puede editar/eliminar
  const canEdit = user?.rol === 'admin';

  useEffect(() => {
    loadOperaciones();
    loadAreas();
  }, [filtroArea, pagina]);

  const loadAreas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_ENDPOINTS.AREAS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Áreas cargadas:', response.data);
      setAreas(response.data);
    } catch (error) {
      console.error('Error loading areas:', error);
      // Áreas por defecto si falla la carga
      setAreas(['Comercial', 'Marketing', 'TI', 'Administración', 'Medios']);
    }
  };

  const loadOperaciones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: operacionesPorPagina.toString(),
        area: filtroArea
      });

      const response = await axios.get(`${API_ENDPOINTS.OPERACIONES}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setOperaciones(response.data.operaciones);
      setTotalPaginas(response.data.totalPaginas);
      setTotalOperaciones(response.data.totalOperaciones);
    } catch (error) {
      console.error('Error loading operaciones:', error);
      setError('Error al cargar las operaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (operacion?: Operacion) => {
    if (!canEdit) return; // Solo admin puede editar
    
    if (operacion) {
      setEditingOperacion(operacion);
      setFormData({
        nombre: operacion.nombre,
        fecha: new Date(operacion.fecha).toISOString().split('T')[0],
        estado: operacion.estado,
      });
    } else {
      setEditingOperacion(null);
      setFormData({
        nombre: '',
        fecha: new Date().toISOString().split('T')[0],
        estado: 'en_revision',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingOperacion(null);
    setFormData({
      nombre: '',
      fecha: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (editingOperacion) {
        await axios.put(`${API_ENDPOINTS.OPERACIONES}/${editingOperacion.id}`, {
          id: editingOperacion.id,
          operacionData: formData
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        await axios.post(API_ENDPOINTS.OPERACIONES, formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      handleCloseDialog();
      loadOperaciones();
    } catch (error) {
      console.error('Error saving operacion:', error);
      setError('Error al guardar la operación');
    }
  };

  const handleDelete = async (id: number) => {
    if (!canEdit) return; // Solo admin puede eliminar
    
    if (window.confirm('¿Estás seguro de que quieres eliminar esta operación?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_ENDPOINTS.OPERACIONES}/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        loadOperaciones();
      } catch (error) {
        console.error('Error deleting operacion:', error);
        setError('Error al eliminar la operación');
      }
    }
  };

  const handleLoadCotizacion = (operacion: Operacion) => {
    if (operacion.data && onLoadCotizacion) {
      onLoadCotizacion(operacion.data);
    }
  };

  const getEstadoColor = (estado: string) => {
    const estadoObj = estados.find(s => s.value === estado);
    return estadoObj?.color || 'default';
  };

  const getEstadoLabel = (estado: string) => {
    const estadoObj = estados.find(s => s.value === estado);
    return estadoObj?.label || estado;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Cargando operaciones...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ color: '#333', fontWeight: 'bold' }}>
            Gestión de Operaciones
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filtro por área */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <FilterIcon sx={{ color: '#ae1781' }} />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar por Área</InputLabel>
            <Select
              value={filtroArea}
              label="Filtrar por Área"
              onChange={(e) => {
                setFiltroArea(e.target.value);
                setPagina(1); // Resetear a la primera página
              }}
              sx={{
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#ae1781',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#ae1781',
                },
              }}
            >
              <MenuItem value="todas">Todas las áreas</MenuItem>
              {areas.map((area) => (
                <MenuItem key={area} value={area}>
                  {area}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography variant="body2" sx={{ color: '#666' }}>
            {totalOperaciones} operaciones encontradas
          </Typography>
        </Box>

        {/* Grid de tarjetas responsive */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(3, 1fr)'
          },
          gap: 3,
          mt: 3
        }}>
          {operaciones.map((operacion) => (
            <Card 
              key={operacion.id}
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
                border: '1px solid #e0e0e0',
              }}
              onClick={() => handleLoadCotizacion(operacion)}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Header con área y estado */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Chip
                    icon={<BusinessIcon />}
                    label={operacion.area}
                    size="small"
                    sx={{
                      backgroundColor: '#ae1781',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                  <Chip
                    label={getEstadoLabel(operacion.estado)}
                    color={getEstadoColor(operacion.estado) as any}
                    size="small"
                  />
                </Box>

                {/* Título de la operación */}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    color: '#333', 
                    fontWeight: 'bold',
                    lineHeight: 1.3,
                    minHeight: '2.6em',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {operacion.nombre}
                </Typography>

                {/* Información de la empresa */}
                {operacion.data?.nombreEmpresa && (
                  <Box sx={{ mb: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.5
                      }}
                    >
                      <AssignmentIcon sx={{ fontSize: 16 }} />
                      Empresa: {operacion.data.nombreEmpresa}
                    </Typography>
                  </Box>
                )}

                {/* Fecha del proyecto */}
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5
                    }}
                  >
                    <CalendarIcon sx={{ fontSize: 16, color: '#ae1781' }} />
                    Fecha: {new Date(operacion.fecha).toLocaleDateString('es-ES')}
                  </Typography>
                </Box>

                {/* Usuario */}
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 16, color: '#ae1781' }} />
                    Usuario: {operacion.user?.nombre || 'N/A'}
                  </Typography>
                </Box>

                {/* Fecha de creación */}
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#999',
                      display: 'block'
                    }}
                  >
                    Creado: {formatDate(operacion.createdAt)}
                  </Typography>
                </Box>

                {/* Botones de acción */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mt: 'auto',
                  pt: 2,
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#ae1781',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    👆 Clic para cargar
                  </Typography>
                  
                  {canEdit && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(operacion);
                        }}
                        sx={{ color: '#ae1781' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(operacion.id);
                        }}
                        sx={{ color: '#dc3545' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 4,
            pb: 2
          }}>
            <Pagination
              count={totalPaginas}
              page={pagina}
              onChange={(event, value) => setPagina(value)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#ae1781',
                  '&.Mui-selected': {
                    backgroundColor: '#ae1781',
                    color: 'white',
                  },
                },
              }}
            />
          </Box>
        )}

        {/* Mensaje cuando no hay operaciones */}
        {operaciones.length === 0 && !loading && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            color: '#666'
          }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              No hay operaciones disponibles
            </Typography>
            <Typography variant="body2">
              {filtroArea !== 'todas' 
                ? `No se encontraron operaciones para el área "${filtroArea}"`
                : 'Las operaciones aparecerán aquí cuando se guarden cotizaciones'
              }
            </Typography>
          </Box>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingOperacion ? 'Editar Operación' : 'Nueva Operación'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre"
              fullWidth
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
            <TextField
              label="Fecha"
              type="date"
              fullWidth
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.estado}
                label="Estado"
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              >
                {estados.map((estado) => (
                  <MenuItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ae1781 0%, #8e1470 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8e1470 0%, #6e1056 100%)',
              },
            }}
          >
            {editingOperacion ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 