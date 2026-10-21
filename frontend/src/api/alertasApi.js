import clienteAxios from './clienteAxios.js';

export async function obtenerAlertasApi() {
  const { data } = await clienteAxios.get('/alertas');
  return data;
}
