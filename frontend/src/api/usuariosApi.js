import clienteAxios from './clienteAxios.js';

export async function listarUsuariosApi() {
  const { data } = await clienteAxios.get('/usuarios');
  return data;
}

export async function crearUsuarioApi({ nombre, email, password, rol }) {
  const { data } = await clienteAxios.post('/usuarios', {
    nombre: nombre.trim(),
    email: email.trim(),
    password,
    rol
  });
  return data;
}

export async function cambiarEstadoUsuarioApi(id, activo) {
  const { data } = await clienteAxios.patch(`/usuarios/${id}/activo`, { activo });
  return data;
}
