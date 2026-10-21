import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowDownRight,
  History,
  Edit,
  Trash2,
  AlertTriangle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  listarProductosApi,
  desactivarProductoApi,
  listarCategoriasApi
} from '../api/productosApi.js';
import {
  formatearMoneda,
  formatearFechaLima,
  esProductoVencido,
  estaPorVencer
} from '../utils/formateadores.js';
import ModalProducto from '../components/ModalProducto.jsx';
import ModalEntrada from '../components/ModalEntrada.jsx';
import ModalAjuste from '../components/ModalAjuste.jsx';
import ModalKardex from '../components/ModalKardex.jsx';
import toast from 'react-hot-toast';

export default function Inventario() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMIN';

  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);

  // Filtros soportados exactamente por el API (page, limit, categoriaId, busqueda, activo)
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [mostrarDesactivados, setMostrarDesactivados] = useState(false);
  const [categorias, setCategorias] = useState([]);

  // Estados de Modales
  const [modalProductoData, setModalProductoData] = useState(null); // null = cerrado, 'NUEVO' o objeto = editar
  const [modalEntradaProd, setModalEntradaProd] = useState(null);
  const [modalAjusteProd, setModalAjusteProd] = useState(null);
  const [modalKardexProd, setModalKardexProd] = useState(null);

  // Cargar categorías una sola vez
  useEffect(() => {
    listarCategoriasApi()
      .then(setCategorias)
      .catch((err) => console.error('Error al cargar categorías:', err));
  }, []);

  // Cargar productos usando paginación real del API
  const cargarProductos = useCallback(async (p = 1) => {
    setCargando(true);
    try {
      const params = {
        page: p,
        limit: 20
      };

      if (busqueda.trim()) params.busqueda = busqueda.trim();
      if (categoriaId) params.categoriaId = categoriaId;
      if (esAdmin && mostrarDesactivados) params.activo = 'false';

      const data = await listarProductosApi(params);
      setProductos(data.productos || []);
      setTotal(data.total || 0);
      setPaginaActual(data.paginaActual || 1);
      setTotalPaginas(data.totalPaginas || 1);
    } catch (err) {
      console.error('Error al listar productos:', err);
      toast.error('Error al consultar inventario.');
    } finally {
      setCargando(false);
    }
  }, [busqueda, categoriaId, mostrarDesactivados, esAdmin]);

  useEffect(() => {
    cargarProductos(1);
  }, [cargarProductos]);

  const handleBuscarSubmit = (e) => {
    e.preventDefault();
    cargarProductos(1);
  };

  const handleDesactivar = async (prod) => {
    if (!window.confirm(`¿Está seguro de desactivar el producto "${prod.nombre}"? No aparecerá en el POS.`)) {
      return;
    }

    try {
      const res = await desactivarProductoApi(prod.id);
      toast.success(res.mensaje || 'Producto desactivado exitosamente.');
      cargarProductos(paginaActual);
    } catch (err) {
      const msg = err.response?.data?.error || 'No se pudo desactivar el producto.';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Encabezado y Acción Crear */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Package className="w-7 h-7 text-brand-600" />
            <span>Inventario de Medicamentos</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {esAdmin
              ? 'Control de existencias, precios, compras, ajustes físicos y auditoría Kardex'
              : 'Consulta de existencias y disponibilidad en almacén (Modo Cajero: solo lectura)'}
          </p>
        </div>

        {esAdmin && (
          <button
            onClick={() => setModalProductoData('NUEVO')}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center space-x-1.5 transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        )}
      </div>

      {/* Barra de Filtros Soportados por el API */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Búsqueda por texto */}
        <form onSubmit={handleBuscarSubmit} className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, principio activo o código..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition"
          />
        </form>

        {/* Filtro por Categoría */}
        <div className="shrink-0">
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="w-full md:w-56 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition"
          >
            <option value="">Todas las Categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Checkbox Mostrar Desactivados (ADMIN) */}
        {esAdmin && (
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 select-none cursor-pointer shrink-0 px-2">
            <input
              type="checkbox"
              checked={mostrarDesactivados}
              onChange={(e) => setMostrarDesactivados(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
            />
            <span>Mostrar Desactivados</span>
          </label>
        )}
      </div>

      {/* Tabla de Productos Paginada */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Medicamento</th>
                <th className="px-4 py-3.5">Categoría</th>
                <th className="px-4 py-3.5 text-right">Precio Venta</th>
                {esAdmin && <th className="px-4 py-3.5 text-right">Costo</th>}
                {esAdmin && <th className="px-4 py-3.5">Proveedor</th>}
                <th className="px-4 py-3.5 text-center">Stock</th>
                <th className="px-4 py-3.5">Vencimiento</th>
                <th className="px-4 py-3.5 text-center">Estado</th>
                {esAdmin && <th className="px-4 py-3.5 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {cargando ? (
                <tr>
                  <td colSpan={esAdmin ? 9 : 6} className="py-16 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-2" />
                    <p className="text-sm font-medium">Cargando inventario...</p>
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={esAdmin ? 9 : 6} className="py-16 text-center text-slate-400">
                    <Package className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-600">No se encontraron productos</p>
                    <p className="text-xs text-slate-400 mt-0.5">Pruebe ajustando los filtros de búsqueda.</p>
                  </td>
                </tr>
              ) : (
                productos.map((prod) => {
                  const stock = Number(prod.stock);
                  const vencido = esProductoVencido(prod.fechaVencimiento);
                  const porVencer = !vencido && estaPorVencer(prod.fechaVencimiento);
                  const bajoStock = stock <= Number(prod.stockMinimo);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                      {/* Medicamento */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 text-sm leading-tight">{prod.nombre}</p>
                        <p className="text-[11px] text-slate-500">{prod.presentacion}</p>
                        {prod.principioActivo && (
                          <p className="text-[10px] text-brand-700 font-medium">P.A: {prod.principioActivo}</p>
                        )}
                        {prod.codigoBarras && (
                          <p className="text-[10px] text-slate-400 font-mono">Cod: {prod.codigoBarras}</p>
                        )}
                      </td>

                      {/* Categoría */}
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {prod.categoria?.nombre || 'General'}
                        </span>
                      </td>

                      {/* Precio */}
                      <td className="px-4 py-3.5 text-right font-extrabold text-slate-900 whitespace-nowrap">
                        {formatearMoneda(prod.precio)}
                      </td>

                      {/* Costo (ADMIN) */}
                      {esAdmin && (
                        <td className="px-4 py-3.5 text-right font-semibold text-slate-500 whitespace-nowrap">
                          {formatearMoneda(prod.costo)}
                        </td>
                      )}

                      {/* Proveedor (ADMIN) */}
                      {esAdmin && (
                        <td className="px-4 py-3.5 text-slate-600 text-xs max-w-[130px] truncate" title={prod.proveedor?.razonSocial}>
                          {prod.proveedor?.razonSocial || '—'}
                        </td>
                      )}

                      {/* Stock */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-black text-sm ${
                              stock === 0 ? 'text-rose-600' : bajoStock ? 'text-amber-600' : 'text-slate-900'
                            }`}
                          >
                            {stock}
                          </span>
                          <span className="text-[9px] text-slate-400">Min: {prod.stockMinimo}</span>
                        </div>
                      </td>

                      {/* Vencimiento */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="text-slate-700 text-xs">{formatearFechaLima(prod.fechaVencimiento)}</p>
                        {vencido ? (
                          <span className="inline-flex items-center text-[10px] font-bold text-rose-700">
                            <XCircle className="w-3 h-3 mr-0.5" /> Vencido
                          </span>
                        ) : porVencer ? (
                          <span className="inline-flex items-center text-[10px] font-bold text-amber-700">
                            <AlertTriangle className="w-3 h-3 mr-0.5" /> Por Vencer
                          </span>
                        ) : null}
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prod.activo
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {prod.activo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>

                      {/* Acciones (ADMIN) */}
                      {esAdmin && (
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            {/* Entrada */}
                            <button
                              onClick={() => setModalEntradaProd(prod)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                              title="Registrar Entrada de Stock"
                            >
                              <ArrowDownRight className="w-4 h-4" />
                            </button>

                            {/* Ajuste */}
                            <button
                              onClick={() => setModalAjusteProd(prod)}
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                              title="Ajuste de Inventario Físico"
                            >
                              <SlidersHorizontal className="w-4 h-4" />
                            </button>

                            {/* Kardex */}
                            <button
                              onClick={() => setModalKardexProd(prod)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                              title="Ver Movimientos de Kardex"
                            >
                              <History className="w-4 h-4" />
                            </button>

                            {/* Editar */}
                            <button
                              onClick={() => setModalProductoData(prod)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                              title="Editar Producto"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Desactivar */}
                            {prod.activo && (
                              <button
                                onClick={() => handleDesactivar(prod)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                                title="Desactivar Producto (Soft Delete)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación del Servidor */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Mostrando página <strong className="text-slate-900">{paginaActual}</strong> de{' '}
            <strong className="text-slate-900">{totalPaginas || 1}</strong> (Total: {total} productos)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => cargarProductos(paginaActual - 1)}
              disabled={paginaActual <= 1 || cargando}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
            <button
              onClick={() => cargarProductos(paginaActual + 1)}
              disabled={paginaActual >= totalPaginas || cargando}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modales Administrador */}
      {modalProductoData && (
        <ModalProducto
          producto={modalProductoData === 'NUEVO' ? null : modalProductoData}
          onClose={() => setModalProductoData(null)}
          onGuardado={() => cargarProductos(paginaActual)}
          esAdmin={esAdmin}
        />
      )}

      {modalEntradaProd && (
        <ModalEntrada
          producto={modalEntradaProd}
          onClose={() => setModalEntradaProd(null)}
          onCompletado={() => cargarProductos(paginaActual)}
        />
      )}

      {modalAjusteProd && (
        <ModalAjuste
          producto={modalAjusteProd}
          onClose={() => setModalAjusteProd(null)}
          onCompletado={() => cargarProductos(paginaActual)}
        />
      )}

      {modalKardexProd && (
        <ModalKardex
          producto={modalKardexProd}
          onClose={() => setModalKardexProd(null)}
        />
      )}
    </div>
  );
}
