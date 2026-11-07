// Formateadores estándar para Botica Nova Salud

export function formatearMoneda(valor) {
  const num = Number(valor) || 0;
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

export function formatearFechaLima(fecha) {
  if (!fecha) return 'Sin fecha';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return 'Fecha inválida';
  return d.toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatearFechaHoraLima(fecha = new Date()) {
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

export function esProductoVencido(fechaVencimiento) {
  if (!fechaVencimiento) return false;
  const fVenc = new Date(fechaVencimiento);
  if (isNaN(fVenc.getTime())) return false;
  
  const hoyStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  const inicioHoyLima = new Date(`${hoyStr}T00:00:00.000-05:00`);
  return fVenc < inicioHoyLima;
}

export function estaPorVencer(fechaVencimiento) {
  if (!fechaVencimiento) return false;
  const fVenc = new Date(fechaVencimiento);
  if (isNaN(fVenc.getTime())) return false;
  
  const hoyStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  const inicioHoyLima = new Date(`${hoyStr}T00:00:00.000-05:00`);
  const limite60Dias = new Date(inicioHoyLima.getTime() + 60 * 86_400_000);
  return fVenc >= inicioHoyLima && fVenc <= limite60Dias;
}

export function calcularDiasParaCaducar(fechaVencimiento) {
  if (!fechaVencimiento) return null;
  const fVenc = new Date(fechaVencimiento);
  if (isNaN(fVenc.getTime())) return null;

  const hoyStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  const inicioHoyLima = new Date(`${hoyStr}T00:00:00.000-05:00`);
  const diffTiempo = fVenc.getTime() - inicioHoyLima.getTime();
  return Math.ceil(diffTiempo / 86_400_000);
}
