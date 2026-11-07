import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Loader2,
  Package,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  Barcode,
  Calendar,
  Sparkles,
  TrendingUp,
  Building2,
  Layers,
  CheckCircle2,
  ArrowDownRight,
  SlidersHorizontal
} from 'lucide-react';
import {
  crearProductoApi,
  actualizarProductoApi,
  listarCategoriasApi,
  listarProveedoresApi
} from '../api/productosApi.js';
import { notificarExito, notificarError } from '../utils/alertaSweet.js';

export default function ModalProducto({
  producto,
  onClose,
  onGuardado,
  onAbrirEntrada,
  onAbrirAjuste,
  esAdmin
}) {
  const esEdicion = Boolean(producto);
  const fileInputRef = useRef(null);

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
    imagen: '',
    categoriaId: '',
    proveedorId: ''
  });

  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [cargandoAuxiliares, setCargandoAuxiliares] = useState(true);
  const [mostrarUrlInput, setMostrarUrlInput] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);

  // Cargar datos del producto a editar o valores por defecto
  useEffect(() => {
    async function cargarAuxiliares() {
      try {
        const [cats, provs] = await Promise.all([
          listarCategoriasApi(),
          esAdmin ? listarProveedoresApi() : Promise.resolve([])
        ]);
        setCategorias(cats || []);
        setProveedores(provs || []);
      } catch (err) {
        console.error('Error al cargar categorías o proveedores:', err);
        notificarError('Error de Carga', 'Error al cargar datos auxiliares.');
      } finally {
        setCargandoAuxiliares(false);
      }
    }

    cargarAuxiliares();

    if (producto) {
      const catId = producto.categoriaId ?? producto.categoria?.id ?? '';
      const provId = producto.proveedorId ?? producto.proveedor?.id ?? '';

      setFormData({
        codigoBarras: producto.codigoBarras || '',
        nombre: producto.nombre || '',
        principioActivo: producto.principioActivo || '',
        presentacion: producto.presentacion || '',
        laboratorio: producto.laboratorio || '',
        costo: producto.costo !== null && producto.costo !== undefined ? String(producto.costo) : '',
        precio: producto.precio !== null && producto.precio !== undefined ? String(producto.precio) : '',
        stockMinimo: producto.stockMinimo || 5,
        lote: producto.lote || '',
        fechaVencimiento: producto.fechaVencimiento
          ? new Date(producto.fechaVencimiento).toISOString().split('T')[0]
          : '',
        imagen: producto.imagen || '',
        categoriaId: catId ? String(catId) : '',
        proveedorId: provId ? String(provId) : ''
      });
      if (producto.imagen && producto.imagen.startsWith('http')) {
        setMostrarUrlInput(true);
      }
    }
  }, [producto, esAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Procesar archivo seleccionado desde el ordenador con compresión canvas
  const procesarArchivoImagen = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notificarError('Archivo no válido', 'Por favor seleccione una imagen en formato JPG, PNG o WEBP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800; // Resolución óptima para catálogo y POS
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Comprimir a formato WebP ligero (< 80KB)
        const dataUrl = canvas.toDataURL('image/webp', 0.85);
        setFormData((prev) => ({ ...prev, imagen: dataUrl }));
        setMostrarUrlInput(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) procesarArchivoImagen(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastrando(false);
    const file = e.dataTransfer.files?.[0];
    if (file) procesarArchivoImagen(file);
  };

  const handleQuitarImagen = () => {
    setFormData((prev) => ({ ...prev, imagen: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerarCodigoBarras = () => {
    const prefijo = '775'; // GS1 Perú
    const aleatorio = Math.floor(100000000 + Math.random() * 900000000);
    setFormData((prev) => ({ ...prev, codigoBarras: `${prefijo}${aleatorio}` }));
  };

  // Cálculo de Margen Comercial en tiempo real
  const costoNum = Number(formData.costo) || 0;
  const precioNum = Number(formData.precio) || 0;
  const gananciaSoles = precioNum > costoNum ? (precioNum - costoNum).toFixed(2) : '0.00';
  const margenPorcentaje = costoNum > 0 && precioNum > costoNum
    ? Math.round(((precioNum - costoNum) / costoNum) * 100)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.presentacion.trim() || !formData.categoriaId) {
      notificarError('Campos Incompletos', 'Complete los campos obligatorios: Nombre, Presentación y Categoría.');
      return;
    }

    if (Number(formData.precio) <= 0) {
      notificarError('Precio Inválido', 'El precio de venta debe ser mayor a 0.');
      return;
    }

    if (esAdmin && Number(formData.costo) <= 0) {
      notificarError('Costo Inválido', 'El costo debe ser mayor a 0.');
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
        imagen: formData.imagen ? formData.imagen.trim() : null,
        categoriaId: Number(formData.categoriaId),
        proveedorId: formData.proveedorId ? Number(formData.proveedorId) : null
      };

      if (!esEdicion) {
        payload.stockInicial = Number(formData.stockInicial) || 0;
        await crearProductoApi(payload);
        notificarExito('Fármaco Registrado', 'El medicamento fue agregado al catálogo con éxito.');
      } else {
        await actualizarProductoApi(producto.id, payload);

        // Feedback Sanitario en Tiempo Real:
        // Si la fecha configurada es anterior a hoy, advertir al usuario sobre el bloqueo sanitario automático
        const fVenc = payload.fechaVencimiento ? new Date(payload.fechaVencimiento) : null;
        const ahoraLima = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));
        ahoraLima.setHours(0, 0, 0, 0);

        if (fVenc && fVenc < ahoraLima) {
          notificarExito(
            'Lote Caducado Detectado',
            'El fármaco ha sido inmovilizado y marcado como INACTIVO. Se retiró automáticamente de la tienda web y mostrador POS (Normativa DIGEMID).'
          );
        } else {
          notificarExito('Fármaco Actualizado', 'Los cambios en el medicamento se guardaron con éxito.');
        }
      }

      onGuardado();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al guardar producto.';
      notificarError('Error al guardar', msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-5xl w-full border border-slate-200 dark:border-neutral-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col my-auto">
        {/* Cabecera Superior con Estilo Oficial Botica Nova Salud */}
        <div className="bg-slate-50/90 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 border border-teal-200/80 dark:border-teal-800 flex items-center justify-center font-bold shadow-2xs">
              <Package className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                  {esEdicion ? `Editar Fármaco: ${producto.nombre}` : 'Registrar Nuevo Medicamento'}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                  {esEdicion ? 'Actualización' : 'DIGEMID Oficial'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                Información técnica, trazabilidad por lote y sincronización inmediata con Catálogo Web & POS
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-neutral-800 transition cursor-pointer"
            title="Cerrar ventana (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario con Arquitectura Horizontal (Sin Scroll en Pantalla) */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {cargandoAuxiliares ? (
            <div className="py-16 flex flex-col justify-center items-center text-slate-500 dark:text-neutral-400 space-y-2">
              <Loader2 className="w-7 h-7 animate-spin text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold text-slate-600 dark:text-neutral-300">Cargando catálogo y proveedores...</span>
            </div>
          ) : (
            <>
              {/* Cuadrícula Principal de 2 Columnas Horizontales */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* =========================================================
                    COLUMNA IZQUIERDA: FOTOGRAFÍA + TRAZABILIDAD (4 cols)
                    ========================================================= */}
                <div className="lg:col-span-4 space-y-3">
                  {/* Bloque: Fotografía del Medicamento */}
                  <div className="bg-slate-50/80 dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300 flex items-center space-x-1">
                        <ImageIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Foto del Producto</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setMostrarUrlInput(!mostrarUrlInput)}
                        className="text-[10px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 underline flex items-center space-x-1 cursor-pointer"
                      >
                        <LinkIcon className="w-2.5 h-2.5" />
                        <span>{mostrarUrlInput ? 'Cargar desde PC' : 'Pegar URL'}</span>
                      </button>
                    </div>

                    {/* Zona Dropzone / Previsualización */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setArrastrando(true);
                      }}
                      onDragLeave={() => setArrastrando(false)}
                      onDrop={handleDrop}
                      onClick={() => !formData.imagen && fileInputRef.current?.click()}
                      className={`relative w-full h-36 rounded-xl border-2 border-dashed transition flex flex-col items-center justify-center p-2 text-center overflow-hidden group select-none ${
                        formData.imagen
                          ? 'border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900'
                          : arrastrando
                          ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 cursor-copy'
                          : 'border-slate-300 dark:border-neutral-700 hover:border-teal-400 dark:hover:border-teal-500 bg-white dark:bg-neutral-900 hover:bg-slate-50/50 dark:hover:bg-neutral-800/40 cursor-pointer'
                      }`}
                    >
                      {formData.imagen ? (
                        <>
                          <img
                            src={formData.imagen}
                            alt="Previsualización del fármaco"
                            className="w-full h-full object-contain p-1 rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2 p-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                              className="px-2.5 py-1 bg-white dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 text-[10px] font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700 transition shadow"
                            >
                              Cambiar
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuitarImagen();
                              }}
                              className="px-2.5 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg hover:bg-rose-700 transition shadow flex items-center space-x-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Quitar</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1.5 pointer-events-none">
                          <div className="w-9 h-9 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto border border-teal-100 dark:border-teal-800">
                            <Upload className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-neutral-200">Subir imagen del ordenador</p>
                            <p className="text-[10px] text-slate-400 dark:text-neutral-500">o arrastra aquí (JPG, PNG, WEBP)</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input invisible de Archivo */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    {/* Botón explícito para examinar archivo desde PC */}
                    {!formData.imagen && !mostrarUrlInput && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-1.5 bg-white dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200 border border-slate-300 dark:border-neutral-700 rounded-xl text-[11px] font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Elegir archivo desde este equipo</span>
                      </button>
                    )}

                    {/* Campo alternativo de URL si el usuario lo prefiere */}
                    {mostrarUrlInput && (
                      <div className="space-y-1">
                        <input
                          type="text"
                          name="imagen"
                          value={formData.imagen}
                          onChange={handleChange}
                          placeholder="https://... o /media/products/ejemplo.jpg"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg text-[11px] font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                        <p className="text-[9px] text-slate-400 dark:text-neutral-500">Pegar URL directa de imagen web</p>
                      </div>
                    )}
                  </div>

                  {/* Bloque: Trazabilidad Sanitaria DIGEMID */}
                  <div className="bg-slate-50/80 dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-3.5 space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300 flex items-center space-x-1">
                      <Barcode className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Lote & Trazabilidad Sanitaria</span>
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-neutral-400 uppercase mb-0.5">
                          Número de Lote
                        </label>
                        <input
                          type="text"
                          name="lote"
                          value={formData.lote}
                          onChange={handleChange}
                          placeholder="L-2026-REG"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg text-xs font-mono font-bold text-teal-900 dark:text-teal-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-neutral-400 uppercase mb-0.5">
                          Fecha Vencimiento
                        </label>
                        <input
                          type="date"
                          name="fechaVencimiento"
                          value={formData.fechaVencimiento}
                          onChange={handleChange}
                          className="w-full px-2 py-1.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-neutral-400 uppercase">
                          Código de Barras (GS1)
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerarCodigoBarras}
                          className="text-[9px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 flex items-center space-x-0.5 cursor-pointer"
                          title="Generar código de barras aleatorio formato GS1 Perú"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Autogenerar</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        name="codigoBarras"
                        value={formData.codigoBarras}
                        onChange={handleChange}
                        placeholder="775000000001"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* =========================================================
                    COLUMNA DERECHA: DATOS CLÍNICOS + PRECIOS + STOCK (8 cols)
                    ========================================================= */}
                <div className="lg:col-span-8 space-y-3">
                  {/* Bloque 1: Ficha Clínica y Comercial */}
                  <div className="bg-white dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-4 space-y-3 shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300 flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Identificación Farmacéutica</span>
                    </span>

                    {/* Fila 1: Nombre y Presentación */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-7">
                        <label className="block text-[10px] font-bold text-slate-700 dark:text-neutral-300 uppercase mb-1">
                          Nombre Comercial del Medicamento *
                        </label>
                        <input
                          type="text"
                          required
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          placeholder="Ej. Paracetamol 500 mg"
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-neutral-850 focus:outline-none transition"
                        />
                      </div>

                      <div className="sm:col-span-5">
                        <label className="block text-[10px] font-bold text-slate-700 dark:text-neutral-300 uppercase mb-1">
                          Presentación Comercial *
                        </label>
                        <input
                          type="text"
                          required
                          name="presentacion"
                          value={formData.presentacion}
                          onChange={handleChange}
                          placeholder="Ej. Caja x 100 tabletas"
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs text-slate-800 dark:text-neutral-200 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-neutral-850 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Fila 2: Principio Activo y Laboratorio */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 dark:text-neutral-300 uppercase mb-1">
                          Principio Activo (DCI)
                        </label>
                        <input
                          type="text"
                          name="principioActivo"
                          value={formData.principioActivo}
                          onChange={handleChange}
                          placeholder="Ej. Paracetamol (Acetaminofén)"
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs text-slate-800 dark:text-neutral-200 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-neutral-850 focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 dark:text-neutral-300 uppercase mb-1">
                          Laboratorio Fabricante
                        </label>
                        <input
                          type="text"
                          name="laboratorio"
                          value={formData.laboratorio}
                          onChange={handleChange}
                          placeholder="Ej. Portugal, Genfar, Bayer"
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs text-slate-800 dark:text-neutral-200 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-neutral-850 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Fila 3: Categoría Farmacéutica y Proveedor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 dark:text-neutral-300 uppercase mb-1">
                          Categoría Farmacéutica *
                        </label>
                        <select
                          required
                          name="categoriaId"
                          value={formData.categoriaId}
                          onChange={handleChange}
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-neutral-200 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-neutral-850 focus:outline-none transition cursor-pointer"
                        >
                          <option value="">-- Seleccionar Categoría --</option>
                          {categorias.map((c) => (
                            <option key={c.id} value={String(c.id)}>
                              {c.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {esAdmin ? (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 dark:text-neutral-300 uppercase mb-1">
                            Proveedor / Droguería
                          </label>
                          <select
                            name="proveedorId"
                            value={formData.proveedorId}
                            onChange={handleChange}
                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs text-slate-800 dark:text-neutral-200 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-neutral-850 focus:outline-none transition cursor-pointer"
                          >
                            <option value="">-- Sin Proveedor asignado --</option>
                            {proveedores.map((p) => (
                              <option key={p.id} value={String(p.id)}>
                                {p.razonSocial} (RUC: {p.ruc})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center text-xs text-slate-400 dark:text-neutral-500">
                          <span>Información de proveedor restringida a administradores</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bloque 2: Economía, Margen Comercial & Almacén */}
                  <div className="bg-white dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-4 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300 flex items-center space-x-1">
                        <TrendingUp className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Precios, Rentabilidad & Control de Stock</span>
                      </span>

                      {/* Margen Calculado en Tiempo Real */}
                      {margenPorcentaje > 0 && (
                        <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
                          <span>+{margenPorcentaje}% Margen</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">(S/ {gananciaSoles} ganancia)</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Costo */}
                      {esAdmin && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 dark:text-neutral-300 uppercase mb-1">
                            Costo Compra (S/) *
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
                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-neutral-850 focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Precio Venta */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 dark:text-neutral-300 uppercase mb-1">
                          Precio Venta (S/) *
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
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-mono font-black text-teal-900 dark:text-teal-300 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-neutral-850 focus:outline-none"
                        />
                      </div>

                      {/* Stock Inicial o Stock Actual */}
                      {!esEdicion ? (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 dark:text-neutral-300 uppercase mb-1">
                            Stock Inicial
                          </label>
                          <input
                            type="number"
                            min="0"
                            name="stockInicial"
                            value={formData.stockInicial}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-neutral-850 focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase mb-1">
                            Stock Actual
                          </label>
                          <input
                            type="number"
                            disabled
                            value={producto.stock}
                            className="w-full px-3 py-1.5 bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 font-mono font-black rounded-xl text-xs cursor-not-allowed"
                          />
                        </div>
                      )}

                      {/* Stock Mínimo */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 dark:text-neutral-300 uppercase mb-1">
                          Stock Mínimo
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          name="stockMinimo"
                          value={formData.stockMinimo}
                          onChange={handleChange}
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-neutral-850 focus:outline-none"
                        />
                      </div>
                    </div>

                    {esEdicion && (
                      <div className="text-[11px] text-amber-800 dark:text-amber-200 bg-amber-50/90 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>Por auditoría de Kardex DIGEMID, el stock físico se gestiona con:</span>
                        </div>
                        <div className="flex items-center space-x-1.5 shrink-0">
                          {onAbrirEntrada && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onAbrirEntrada(producto);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer shadow-2xs flex items-center space-x-1"
                              title="Registrar ingreso de mercadería (+ compra a droguería)"
                            >
                              <ArrowDownRight className="w-3 h-3" />
                              <span>+ Entrada Stock</span>
                            </button>
                          )}
                          {onAbrirAjuste && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onAbrirAjuste(producto);
                              }}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer shadow-2xs flex items-center space-x-1"
                              title="Ajustar stock físico real (rotura, merma o conteo físico)"
                            >
                              <SlidersHorizontal className="w-3 h-3" />
                              <span>Ajuste Físico</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Barra de Acciones Inferior Integrada */}
          <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 dark:text-neutral-500 font-medium hidden sm:block">
              {esEdicion
                ? 'Todos los cambios se reflejan en tiempo real en la tienda web y POS.'
                : 'El nuevo producto quedará disponible inmediatamente para venta y dispensación.'}
            </div>

            <div className="flex items-center space-x-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={guardando}
                className="px-4 py-2 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={guardando || cargandoAuxiliares}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-teal-600/20 flex items-center space-x-2 transition disabled:opacity-50 cursor-pointer"
              >
                {guardando ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{esEdicion ? 'Actualizar Fármaco' : 'Guardar Fármaco'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
