import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUTA_STORAGE = path.resolve(__dirname, '../../prisma/citas_store.json');

// Cargar o inicializar almacenamiento persistente
function leerCitasStorage() {
  try {
    if (!fs.existsSync(RUTA_STORAGE)) {
      fs.writeFileSync(RUTA_STORAGE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const data = fs.readFileSync(RUTA_STORAGE, 'utf-8');
    return JSON.parse(data) || [];
  } catch (err) {
    console.warn('Error al leer citas_store.json:', err.message);
    return [];
  }
}

function guardarCitasStorage(citas) {
  try {
    const dir = path.dirname(RUTA_STORAGE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(RUTA_STORAGE, JSON.stringify(citas, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar citas_store.json:', err.message);
  }
}

/**
 * Registrar una nueva cita de tópico desde la web
 */
export async function registrarCita({
  paciente,
  telefono,
  servicioId,
  servicioNombre,
  precio,
  horario,
  notas = ''
}) {
  const citas = leerCitasStorage();
  const anio = new Date().getFullYear();
  const id = `CIT-${anio}-${String(citas.length + 1).padStart(4, '0')}`;

  const nuevaCita = {
    id,
    paciente: String(paciente || '').trim(),
    telefono: String(telefono || '').trim(),
    servicioId: String(servicioId || '').trim(),
    servicioNombre: String(servicioNombre || 'Tópico Clínico').trim(),
    precio: Number(precio) || 0,
    horario: String(horario || 'Hoy en la mañana').trim(),
    notas: String(notas || '').trim(),
    estado: 'PENDIENTE', // 'PENDIENTE' | 'ATENDIDO' | 'CANCELADO'
    fecha: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  citas.unshift(nuevaCita);
  guardarCitasStorage(citas);
  return nuevaCita;
}

/**
 * Obtener listado de citas con filtros
 */
export async function listarCitas({ estado = 'TODOS', busqueda = '' } = {}) {
  const citas = leerCitasStorage();
  let filtradas = [...citas];

  if (estado && estado !== 'TODOS') {
    filtradas = filtradas.filter((c) => c.estado === estado);
  }

  if (busqueda && busqueda.trim()) {
    const q = busqueda.trim().toLowerCase();
    filtradas = filtradas.filter(
      (c) =>
        c.paciente.toLowerCase().includes(q) ||
        c.telefono.includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.servicioNombre.toLowerCase().includes(q)
    );
  }

  return filtradas;
}

/**
 * Actualizar estado de una cita de tópico
 */
export async function cambiarEstadoCita({ id, nuevoEstado }) {
  const citas = leerCitasStorage();
  const idx = citas.findIndex((c) => c.id === id);
  if (idx === -1) {
    throw new Error(`Cita con ID ${id} no encontrada.`);
  }

  const estadosValidos = ['PENDIENTE', 'ATENDIDO', 'CANCELADO'];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error(`Estado ${nuevoEstado} inválido. Permitidos: ${estadosValidos.join(', ')}`);
  }

  citas[idx].estado = nuevoEstado;
  citas[idx].updatedAt = new Date().toISOString();
  guardarCitasStorage(citas);

  return citas[idx];
}

