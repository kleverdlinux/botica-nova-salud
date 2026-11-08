import clienteAxios from './clienteAxios';

export async function registrarCitaApi(datosCita) {
  const { data } = await clienteAxios.post('/citas', datosCita);
  return data;
}

export async function listarCitasApi(params = {}) {
  const { data } = await clienteAxios.get('/citas', { params });
  return data;
}

export async function cambiarEstadoCitaApi(id, nuevoEstado) {
  const { data } = await clienteAxios.patch(`/citas/${id}/estado`, { nuevoEstado });
  return data;
}
