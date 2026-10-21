import clienteAxios from './clienteAxios.js';

export async function obtenerDashboardApi() {
  const { data } = await clienteAxios.get('/dashboard/resumen');
  return data;
}
