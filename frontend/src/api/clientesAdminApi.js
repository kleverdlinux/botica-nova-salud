import clienteAxios from './clienteAxios.js';

export async function listarClientesWebAdminApi() {
  const { data } = await clienteAxios.get('/catalogo/admin/clientes');
  return data.clientes || [];
}

export async function reasignarPasswordClienteApi({ dni, nuevaPassword }) {
  const { data } = await clienteAxios.post('/catalogo/admin/clientes/reasignar-password', {
    dni,
    nuevaPassword
  });
  return data;
}

