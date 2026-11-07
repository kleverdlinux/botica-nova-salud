import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { logoutClient, getActiveClient } from '../utils/orderStorage.ts';
import { notificarAdvertencia } from '../utils/alertaSweet.js';

// Tiempo límite de inactividad: 30 minutos (30 * 60 * 1000 ms)
const TIEMPO_INACTIVIDAD_MS = 30 * 60 * 1000;
const CLAVE_ULTIMA_ACTIVIDAD = 'novasalud_ultima_actividad';

/**
 * Gestor global de seguridad contra inactividad.
 * Cierra automáticamente la sesión de administradores, cajeros, gestores de almacén y clientes
 * si transcurren 30 minutos sin ninguna interacción del usuario (movimiento de mouse, teclas, clic o scroll).
 */
export default function GestorInactividadSeguridad() {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const ultimaActualizacionRef = useRef(Date.now());

  // Actualiza la marca de tiempo de actividad en localStorage (con acelerador/throttle de 5s para óptimo rendimiento)
  const registrarActividad = () => {
    const ahora = Date.now();
    if (ahora - ultimaActualizacionRef.current > 5000) {
      ultimaActualizacionRef.current = ahora;
      try {
        localStorage.setItem(CLAVE_ULTIMA_ACTIVIDAD, String(ahora));
      } catch (e) {
        console.warn('Error al persistir marca de actividad:', e);
      }
    }
  };

  useEffect(() => {
    // Determinar si existe alguna sesión activa de personal o de cliente
    const haySesionAdmin = Boolean(usuario || localStorage.getItem('novasalud_token'));
    const haySesionCliente = Boolean(getActiveClient() || localStorage.getItem('nova_salud_client_user'));

    // Si nadie tiene sesión iniciada, no es necesario mantener los listeners
    if (!haySesionAdmin && !haySesionCliente) {
      return;
    }

    // Inicializar timestamp si no está presente
    if (!localStorage.getItem(CLAVE_ULTIMA_ACTIVIDAD)) {
      localStorage.setItem(CLAVE_ULTIMA_ACTIVIDAD, String(Date.now()));
    }

    // Lista de eventos de interacción que demuestran presencia activa del usuario
    const eventos = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const manejadorEvento = () => registrarActividad();

    eventos.forEach((evt) => {
      window.addEventListener(evt, manejadorEvento, { passive: true });
    });

    // Rutina de evaluación de inactividad
    const verificarInactividad = () => {
      const guardadoStr = localStorage.getItem(CLAVE_ULTIMA_ACTIVIDAD);
      const guardado = guardadoStr ? Number(guardadoStr) : Date.now();
      const tiempoInactivo = Date.now() - guardado;

      if (tiempoInactivo >= TIEMPO_INACTIVIDAD_MS) {
        let cerroSesion = false;

        // 1. Cierre de sesión de personal administrativo (Admin, Cajero, Almacén)
        if (haySesionAdmin) {
          logout();
          cerroSesion = true;
          if (location.pathname.startsWith('/app')) {
            navigate('/admin/login', { replace: true });
          }
        }

        // 2. Cierre de sesión de cliente de la tienda web
        if (haySesionCliente) {
          logoutClient();
          cerroSesion = true;
        }

        // Limpiar registro de actividad
        localStorage.removeItem(CLAVE_ULTIMA_ACTIVIDAD);

        // Notificación de seguridad al usuario
        if (cerroSesion) {
          notificarAdvertencia(
            'Sesión Finalizada por Inactividad',
            'Por su seguridad y cumplimiento de normativas de privacidad sanitaria, la sesión se cerró automáticamente tras 30 minutos de inactividad.'
          );
        }
      }
    };

    // Verificar cada 10 segundos
    const intervalo = setInterval(verificarInactividad, 10000);

    // Verificar inmediatamente al enfocar la ventana o cambiar de pestaña
    const manejarCambioVisibilidad = () => {
      if (document.visibilityState === 'visible') {
        verificarInactividad();
      }
    };

    document.addEventListener('visibilitychange', manejarCambioVisibilidad);
    window.addEventListener('focus', verificarInactividad);

    return () => {
      eventos.forEach((evt) => {
        window.removeEventListener(evt, manejadorEvento);
      });
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', manejarCambioVisibilidad);
      window.removeEventListener('focus', verificarInactividad);
    };
  }, [usuario, location.pathname, logout, navigate]);

  return null;
}

