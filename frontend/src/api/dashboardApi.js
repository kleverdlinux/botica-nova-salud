import clienteAxios from './clienteAxios.js';

export async function obtenerDashboardApi() {
  const { data } = await clienteAxios.get('/dashboard/resumen');
  return data;
}

export async function obtenerDashboardAlmacenApi() {
  const { data } = await clienteAxios.get('/dashboard/almacen');
  return data;
}

export async function obtenerDashboardCajeroApi() {
  const { data } = await clienteAxios.get('/dashboard/cajero');
  return data;
}
