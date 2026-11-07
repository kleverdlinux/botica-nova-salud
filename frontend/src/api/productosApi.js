import clienteAxios from './clienteAxios.js';

// Búsqueda rápida para POS (máx 20)
export async function buscarProductosPOSApi(termino) {
  if (!termino || !termino.trim()) return [];
  const { data } = await clienteAxios.get(`/productos/buscar?q=${encodeURIComponent(termino.trim())}`);
  return data;
}

// Listado paginado de productos
export async function listarProductosApi(params = {}) {
  const { data } = await clienteAxios.get('/productos', { params });
  return data;
}

// Obtener un producto por ID
export async function obtenerProductoPorIdApi(id) {
  const { data } = await clienteAxios.get(`/productos/${id}`);
  return data;
}

// Crear producto (ADMIN)
export async function crearProductoApi(productoData) {
  const { data } = await clienteAxios.post('/productos', productoData);
  return data;
}

// Actualizar producto (ADMIN - omite stock)
export async function actualizarProductoApi(id, productoData) {
  const { data } = await clienteAxios.put(`/productos/${id}`, productoData);
  return data;
}

// Desactivar producto - Soft Delete (ADMIN)
export async function desactivarProductoApi(id) {
  const { data } = await clienteAxios.delete(`/productos/${id}`);
  return data;
}

// Reactivar producto (ADMIN)
export async function activarProductoApi(id) {
  const { data } = await clienteAxios.patch(`/productos/${id}/activar`);
  return data;
}

// Listar categorías activas para selectores
export async function listarCategoriasApi() {
  const { data } = await clienteAxios.get('/categorias');
  return data;
}

// Listar proveedores activos para selectores (ADMIN)
export async function listarProveedoresApi() {
  const { data } = await clienteAxios.get('/proveedores');
  return data;
}

// Consultar DNI (8 dígitos) o RUC (11 dígitos) con autollenado de datos del cliente
export async function consultarDocumentoApi(numero) {
  if (!numero || !numero.trim()) return null;
  const { data } = await clienteAxios.get(`/consulta-documento?numero=${encodeURIComponent(numero.trim())}`);
  return data;
}
