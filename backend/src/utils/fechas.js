// Utilidades para manejo estricto de fechas en zona horaria America/Lima (UTC-5)

export function getInicioDiaLima() {
  const fechaLima = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  return new Date(`${fechaLima}T00:00:00.000-05:00`);
}

export function getFinDiaLima() {
  const fechaLima = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  return new Date(`${fechaLima}T23:59:59.999-05:00`);
}

export function esProductoVencido(fechaVencimiento) {
  if (!fechaVencimiento) return false;
  const inicioHoyLima = getInicioDiaLima();
  // Vencido si su fecha es estrictamente anterior a la medianoche de hoy en Lima
  return new Date(fechaVencimiento) < inicioHoyLima;
}
