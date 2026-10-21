import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Package, AlertCircle } from 'lucide-react';
import {
  crearProductoApi,
  actualizarProductoApi,
  listarCategoriasApi,
  listarProveedoresApi
} from '../api/productosApi.js';
import toast from 'react-hot-toast';

export default function ModalProducto({ producto, onClose, onGuardado, esAdmin }) {
  const esEdicion = Boolean(producto);

  const [formData, setFormData] = useState({
    codigoBarras: '',
    nombre: '',
    principioActivo: '',
    presentacion: '',
    laboratorio: '',
    costo: '',
    precio: '',
    stockInicial: 0,
    stockMinimo: 5,
    lote: '',
    fechaVencimiento: '',
    categoriaId: '',
    proveedorId: ''
  });

  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [cargandoAuxiliares, setCargandoAuxiliares] = useState(true);

  // Cargar datos del producto a editar o valores por defecto
  useEffect(() => {
    async function cargarAuxiliares() {
      try {
        const [cats, provs] = await Promise.all([
          listarCategoriasApi(),
          esAdmin ? listarProveedoresApi() : Promise.resolve([])
        ]);
        setCategorias(cats);
        setProveedores(provs);
      } catch (err) {
        console.error('Error al cargar categorías o proveedores:', err);
        toast.error('Error al cargar datos auxiliares.');
      } finally {
        setCargandoAuxiliares(false);
      }
    }

    cargarAuxiliares();

    if (producto) {
      setFormData({
        codigoBarras: producto.codigoBarras || '',
        nombre: producto.nombre || '',
        principioActivo: producto.principioActivo || '',
        presentacion: producto.presentacion || '',
        laboratorio: producto.laboratorio || '',
        costo: producto.costo ? String(producto.costo) : '',
        precio: producto.precio ? String(producto.precio) : '',
        stockMinimo: producto.stockMinimo || 5,
        lote: producto.lote || '',
        fechaVencimiento: producto.fechaVencimiento
          ? new Date(producto.fechaVencimiento).toISOString().split('T')[0]
          : '',
        categoriaId: producto.categoriaId ? String(producto.categoriaId) : '',
        proveedorId: producto.proveedorId ? String(producto.proveedorId) : ''
      });
    }
  }, [producto, esAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.presentacion.trim() || !formData.categoriaId) {
      toast.error('Complete los campos obligatorios: Nombre, Presentación y Categoría.');
      return;
    }

    if (Number(formData.precio) <= 0) {
      toast.error('El precio de venta debe ser mayor a 0.');
      return;
    }

    if (esAdmin && Number(formData.costo) <= 0) {
      toast.error('El costo debe ser mayor a 0.');
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        codigoBarras: formData.codigoBarras ? formData.codigoBarras.trim() : null,
        nombre: formData.nombre.trim(),
        principioActivo: formData.principioActivo ? formData.principioActivo.trim() : null,
        presentacion: formData.presentacion.trim(),
        laboratorio: formData.laboratorio ? formData.laboratorio.trim() : null,
        costo: Number(formData.costo),
        precio: Number(formData.precio),
        stockMinimo: Number(formData.stockMinimo) || 5,
        lote: formData.lote ? formData.lote.trim() : null,
        fechaVencimiento: formData.fechaVencimiento || null,
        categoriaId: Number(formData.categoriaId),
        proveedorId: formData.proveedorId ? Number(formData.proveedorId) : null
      };

      if (!esEdicion) {
        payload.stockInicial = Number(formData.stockInicial) || 0;
        await crearProductoApi(payload);
        toast.success('Producto registrado exitosamente.');
      } else {
        await actualizarProductoApi(producto.id, payload);
        toast.success('Producto actualizado exitosamente.');
      }

      onGuardado();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al guardar producto.';
      toast.error(msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-base">
              {esEdicion ? `Editar Producto: ${producto.nombre}` : 'Registrar Nuevo Producto'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {cargandoAuxiliares ? (
            <div className="py-12 flex justify-center items-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Cargando datos del formulario...</span>
            </div>
          ) : (
            <>
              {/* Fila 1: Nombre y Presentación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nombre del Medicamento *
                  </label>
                  <input
                    type="text"
                    required
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Paracetamol 500 mg"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Presentación Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    name="presentacion"
                    value={formData.presentacion}
                    onChange={handleChange}
                    placeholder="Ej. Caja x 100 tabletas"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Fila 2: Principio Activo y Laboratorio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Principio Activo
                  </label>
                  <input
                    type="text"
                    name="principioActivo"
                    value={formData.principioActivo}
                    onChange={handleChange}
                    placeholder="Ej. Paracetamol"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Laboratorio Fabricante
                  </label>
                  <input
                    type="text"
                    name="laboratorio"
                    value={formData.laboratorio}
                    onChange={handleChange}
                    placeholder="Ej. Portugal, Genfar, Bayer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Fila 3: Categoría y Proveedor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Categoría Farmacéutica *
                  </label>
                  <select
                    required
                    name="categoriaId"
                    value={formData.categoriaId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                  >
                    <option value="">-- Seleccione Categoría --</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                {esAdmin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Proveedor Distribuidor
                    </label>
                    <select
                      name="proveedorId"
                      value={formData.proveedorId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                    >
                      <option value="">-- Sin Proveedor asignado --</option>
                      {proveedores.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.razonSocial} (RUC: {p.ruc})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Fila 4: Costo y Precio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {esAdmin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Costo Unitario (S/) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      name="costo"
                      value={formData.costo}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Precio de Venta al Público (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Fila 5: Stock / Stock Inicial / Stock Mínimo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!esEdicion ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Stock Inicial en Almacén
                    </label>
                    <input
                      type="number"
                      min="0"
                      name="stockInicial"
                      value={formData.stockInicial}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Genera automáticamente el movimiento inicial en Kardex si es mayor a 0.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Stock en Inventario (Solo Lectura)
                    </label>
                    <input
                      type="number"
                      disabled
                      value={producto.stock}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-sm cursor-not-allowed font-bold"
                    />
                    <p className="text-[10px] text-amber-600 font-semibold mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1 inline" />
                      El stock no se edita aquí: use "Entrada" o "Ajuste".
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Stock Mínimo de Alerta
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    name="stockMinimo"
                    value={formData.stockMinimo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Fila 6: Lote, Fecha de Vencimiento y Código de Barras */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Número de Lote
                  </label>
                  <input
                    type="text"
                    name="lote"
                    value={formData.lote}
                    onChange={handleChange}
                    placeholder="Ej. L-2024-99"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    name="fechaVencimiento"
                    value={formData.fechaVencimiento}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Código de Barras
                  </label>
                  <input
                    type="text"
                    name="codigoBarras"
                    value={formData.codigoBarras}
                    onChange={handleChange}
                    placeholder="775012345001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || cargandoAuxiliares}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-600/20 flex items-center space-x-2 transition disabled:opacity-50 cursor-pointer"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{esEdicion ? 'Actualizar Producto' : 'Guardar Producto'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
