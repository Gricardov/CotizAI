import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  RequestQuote as RequestQuoteIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { CotizadorForm } from './CotizadorForm';

const drawerWidth = 240;

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('cotizar');

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'cotizar':
        return <CotizadorForm />;
      default:
        return <CotizadorForm />;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            CotizAI - Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.username} ({user?.area})
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ textTransform: 'none' }}
          >
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: open ? drawerWidth : 0,
          flexShrink: 0,
          transition: 'width 0.3s',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRight: '1px solid #dee2e6',
          },
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Typography variant="h6" sx={{ flexGrow: 1, color: '#495057' }}>
              Menú
            </Typography>
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>
        </Toolbar>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton
              selected={activeSection === 'cotizar'}
              onClick={() => setActiveSection('cotizar')}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  borderRight: '3px solid #667eea',
                },
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                },
              }}
            >
              <ListItemIcon>
                <RequestQuoteIcon sx={{ color: '#667eea' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Cotizar" 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    color: '#495057',
                    fontWeight: activeSection === 'cotizar' ? 'bold' : 'normal',
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: open ? 0 : `-${drawerWidth}px`,
          transition: 'margin-left 0.3s',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
}; 