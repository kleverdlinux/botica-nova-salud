import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    // Dominio en la nube (Render, Railway, Vercel, producción)
    if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1') && !hostname.startsWith('192.168.') && !hostname.startsWith('10.')) {
      return '/api';
    }
    // Red local Wi-Fi en desarrollo
    if (hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
      return `http://${hostname}:4000/api`;
    }
  }
  return 'http://localhost:4000/api';
};

const clienteAxios = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de Petición: Inyecta el token Bearer si existe en localStorage
clienteAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('novasalud_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta: Maneja expiración de sesión y 401
// REGLA CRÍTICA: Se excluye explícitamente /auth/login para no borrar sesión ante contraseña errónea
clienteAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const esLogin = error.config?.url?.includes('/auth/login');
    
    if (error.response?.status === 401 && !esLogin) {
      // Token expirado o usuario desactivado
      localStorage.removeItem('novasalud_token');
      localStorage.removeItem('novasalud_usuario');
      // Redirigir limpiamente a la pantalla de login del panel
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default clienteAxios;
