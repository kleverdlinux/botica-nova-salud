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
      <div className="relative w-full max-w-5xl xl:max-w-6xl bg-white shadow-2xl rounded-2xl border border-zinc-200 overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera Fija */}
        <div className="sticky top-0 z-20 bg-white border-b border-zinc-200 px-5 sm:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0d9488] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#0d9488] truncate">
                Conforme a Ley N° 29571 • INDECOPI
              </div>
              <h2 className="text-base sm:text-lg font-black text-zinc-900 leading-tight truncate">
                Libro de Reclamaciones Virtual
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar libro de reclamaciones"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Cuerpo del Modal Horizontal */}
        <div className="p-4 sm:p-6 lg:p-7 overflow-y-auto text-zinc-800 text-xs">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
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
                <p className="text-xs sm:text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed">
                  Hemos recibido tu solicitud de conformidad con el Reglamento del Libro de Reclamaciones. Te hemos enviado una copia electrónica de esta hoja de reclamación a <strong>{formData.email}</strong>.
                </p>
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-600 max-w-md mx-auto text-left space-y-1.5 mt-3">
                  <p><strong>Razón Social:</strong> BOTICA NOVA SALUD E.I.R.L.</p>
                  <p><strong>RUC:</strong> 20608945123</p>
                  <p><strong>Sede:</strong> Jr. Mariano Núñez 485, Cercado de Juliaca, San Román, Puno</p>
                  <p><strong>Plazo de respuesta:</strong> Máximo 15 días hábiles conforme a normativa.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 px-8 py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-black uppercase tracking-widest rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Aceptar y Salir
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7 items-start">
                {/* Columna Izquierda: Consumidor y Bien Contratado */}
                <div className="space-y-4">
                  {/* Identificación del Proveedor */}
                  <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg flex items-center justify-between gap-2 text-[11px] text-zinc-600">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Building2 className="w-3.5 h-3.5 text-[#0d9488] shrink-0" />
                      <span className="truncate"><strong>BOTICA NOVA SALUD E.I.R.L.</strong> • RUC: 20608945123</span>
                    </div>
                    <span className="shrink-0 text-zinc-500">Jr. Mariano Núñez 485, Juliaca</span>
                  </div>

                  {/* 1. Datos del Consumidor Reclamante */}
                  <div className="space-y-2.5 bg-zinc-50/60 p-3.5 rounded-xl border border-zinc-200/80">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1.5">
                      <User className="w-3.5 h-3.5 text-[#0d9488]" />
                      <span>1. Identificación del Consumidor</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-zinc-700 mb-0.5">
                          Nombre completo o Razón Social *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: María Rodríguez Quispe"
                          value={formData.nombreCompleto}
                          onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 mb-0.5">
                          Tipo de Documento *
                        </label>
                        <select
                          value={formData.tipoDocumento}
                          onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-md bg-white focus:outline-none focus:border-[#0d9488]"
                        >
                          <option value="DNI">DNI (Identidad)</option>
                          <option value="CE">Carnet Extranjería</option>
                          <option value="PASAPORTE">Pasaporte</option>
                          <option value="RUC">RUC</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 mb-0.5">
                          Número de Documento *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: 72481932"
                          value={formData.numeroDocumento}
                          onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 mb-0.5">
                          Teléfono / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="Ej: 955545561"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 mb-0.5">
                          Correo Electrónico *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="tu@correo.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488] bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-zinc-700 mb-0.5">
                          Domicilio (Dirección, Distrito, Ciudad) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Jr. Mariano Núñez 450, Juliaca"
                          value={formData.domicilio}
                          onChange={(e) => setFormData({ ...formData, domicilio: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488] bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Identificación del Bien Contratado */}
                  <div className="space-y-2.5 bg-zinc-50/60 p-3.5 rounded-xl border border-zinc-200/80">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1.5">
                      <span>2. Identificación del Bien Contratado</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 mb-0.5">
                          Tipo de Bien *
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, tipoBien: 'PRODUCTO' })}
                            className={`py-1.5 px-2 text-xs font-bold uppercase rounded-md border text-center transition-colors cursor-pointer ${
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
                            className={`py-1.5 px-2 text-xs font-bold uppercase rounded-md border text-center transition-colors cursor-pointer ${
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
                        <label className="block text-[11px] font-bold text-zinc-700 mb-0.5">
                          Monto Reclamado (S/)
                        </label>
                        <input
                          type="number"
                          step="0.10"
                          placeholder="Ej: 45.00"
                          value={formData.montoReclamado}
                          onChange={(e) => setFormData({ ...formData, montoReclamado: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488] bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-zinc-700 mb-0.5">
                          Descripción del Producto o Servicio adquirido *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Apronax 550mg caja x 120 / Inyectable"
                          value={formData.descripcionBien}
                          onChange={(e) => setFormData({ ...formData, descripcionBien: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488] bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Detalle, Reclamo/Queja y Enviar */}
                <div className="space-y-3.5">
                  <div className="space-y-3 bg-zinc-50/60 p-3.5 rounded-xl border border-zinc-200/80">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-[#0d9488]" />
                      <span>3. Detalle de Reclamación y Pedido</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                        Tipo de Afectación *
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${formData.tipoReclamo === 'RECLAMO' ? 'border-[#0d9488] bg-teal-50/60 shadow-xs' : 'border-zinc-200 bg-white'}`}>
                          <input
                            type="radio"
                            name="tipoReclamo"
                            checked={formData.tipoReclamo === 'RECLAMO'}
                            onChange={() => setFormData({ ...formData, tipoReclamo: 'RECLAMO' })}
                            className="mt-0.5 text-[#0d9488]"
                          />
                          <div>
                            <strong className="text-zinc-900 text-xs block">RECLAMO</strong>
                            <span className="text-zinc-500 text-[10px] leading-tight block">
                              Disconformidad del producto o servicio.
                            </span>
                          </div>
                        </label>
                        <label className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${formData.tipoReclamo === 'QUEJA' ? 'border-[#0d9488] bg-teal-50/60 shadow-xs' : 'border-zinc-200 bg-white'}`}>
                          <input
                            type="radio"
                            name="tipoReclamo"
                            checked={formData.tipoReclamo === 'QUEJA'}
                            onChange={() => setFormData({ ...formData, tipoReclamo: 'QUEJA' })}
                            className="mt-0.5 text-[#0d9488]"
                          />
                          <div>
                            <strong className="text-zinc-900 text-xs block">QUEJA</strong>
                            <span className="text-zinc-500 text-[10px] leading-tight block">
                              Malestar por atención al público.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-0.5">
                        Detalle de los hechos sucedidos *
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Explica detalladamente la disconformidad ocurrida..."
                        value={formData.detalleReclamo}
                        onChange={(e) => setFormData({ ...formData, detalleReclamo: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488] bg-white resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-0.5">
                        Pedido concreto del consumidor *
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Indica qué solución o acción solicitas a Botica Nova Salud..."
                        value={formData.pedidoConcreto}
                        onChange={(e) => setFormData({ ...formData, pedidoConcreto: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#0d9488] bg-white resize-none"
                      />
                    </div>
                  </div>

                  {/* Declaración legal */}
                  <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 text-[10px] text-zinc-500 leading-relaxed">
                    * Conforme al D.S. N° 011-2011-PCM, el proveedor deberá dar respuesta al reclamo en un plazo no mayor a quince (15) días hábiles improrrogables.
                  </div>

                  {/* Botones de Envío */}
                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Hoja de Reclamación</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="py-2.5 px-4 border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
