import clienteAxios from './clienteAxios.js';

export async function registrarVentaApi({ items, metodoPago, clienteDoc, clienteNom }) {
  // Garantía técnica: enviamos exclusivamente productoId y cantidad, nunca precios ni totales
  const payload = {
    items: items.map(item => ({
      productoId: Number(item.productoId),
      cantidad: Number(item.cantidad)
    })),
    metodoPago,
    clienteDoc: clienteDoc ? clienteDoc.trim() : null,
    clienteNom: clienteNom ? clienteNom.trim() : null
  };

  const { data } = await clienteAxios.post('/ventas', payload);
  return data;
}

export async function listarVentasApi(params = {}) {
  const { data } = await clienteAxios.get('/ventas', { params });
  return data;
}

export async function obtenerVentaPorIdApi(id) {
  const { data } = await clienteAxios.get(`/ventas/${id}`);
  return data;
}
