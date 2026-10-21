import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  XCircle,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  Loader2,
  PackageCheck,
  ReceiptText,
  User,
  FileText
} from 'lucide-react';
import { buscarProductosPOSApi } from '../api/productosApi.js';
import { registrarVentaApi } from '../api/ventasApi.js';
import { useCarrito } from '../context/CarritoContext.jsx';
import {
  formatearMoneda,
  formatearFechaLima,
  esProductoVencido,
  estaPorVencer
} from '../utils/formateadores.js';
import ModalTicket from '../components/ModalTicket.jsx';
import toast from 'react-hot-toast';

export default function Pos() {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [haBuscado, setHaBuscado] = useState(false);

  // Datos del cobro
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [clienteDoc, setClienteDoc] = useState('');
  const [clienteNom, setClienteNom] = useState('');
  const [cobrando, setCobrando] = useState(false);

  // Modal del ticket térmico
  const [ventaCompletada, setVentaCompletada] = useState(null);

  const {
    items,
    agregarProducto,
    actualizarCantidad,
    eliminarProducto,
    limpiarCarrito,
    totalCalculadoUI,
    cantidadTotalUI
  } = useCarrito();

  const debounceTimeout = useRef(null);

  // Búsqueda con debounce exacto de 300 ms
  useEffect(() => {
    if (!termino.trim()) {
      setResultados([]);
      setHaBuscado(false);
      setBuscando(false);
      return;
    }

    setBuscando(true);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        const prods = await buscarProductosPOSApi(termino);
        setResultados(prods);
        setHaBuscado(true);
      } catch (err) {
        console.error('Error al buscar productos para el POS:', err);
        toast.error('Error al consultar productos. Verifique la conexión.');
      } finally {
        setBuscando(false);
      }
    }, 300);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [termino]);

  // Manejador del cobro seguro
  const handleCobrar = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('El carrito está vacío. Agregue productos antes de cobrar.');
      return;
    }

    setCobrando(true);
    try {
      // Envía exclusivamente productoId y cantidad. Precios y totales los calcula el servidor.
      const res = await registrarVentaApi({
        items: items.map((i) => ({
          productoId: i.productoId,
          cantidad: i.cantidad
        })),
        metodoPago,
        clienteDoc,
        clienteNom
      });

      toast.success(res.mensaje || '¡Venta registrada exitosamente!');
      setVentaCompletada(res.venta);
      limpiarCarrito();
      setClienteDoc('');
      setClienteNom('');
      setMetodoPago('EFECTIVO');
    } catch (err) {
      // Error 400 o 409: mostramos el mensaje exacto del servidor y conservamos el carrito
      const errorServidor = err.response?.data?.error || 'No se pudo procesar la venta. Verifique los datos.';
      toast.error(errorServidor, { duration: 6000 });
    } finally {
      setCobrando(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Título y Descripción del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <ShoppingCart className="w-7 h-7 text-brand-600" />
            <span>Punto de Venta (POS)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Búsqueda rápida de medicamentos por nombre, principio activo o código de barras
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PANEL IZQUIERDO: BÚSQUEDA Y RESULTADOS (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Barra de Búsqueda */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                {buscando ? (
                  <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </div>
              <input
                type="text"
                value={termino}
                onChange={(e) => setTermino(e.target.value)}
                placeholder="Escriba nombre del medicamento, principio activo o código..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                autoFocus
              />
              {termino && (
                <button
                  onClick={() => setTermino('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Listado de Resultados */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Resultados del Catálogo
              </h2>
              {haBuscado && (
                <span className="text-xs font-semibold text-slate-500">
                  {resultados.length} producto(s) encontrado(s)
                </span>
              )}
            </div>

            <div className="p-4 divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
              {!termino.trim() && (
                <div className="py-12 text-center text-slate-400">
                  <PackageCheck className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
                  <p className="text-sm font-medium text-slate-600">Catálogo listo para búsqueda</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ingrese al menos 1 letra para buscar medicamentos en stock.
                  </p>
                </div>
              )}

              {haBuscado && resultados.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <XCircle className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
                  <p className="text-sm font-medium text-slate-600">No se encontraron medicamentos</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    No hay coincidencias activas para "{termino}".
                  </p>
                </div>
              )}

              {resultados.map((prod) => {
                const stock = Number(prod.stock);
                const precio = Number(prod.precio);
                const vencido = esProductoVencido(prod.fechaVencimiento);
                const porVencer = !vencido && estaPorVencer(prod.fechaVencimiento);
                const agotado = stock <= 0;
                const deshabilitado = vencido || agotado;

                return (
                  <div
                    key={prod.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {prod.nombre}
                        </h3>
                        {/* Insignia: Vencido */}
                        {vencido && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            <span>Vencido</span>
                          </span>
                        )}
                        {/* Insignia: Agotado */}
                        {!vencido && agotado && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                            <span>Agotado</span>
                          </span>
                        )}
                        {/* Insignia: Por Vencer */}
                        {porVencer && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Por Vencer</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                        <span>{prod.presentacion}</span>
                        {prod.principioActivo && (
                          <span>• P.A: <strong className="text-slate-600 font-medium">{prod.principioActivo}</strong></span>
                        )}
                        {prod.fechaVencimiento && (
                          <span className="flex items-center space-x-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>Vence: {formatearFechaLima(prod.fechaVencimiento)}</span>
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center space-x-4">
                        <span className="text-sm font-bold text-brand-700">
                          {formatearMoneda(precio)}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            stock > 5 ? 'text-slate-600' : stock > 0 ? 'text-amber-600' : 'text-rose-600'
                          }`}
                        >
                          Stock: {stock} u.
                        </span>
                      </div>
                    </div>

                    {/* Botón Agregar al Carrito */}
                    <button
                      type="button"
                      disabled={deshabilitado}
                      onClick={() => agregarProducto(prod)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shrink-0 ${
                        deshabilitado
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs cursor-pointer'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{vencido ? 'No Vendible' : agotado ? 'Sin Stock' : 'Agregar'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: CARRITO Y CAJA DE COBRO (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            {/* Cabecera del Carrito */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-brand-600" />
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Ticket en Proceso
                </h2>
              </div>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={limpiarCarrito}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                >
                  Vaciar
                </button>
              )}
            </div>

            {/* Listado de Ítems en Carrito */}
            <div className="p-4 divide-y divide-slate-100 max-h-[35vh] overflow-y-auto">
              {items.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <ReceiptText className="w-10 h-10 mx-auto stroke-1 text-slate-300 mb-1" />
                  <p className="text-xs text-slate-500 font-medium">No hay productos en el carrito</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Busque y seleccione productos para registrar la venta.
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  const subtotalItem = item.precio * item.cantidad;
                  return (
                    <div
                      key={item.productoId}
                      className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.nombre}</p>
                        <p className="text-[11px] text-slate-500">
                          {formatearMoneda(item.precio)} c/u • Max stock: {item.stock}
                        </p>
                        <p className="text-xs font-bold text-brand-700 mt-0.5">
                          Subtotal: {formatearMoneda(subtotalItem)}
                        </p>
                      </div>

                      {/* Controles de Cantidad (+ / - / eliminar) */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition"
                          title="Disminuir unidad"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-bold text-xs text-slate-800">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          disabled={item.cantidad >= item.stock}
                          onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition ${
                            item.cantidad >= item.stock
                              ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title="Aumentar unidad"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarProducto(item.productoId)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition ml-1"
                          title="Eliminar de carrito"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Formulario de Cobro */}
            <form onSubmit={handleCobrar} className="p-4 bg-slate-50/70 border-t border-slate-200 space-y-4">
              {/* Método de Pago */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodoPago('EFECTIVO')}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 border transition ${
                      metodoPago === 'EFECTIVO'
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Efectivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodoPago('YAPE_PLIN')}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 border transition ${
                      metodoPago === 'YAPE_PLIN'
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Yape / Plin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodoPago('TARJETA')}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 border transition ${
                      metodoPago === 'TARJETA'
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Tarjeta</span>
                  </button>
                </div>
              </div>

              {/* Datos Opcionales del Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    DNI / RUC (Opcional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      maxLength={11}
                      value={clienteDoc}
                      onChange={(e) => setClienteDoc(e.target.value.replace(/\D/g, ''))}
                      placeholder="8 o 11 dígitos"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Nombre Cliente (Opcional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={clienteNom}
                      onChange={(e) => setClienteNom(e.target.value)}
                      placeholder="Cliente General"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Resumen Total de Cobro */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-500 font-semibold">Total a Cobrar:</p>
                  <p className="text-[10px] text-slate-400">{cantidadTotalUI} unidad(es)</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {formatearMoneda(totalCalculadoUI)}
                  </span>
                </div>
              </div>

              {/* Botón de Cobro (Deshabilitado en vuelo para evitar ventas duplicadas) */}
              <button
                type="submit"
                disabled={cobrando || items.length === 0}
                className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-600/20 flex items-center justify-center space-x-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {cobrando ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Registrando venta en caja...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Completar Venta y Emitir Ticket</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal del Ticket Térmico al Completar la Venta */}
      {ventaCompletada && (
        <ModalTicket
          venta={ventaCompletada}
          onClose={() => setVentaCompletada(null)}
        />
      )}
    </div>
  );
}

function CheckCircleIcon(props) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
