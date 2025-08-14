import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../config/axios';
import API_ENDPOINTS from '../config/api';

interface User {
  id: number;
  nombre: string;
  username: string;
  rol: 'cotizador' | 'admin';
  area: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, area: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      validateToken(token).then((isValid) => {
        if (!isValid) {
          localStorage.removeItem('token');
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.VALIDATE);
      
      if (response.data.valid) {
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  const login = async (username: string, password: string, area: string): Promise<boolean> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
        username,
        password,
        area
      });

      if (response.data.access_token) {
        const token = response.data.access_token;
        localStorage.setItem('token', token);
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 