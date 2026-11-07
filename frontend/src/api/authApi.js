import clienteAxios from './clienteAxios.js';

export async function loginApi({ email, password }) {
  const { data } = await clienteAxios.post('/auth/login', { email, password });
  return data;
}

export async function obtenerPerfilApi() {
  const { data } = await clienteAxios.get('/auth/perfil');
  return data;
}

export async function actualizarPerfilApi(datos) {
  const { data } = await clienteAxios.put('/auth/perfil', datos);
  return data;
}
