// Utilidades para manejo estricto de fechas en zona horaria America/Lima (UTC-5)

export function parseFechaLima(fechaStr) {
  if (!fechaStr) return null;
  if (fechaStr instanceof Date) return fechaStr;
  if (typeof fechaStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
    return new Date(`${fechaStr}T00:00:00.000-05:00`);
  }
  return new Date(fechaStr);
}

export function getInicioDiaLima(fechaReferencia = new Date()) {
  const fechaLima = fechaReferencia.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  return new Date(`${fechaLima}T00:00:00.000-05:00`);
}

export function getFinDiaLima(fechaReferencia = new Date()) {
  const fechaLima = fechaReferencia.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  return new Date(`${fechaLima}T23:59:59.999-05:00`);
}

export function getLimite60DiasLima() {
  const fecha60 = new Date(Date.now() + 60 * 86_400_000).toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  return new Date(`${fecha60}T23:59:59.999-05:00`);
}

export function esProductoVencido(fechaVencimiento) {
  if (!fechaVencimiento) return false;
  const inicioHoyLima = getInicioDiaLima();
  // Vencido si su fecha es estrictamente anterior a la medianoche de hoy en Lima
  return new Date(fechaVencimiento) < inicioHoyLima;
}

