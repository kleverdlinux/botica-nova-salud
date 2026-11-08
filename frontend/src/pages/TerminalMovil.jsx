import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Smartphone,
  CreditCard,
  QrCode,
  CheckCircle2,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Check,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { posDisplay } from '../utils/posDisplayChannel.js';
import { formatearMoneda } from '../utils/formateadores.js';

export default function TerminalMovil() {
  const [searchParams] = useSearchParams();
  const montoUrl = parseFloat(searchParams.get('monto') || '0');
  const ticketUrl = searchParams.get('ticket') || '';

  const [metodoActivo, setMetodoActivo] = useState('YAPE_PLIN'); // 'YAPE_PLIN' | 'TARJETA'
  const [estadoPos, setEstadoPos] = useState({
    modo: 'REPOSO',
    total: 0,
    items: [],
    ticketId: '',
    clienteNom: ''
  });

  const [conectado, setConectado] = useState(true);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [notificacionLocal, setNotificacionLocal] = useState(null);

  // Estados interactivos para cobro con tarjeta
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  // Cargar estado inicial y suscribirse a la Laptop
  useEffect(() => {
    const inicial = posDisplay.obtenerEstadoActual();
    if (inicial) {
      setEstadoPos(inicial);
      if (inicial.modo === 'TARJETA') setMetodoActivo('TARJETA');
      if (inicial.modo === 'YAPE_PLIN') setMetodoActivo('YAPE_PLIN');
      if (inicial.clienteNom) setCardHolder(inicial.clienteNom);
    }

    const unsuscribe = posDisplay.suscribir((mensaje) => {
      setConectado(true);

      if (mensaje.tipo === 'ACTUALIZAR_ESTADO' || mensaje.tipo === 'ESTADO_ACTUAL') {
        const payload = mensaje.payload || {};
        setEstadoPos(payload);

        if (payload.clienteNom && !cardHolder) {
          setCardHolder(payload.clienteNom);
        }

        if (payload.modo === 'TARJETA') {
          setMetodoActivo('TARJETA');
        } else if (payload.modo === 'YAPE_PLIN') {
          setMetodoActivo('YAPE_PLIN');
        }
      } else if (mensaje.tipo === 'CAMBIAR_METODO_PAGO') {
        const metodo = mensaje.payload?.metodoPago;
        if (metodo === 'TARJETA' || metodo === 'YAPE_PLIN') {
          setMetodoActivo(metodo);
        }
      }
    });

    return () => unsuscribe();
  }, [cardHolder]);

  // Cambiar método de cobro
  const seleccionarMetodo = (metodo) => {
    setMetodoActivo(metodo);
    if (metodo === 'YAPE_PLIN' || metodo === 'TARJETA') {
      posDisplay.cambiarMetodoPago(metodo);
    }
  };

  // Formateadores de tarjeta
  const handleCardNumberChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = v.match(/.{1,4}/g)?.join(' ') || v;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) {
      setCardExpiry(`${v.slice(0, 2)}/${v.slice(2)}`);
    } else {
      setCardExpiry(v);
    }
  };

  const handleCvvChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(v);
  };

  // Confirmar cobro Yape desde el celular
  const handleConfirmarYapeDesdeCelular = () => {
    if (total <= 0) {
      setNotificacionLocal({
        tipo: 'alerta',
        titulo: 'Mostrador en Reposo',
        detalle: 'Agregue medicamentos al carrito en el mostrador para confirmar el pago.'
      });
      setTimeout(() => setNotificacionLocal(null), 3000);
      return;
    }

    const op = String(Math.floor(100000 + Math.random() * 900000));
    posDisplay.notificarPagoMovil({
      numeroOperacion: op,
      monto: total,
      metodoPago: 'YAPE_PLIN'
    });
    setNotificacionLocal({
      tipo: 'exito',
      titulo: 'Pago Yape Notificado',
      detalle: `Operación N° ${op} enviada al sistema de caja.`
    });
    setTimeout(() => setNotificacionLocal(null), 3500);
  };

  // Confirmar cobro Tarjeta desde el celular
  const handleConfirmarTarjetaDesdeCelular = () => {
    if (total <= 0) {
      setNotificacionLocal({
        tipo: 'alerta',
        titulo: 'Mostrador en Reposo',
        detalle: 'Agregue medicamentos al carrito en el mostrador para aprobar el cobro.'
      });
      setTimeout(() => setNotificacionLocal(null), 3000);
      return;
    }

    const voucher = `VCH-${Math.floor(10000 + Math.random() * 90000)}`;
    posDisplay.notificarPagoTarjeta({
      voucher,
      monto: total
    });
    setNotificacionLocal({
      tipo: 'exito',
      titulo: 'Cobro Tarjeta Aprobado',
      detalle: `Comprobante ${voucher} enviado al sistema de caja.`
    });
    setTimeout(() => setNotificacionLocal(null), 3500);
  };

  const total = (Number(estadoPos.total) > 0 ? Number(estadoPos.total) : montoUrl) || 0;
  const items = Array.isArray(estadoPos.items) ? estadoPos.items : [];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans select-none">
      {/* Barra Superior Corporativa */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center font-black">
              <Smartphone className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xs font-black text-slate-900 leading-tight">
                Botica Nova Salud
              </h1>
              <div className="flex items-center space-x-1.5 text-[10px] text-teal-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{conectado ? 'Caja Conectada' : 'Sincronizando...'}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Ticket
            </span>
            <span className="text-xs font-mono font-black text-slate-800">
              {estadoPos.ticketId || 'POS-001'}
            </span>
          </div>
        </div>
      </header>

      {/* Notificación Flotante de Acción */}
      {notificacionLocal && (
        <div className="px-4 pt-3 max-w-md mx-auto w-full animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-emerald-600 text-white rounded-2xl p-3 shadow-lg flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <div className="text-xs flex-1">
              <p className="font-bold">{notificacionLocal.titulo}</p>
              <p className="text-[11px] opacity-90">{notificacionLocal.detalle}</p>
            </div>
          </div>
        </div>
      )}

      {/* Selector Principal de Modo de Cobro: SOLO PARA PAGAR (Yape / Tarjeta) */}
      <section className="px-4 pt-3 max-w-md mx-auto w-full">
        <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-2 gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => seleccionarMetodo('YAPE_PLIN')}
            className={`py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 ${
              metodoActivo === 'YAPE_PLIN'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span className="text-xs">Yape / Plin</span>
          </button>

          <button
            type="button"
            onClick={() => seleccionarMetodo('TARJETA')}
            className={`py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 ${
              metodoActivo === 'TARJETA'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-xs">Tarjeta</span>
          </button>
        </div>
      </section>

      {/* Resumen del Monto a Cobrar */}
      <section className="px-4 pt-3 max-w-md mx-auto w-full">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total a Pagar por el Cliente
            </span>
            <div className="text-3xl font-black font-mono tracking-tight text-slate-900 mt-0.5">
              {formatearMoneda(total)}
            </div>
            {items.length > 0 ? (
              <span className="text-[11px] text-teal-700 font-semibold">
                {items.length} {items.length === 1 ? 'producto' : 'productos'} en mostrador
              </span>
            ) : (
              <span className="text-[11px] text-amber-600 font-semibold">
                Esperando medicamentos en caja...
              </span>
            )}
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => setMostrarDetalle(!mostrarDetalle)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition cursor-pointer flex items-center space-x-1 text-xs font-bold"
            >
              <ShoppingBag className="w-4 h-4" />
              {mostrarDetalle ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Detalle Desplegable del Ticket */}
        {mostrarDetalle && items.length > 0 && (
          <div className="mt-2 bg-white rounded-2xl p-3 border border-slate-200 shadow-xs text-xs space-y-1.5 animate-in fade-in duration-150">
            <div className="font-bold text-slate-700 pb-1 border-b border-slate-100 flex justify-between">
              <span>Fármaco</span>
              <span>Subtotal</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-slate-100">
              {items.map((it, idx) => (
                <div key={idx} className="pt-1 flex justify-between items-center text-slate-600">
                  <span className="truncate pr-2 font-medium">
                    <strong className="text-slate-900 font-mono">{it.cantidad}x</strong> {it.nombre}
                  </span>
                  <span className="font-mono font-bold text-slate-800 shrink-0">
                    {formatearMoneda(it.precio * it.cantidad)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Contenido según Selección */}
      <main className="flex-1 px-4 py-3 max-w-md mx-auto w-full flex flex-col justify-start">
        {metodoActivo === 'YAPE_PLIN' ? (
          // ============================== VISTA COBRO YAPE ==============================
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black uppercase tracking-wider mb-1">
                <span>Yape</span>
                <span>•</span>
                <span>Plin</span>
              </div>
              <h2 className="text-base font-black text-slate-900">
                Muestre este código al cliente
              </h2>
              <p className="text-xs text-slate-500">
                Escanear con cámara o app del celular
              </p>
            </div>

            {/* Código QR Oficial */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto shadow-inner">
              <img
                src="/media/qr-yape.jpg"
                alt="QR Yape Botica Nova Salud"
                className="w-52 h-52 mx-auto rounded-xl object-contain bg-white p-1.5"
              />
            </div>

            {/* Datos Comerciales */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs space-y-1.5 text-left font-sans">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Celular Yape:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  +51 955 545 561
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Titular:</span>
                <span className="font-bold text-teal-800">Botica Nova Salud</span>
              </div>
            </div>

            {/* Botón de Confirmación */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleConfirmarYapeDesdeCelular}
                disabled={total <= 0}
                className="w-full py-3.5 px-4 bg-purple-700 hover:bg-purple-800 active:scale-[0.98] text-white rounded-2xl text-xs font-black shadow-md shadow-purple-700/20 transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Confirmar Pago Recibido (S/ {total.toFixed(2)})</span>
              </button>
              <p className="text-[10px] text-slate-400 mt-2">
                Al confirmar, el sistema de caja en la laptop se actualizará automáticamente.
              </p>
            </div>
          </div>
        ) : (
          // ============================== VISTA COBRO TARJETA INTERACTIVA ==============================
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 animate-in zoom-in-95 duration-150">
            <div className="text-center">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-wider mb-1">
                <span>Tarjeta Débito & Crédito</span>
              </div>
              <h2 className="text-base font-black text-slate-900">
                Pagar con Tarjeta
              </h2>
              <p className="text-xs text-slate-500">
                Ingrese los datos de su tarjeta o acerque al mostrador
              </p>
            </div>

            {/* Tarjeta Visual Interactiva */}
            <div className="bg-gradient-to-tr from-zinc-900 via-slate-800 to-zinc-950 text-white rounded-2xl p-4 shadow-md border border-zinc-700 space-y-3 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-sans font-bold">
                  Nova Salud Pay
                </span>
                <span className="text-xs font-black text-teal-400">
                  {cardNumber.startsWith('4') ? 'VISA' : 'MASTERCARD'}
                </span>
              </div>
              <div className="text-base tracking-widest text-center py-1 text-zinc-100 font-bold">
                {cardNumber || '•••• •••• •••• ••••'}
              </div>
              <div className="flex justify-between items-end text-[11px]">
                <div>
                  <span className="block text-[8px] text-zinc-400 font-sans uppercase">
                    Titular
                  </span>
                  <span className="font-sans font-bold uppercase truncate max-w-[150px] block">
                    {cardHolder || estadoPos.clienteNom || 'NOMBRE Y APELLIDO'}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] text-zinc-400 font-sans uppercase">
                    Vence
                  </span>
                  <span>{cardExpiry || 'MM/AA'}</span>
                </div>
              </div>
            </div>

            {/* Formulario de Tarjeta */}
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-0.5">
                  Número de Tarjeta (16 dígitos) *
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="4000 1234 5678 9010"
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-0.5">
                    Vencimiento (MM/AA) *
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    placeholder="12/28"
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-0.5">
                    CVV (3 dígitos) *
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={handleCvvChange}
                    placeholder="•••"
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-0.5">
                  Nombre del Titular *
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Ej: MARÍA RODRÍGUEZ"
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 font-sans focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-slate-50 uppercase"
                />
              </div>
            </div>

            {/* Botón de Aprobación de Tarjeta */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleConfirmarTarjetaDesdeCelular}
                disabled={total <= 0}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl text-xs font-black shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  {total > 0 ? `Pagar S/ ${total.toFixed(2)} (Aprobar Cobro)` : 'Aprobar Cobro de Tarjeta'}
                </span>
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-2">
                <Lock className="w-3 h-3" />
                <span>Transacción cifrada y protegida por terminal de caja.</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Pie de Página */}
      <footer className="p-3 bg-white border-t border-slate-200 text-center text-[10px] text-slate-400">
        Botica Nova Salud • Pasarela de Pago Terminal POS
      </footer>
    </div>
  );
}
