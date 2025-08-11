import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { CotizadorForm } from './CotizadorForm';
import { GestionOperaciones } from './GestionOperaciones';

const drawerWidth = 240;
const collapsedDrawerWidth = 64;

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedOption, setSelectedOption] = useState('cotizar');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [cotizacionToLoad, setCotizacionToLoad] = useState<any>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleLoadCotizacion = (cotizacionData: any) => {
    // Cambiar a la vista de cotización y cargar los datos
    setSelectedOption('cotizar');
    // Pasar los datos directamente al componente
    setCotizacionToLoad(cotizacionData);
  };

  const handleCotizacionLoaded = () => {
    // Limpiar los datos después de que se hayan cargado
    setCotizacionToLoad(null);
  };

  const menuItems = [
    {
      text: 'Cotizar',
      icon: <AssessmentIcon />,
      value: 'cotizar',
      roles: ['cotizador', 'admin']
    },
    {
      text: 'Gestión',
      icon: <BusinessIcon />,
      value: 'gestion',
      roles: ['cotizador', 'admin']
    }
  ];

  const renderContent = () => {
    switch (selectedOption) {
      case 'cotizar':
        return <CotizadorForm cotizacionToLoad={cotizacionToLoad} onCotizacionLoaded={handleCotizacionLoaded} />;
      case 'gestion':
        return <GestionOperaciones onLoadCotizacion={handleLoadCotizacion} />;
      default:
        return <CotizadorForm cotizacionToLoad={cotizacionToLoad} onCotizacionLoaded={handleCotizacionLoaded} />;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : collapsedDrawerWidth}px)` },
          ml: { sm: `${sidebarOpen ? drawerWidth : collapsedDrawerWidth}px` },
          backgroundColor: '#667eea',
          transition: 'width 0.3s ease, margin-left 0.3s ease',
        }}
        elevation={3}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            CotizAI - Sistema de Cotización
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
              {user?.nombre}
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: sidebarOpen ? drawerWidth : collapsedDrawerWidth,
          flexShrink: 0,
          transition: 'width 0.3s ease',
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? drawerWidth : collapsedDrawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#667eea',
            borderRight: '1px solid #5a6fd8',
            transition: 'width 0.3s ease',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            overflowX: 'hidden',
          },
        }}
      >
        <Box sx={{ overflow: 'auto', pt: 8 }}>
          {/* Botón para expandir/ocultar sidebar - arriba */}
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 1, mb: 1 }}>
            <IconButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Box>
          
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.value} disablePadding>
                <ListItemButton
                  onClick={() => setSelectedOption(item.value)}
                  selected={selectedOption === item.value}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    minHeight: 48,
                    '&.Mui-selected': {
                      backgroundColor: 'white',
                      color: '#667eea',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#667eea',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                    },
                    color: 'rgba(255,255,255,0.8)',
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: selectedOption === item.value ? '#667eea' : 'rgba(255,255,255,0.8)',
                    minWidth: 40,
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {sidebarOpen && (
                    <ListItemText 
                      primary={item.text} 
                      sx={{
                        '& .MuiTypography-root': {
                          fontWeight: selectedOption === item.value ? 600 : 400,
                        }
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : collapsedDrawerWidth}px)` },
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          transition: 'width 0.3s ease',
        }}
      >
        <Toolbar />
        {renderContent()}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 150,
          },
        }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>
    </Box>
  );
}; 