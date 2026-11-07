import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, obtenerPerfilApi } from '../api/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem('novasalud_usuario');
      if (!guardado || guardado === 'undefined' || guardado === 'null') return null;
      return JSON.parse(guardado);
    } catch (e) {
      console.warn('Error al leer novasalud_usuario de localStorage:', e);
      localStorage.removeItem('novasalud_usuario');
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      const t = localStorage.getItem('novasalud_token');
      if (!t || t === 'undefined' || t === 'null') return null;
      return t;
    } catch {
      return null;
    }
  });
  const [cargando, setCargando] = useState(true);

  // Al montar la app, validar token contra el backend con /auth/perfil
  useEffect(() => {
    async function verificarSesion() {
      const tokenGuardado = localStorage.getItem('novasalud_token');
      if (!tokenGuardado) {
        setCargando(false);
        return;
      }

      try {
        const data = await obtenerPerfilApi();
        const usuarioObtenido = data?.usuario || data;
        setUsuario(usuarioObtenido);
        localStorage.setItem('novasalud_usuario', JSON.stringify(usuarioObtenido));
      } catch (err) {
        console.warn('Sesión no válida o expirada:', err.response?.data?.error || err.message);
        localStorage.removeItem('novasalud_token');
        localStorage.removeItem('novasalud_usuario');
        setUsuario(null);
        setToken(null);
      } finally {
        setCargando(false);
      }
    }

    verificarSesion();
  }, []);

  const login = async (credenciales) => {
    const data = await loginApi(credenciales);
    localStorage.setItem('novasalud_token', data.token);
    localStorage.setItem('novasalud_usuario', JSON.stringify(data.usuario));
    setToken(data.token);
    setUsuario(data.usuario);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('novasalud_token');
    localStorage.removeItem('novasalud_usuario');
    setUsuario(null);
    setToken(null);
  };

  const actualizarUsuario = (datos) => {
    const datosLimpios = datos?.usuario || datos;
    setUsuario(prev => {
      const fusionado = { ...prev, ...datosLimpios };
      localStorage.setItem('novasalud_usuario', JSON.stringify(fusionado));
      return fusionado;
    });
  };

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, login, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
