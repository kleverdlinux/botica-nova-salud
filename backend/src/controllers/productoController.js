import * as productoService from '../services/productoService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const buscarPOS = asyncHandler(async (req, res) => {
  const productos = await productoService.buscarProductosPOS(req.query.q);
  return res.status(200).json(productos);
});

export const listar = asyncHandler(async (req, res) => {
  const resultado = await productoService.listarProductos({
    rol: req.usuario.rol,
    activoQuery: req.query.activo,
    page: req.query.page,
    limit: req.query.limit,
    categoriaId: req.query.categoriaId,
    busqueda: req.query.busqueda
  });
  return res.status(200).json(resultado);
});

export const obtenerPorId = asyncHandler(async (req, res) => {
  const producto = await productoService.obtenerProductoPorId(req.params.id, req.usuario.rol);
  return res.status(200).json(producto);
});

export const crear = asyncHandler(async (req, res) => {
  const nuevoProducto = await productoService.crearProducto(req.body, req.usuario.id);
  return res.status(201).json(nuevoProducto);
});

export const actualizar = asyncHandler(async (req, res) => {
  const actualizado = await productoService.actualizarProducto(req.params.id, req.body);
  return res.status(200).json(actualizado);
});

export const desactivar = asyncHandler(async (req, res) => {
  const desactivado = await productoService.desactivarProducto(req.params.id);
  return res.status(200).json({
    mensaje: 'Producto desactivado exitosamente (Soft Delete).',
    producto: desactivado
  });
});

export const activar = asyncHandler(async (req, res) => {
  const activado = await productoService.activarProducto(req.params.id);
  return res.status(200).json({
    mensaje: 'Producto reactivado exitosamente.',
    producto: activado
  });
});

export const listarCategorias = asyncHandler(async (req, res) => {
  const categorias = await productoService.listarCategorias();
  return res.status(200).json(categorias);
});

export const listarProveedores = asyncHandler(async (req, res) => {
  const proveedores = await productoService.listarProveedores();
  return res.status(200).json(proveedores);
});
