import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertCircle, Building2, User, Phone, Mail, MapPin, Send } from 'lucide-react';

interface ReclamacionesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReclamacionesModal: React.FC<ReclamacionesModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    telefono: '',
    email: '',
    domicilio: '',
    tipoBien: 'PRODUCTO', // 'PRODUCTO' | 'SERVICIO'
    montoReclamado: '',
    descripcionBien: '',
    tipoReclamo: 'RECLAMO', // 'RECLAMO' (disconformidad producto/servicio) | 'QUEJA' (malestar atención)
    detalleReclamo: '',
    pedidoConcreto: '',
    aceptaTerminos: true,
  });

  const [submitted, setSubmitted] = useState(false);
  const [ticketCode, setTicketCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomCode = `LR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketCode(randomCode);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-start sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl bg-white shadow-2xl rounded-xl border border-zinc-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera Fija */}
        <div className="sticky top-0 z-20 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0d9488]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#0d9488]">
                Conforme a Ley N° 29571 • INDECOPI
              </div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-900 leading-tight">
                Libro de Reclamaciones Virtual
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar libro de reclamaciones"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Cuerpo del Modal con Scroll */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-zinc-800 text-sm">
          {submitted ? (
            <div className="text-center py-10 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Hoja de Reclamación Registrada
                </span>
                <h3 className="text-2xl font-black text-zinc-900">
                  Código de Registro: {ticketCode}
                </h3>
                <p className="text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                  Hemos recibido tu solicitud de conformidad con el Reglamento del Libro de Reclamaciones. Te hemos enviado una copia electrónica de esta hoja de reclamación a <strong>{formData.email}</strong>.
                </p>
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-600 max-w-md mx-auto text-left space-y-1.5 mt-4">
                  <p><strong>Razón Social:</strong> BOTICA NOVA SALUD E.I.R.L.</p>
                  <p><strong>RUC:</strong> 20608945123</p>
                  <p><strong>Sede:</strong> Av. Principal 1248, Lima</p>
                  <p><strong>Plazo de respuesta:</strong> Máximo 15 días hábiles conforme a normativa.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 px-8 py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-black uppercase tracking-widest rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Aceptar y Salir
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Identificación del Proveedor */}
              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-600">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0d9488] flex-shrink-0" />
                  <span><strong>BOTICA NOVA SALUD E.I.R.L.</strong> • RUC: 20608945123</span>
                </div>
                <span>Av. Principal 1248, Lima</span>
              </div>

              {/* 1. Datos del Consumidor Reclamante */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-1.5">
                  <User className="w-4 h-4 text-[#0d9488]" />
                  <span>1. Identificación del Consumidor Reclamante</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Nombre completo o Razón Social *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: María Rodríguez Quispe"
                      value={formData.nombreCompleto}
                      onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Tipo de Documento *
                    </label>
                    <select
                      value={formData.tipoDocumento}
                      onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md bg-white focus:outline-none focus:border-[#0d9488]"
                    >
                      <option value="DNI">DNI (Documento Nacional de Identidad)</option>
                      <option value="CE">Carnet de Extranjería</option>
                      <option value="PASAPORTE">Pasaporte</option>
                      <option value="RUC">RUC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Número de Documento *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 72481932"
                      value={formData.numeroDocumento}
                      onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej: 955545561"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Domicilio (Dirección, Distrito, Ciudad) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Av. Los Sauces 450, Lima"
                      value={formData.domicilio}
                      onChange={(e) => setFormData({ ...formData, domicilio: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Identificación del Bien Contratado */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-1.5">
                  <span>2. Identificación del Bien Contratado</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Tipo de Bien *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipoBien: 'PRODUCTO' })}
                        className={`py-2 px-3 text-xs font-bold uppercase rounded-md border text-center transition-colors ${
                          formData.tipoBien === 'PRODUCTO'
                            ? 'bg-[#0d9488] text-white border-[#0d9488]'
                            : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        Producto
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipoBien: 'SERVICIO' })}
                        className={`py-2 px-3 text-xs font-bold uppercase rounded-md border text-center transition-colors ${
                          formData.tipoBien === 'SERVICIO'
                            ? 'bg-[#0d9488] text-white border-[#0d9488]'
                            : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        Servicio
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Monto Reclamado (S/)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      placeholder="Ej: 45.00"
                      value={formData.montoReclamado}
                      onChange={(e) => setFormData({ ...formData, montoReclamado: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Descripción del Producto o Servicio adquirido *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Apronax 550mg caja x 120 / Servicio de inyectables"
                      value={formData.descripcionBien}
                      onChange={(e) => setFormData({ ...formData, descripcionBien: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Detalle de la Reclamación */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-1.5">
                  <AlertCircle className="w-4 h-4 text-[#0d9488]" />
                  <span>3. Detalle de la Reclamación y Pedido del Consumidor</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Tipo de Afectación *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${formData.tipoReclamo === 'RECLAMO' ? 'border-[#0d9488] bg-teal-50/50' : 'border-zinc-200'}`}>
                        <input
                          type="radio"
                          name="tipoReclamo"
                          checked={formData.tipoReclamo === 'RECLAMO'}
                          onChange={() => setFormData({ ...formData, tipoReclamo: 'RECLAMO' })}
                          className="mt-0.5 text-[#0d9488]"
                        />
                        <div>
                          <strong className="text-zinc-900 block">RECLAMO</strong>
                          <span className="text-zinc-500 text-[11px] leading-tight block">
                            Disconformidad relacionada a los productos o servicios adquiridos.
                          </span>
                        </div>
                      </label>
                      <label className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${formData.tipoReclamo === 'QUEJA' ? 'border-[#0d9488] bg-teal-50/50' : 'border-zinc-200'}`}>
                        <input
                          type="radio"
                          name="tipoReclamo"
                          checked={formData.tipoReclamo === 'QUEJA'}
                          onChange={() => setFormData({ ...formData, tipoReclamo: 'QUEJA' })}
                          className="mt-0.5 text-[#0d9488]"
                        />
                        <div>
                          <strong className="text-zinc-900 block">QUEJA</strong>
                          <span className="text-zinc-500 text-[11px] leading-tight block">
                            Malestar o descontento respecto a la atención al público (no vinculado directamente al producto).
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Detalle de los hechos sucedidos *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Explica detalladamente la disconformidad ocurrida..."
                      value={formData.detalleReclamo}
                      onChange={(e) => setFormData({ ...formData, detalleReclamo: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Pedido concreto del consumidor *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Indica qué solución o acción solicitas a Botica Nova Salud..."
                      value={formData.pedidoConcreto}
                      onChange={(e) => setFormData({ ...formData, pedidoConcreto: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488]"
                    />
                  </div>
                </div>
              </div>

              {/* Declaración legal */}
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 text-[11px] text-zinc-500 leading-relaxed">
                * Conforme al D.S. N° 011-2011-PCM, el proveedor deberá dar respuesta al reclamo en un plazo no mayor a quince (15) días hábiles improrrogables.
              </div>

              {/* Botón de Envío */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Enviar Hoja de Reclamación
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-6 border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
