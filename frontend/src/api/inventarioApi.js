import clienteAxios from './clienteAxios.js';

export async function registrarEntradaApi({ productoId, cantidad, motivo }) {
  const { data } = await clienteAxios.post('/inventario/entrada', {
    productoId: Number(productoId),
    cantidad: Number(cantidad),
    motivo
  });
  return data;
}

export async function registrarAjusteApi({ productoId, stockReal, motivo }) {
  const { data } = await clienteAxios.post('/inventario/ajuste', {
    productoId: Number(productoId),
    stockReal: Number(stockReal),
    motivo
  });
  return data;
}

export async function obtenerKardexApi(productoId) {
  const { data } = await clienteAxios.get(`/inventario/kardex/${productoId}`);
  return data;
}

export async function obtenerKardexGlobalApi(params = {}) {
  const { data } = await clienteAxios.get('/inventario/kardex', { params });
  return data;
}
