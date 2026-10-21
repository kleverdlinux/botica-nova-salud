import clienteAxios from './clienteAxios.js';

export async function buscarProductosPOSApi(termino) {
  if (!termino || !termino.trim()) return [];
  const { data } = await clienteAxios.get(`/productos/buscar?q=${encodeURIComponent(termino.trim())}`);
  return data;
}
