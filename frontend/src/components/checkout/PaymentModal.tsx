import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Banknote,
  Building2,
  Copy,
  Check,
  ChevronRight,
  Loader2,
  Truck,
  ArrowLeft,
} from 'lucide-react';
import { toast } from '@/utils/alertaSweet';

export interface PaymentData {
  method: 'YAPE_PLIN' | 'TARJETA' | 'CONTRA_ENTREGA' | 'TRANSFERENCIA';
  details: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (paymentData: PaymentData) => void;
  subtotal: number;
  shipping: number;
  total: number;
  customerName: string;
  initialMethod?: 'YAPE_PLIN' | 'TARJETA' | 'CONTRA_ENTREGA' | 'TRANSFERENCIA';
  tipoComprobante?: 'BOLETA' | 'FACTURA';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirmPayment,
  subtotal,
  shipping,
  total,
  customerName,
  initialMethod = 'YAPE_PLIN',
  tipoComprobante = 'BOLETA',
}) => {
  const [selectedMethod, setSelectedMethod] = useState<
    'YAPE_PLIN' | 'TARJETA' | 'CONTRA_ENTREGA' | 'TRANSFERENCIA'
  >(initialMethod);

  // Sincronizar con el prop initialMethod cuando se abre
  React.useEffect(() => {
    if (isOpen) {
      setSelectedMethod(initialMethod);
    }
  }, [isOpen, initialMethod]);

  // Estados específicos para Yape / Plin
  const [yapeApp, setYapeApp] = useState<'YAPE' | 'PLIN'>('YAPE');
  const [yapeOpNumber, setYapeOpNumber] = useState('');

  // Estados para Tarjeta
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Estados para Contra Entrega
  const [contraEntregaType, setContraEntregaType] = useState<'EFECTIVO' | 'POS'>('EFECTIVO');
  const [cashBill, setCashBill] = useState('');

  // Estados para Transferencia
  const [bankName, setBankName] = useState<'BCP' | 'BBVA' | 'INTERBANK'>('BCP');
  const [transferRef, setTransferRef] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      setCardExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
      setCardExpiry(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let details = '';

    if (selectedMethod === 'YAPE_PLIN') {
      if (!yapeOpNumber.trim()) {
        toast.error(`Por favor ingresa el número de operación de ${yapeApp}.`);
        return;
      }
      details = `${yapeApp} (Op: ${yapeOpNumber.trim()}) - +51 955 545 561`;
    } else if (selectedMethod === 'TARJETA') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        toast.error('Por favor ingresa un número de tarjeta válido de 16 dígitos.');
        return;
      }
      if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
        toast.error('Ingresa una fecha de vencimiento válida (MM/AA).');
        return;
      }
      if (cardCvv.length < 3) {
        toast.error('Ingresa el código de seguridad CVV (3 dígitos).');
        return;
      }
      const last4 = cleanNum.slice(-4);
      const brand = cleanNum.startsWith('4') ? 'Visa' : 'Mastercard';
      details = `${brand} terminada en ${last4} (${cardName || customerName})`;
    } else if (selectedMethod === 'CONTRA_ENTREGA') {
      if (contraEntregaType === 'EFECTIVO') {
        const billVal = parseFloat(cashBill) || total;
        if (billVal < total) {
          toast.error(
            `El monto en efectivo debe ser igual o mayor al total (S/ ${(
              Number(total) || 0
            ).toFixed(2)}).`
          );
          return;
        }
        const change = billVal - total;
        details = `Efectivo en Entrega (Paga con S/ ${(Number(billVal) || 0).toFixed(
          2
        )}, Vuelto: S/ ${(Number(change) || 0).toFixed(2)})`;
      } else {
        details = 'POS Inalámbrico en Entrega (Tarjeta de Débito/Crédito al recibir)';
      }
    } else if (selectedMethod === 'TRANSFERENCIA') {
      if (!transferRef.trim()) {
        toast.error('Por favor ingresa el número de referencia de la transferencia.');
        return;
      }
      details = `Transferencia ${bankName} - Ref: ${transferRef.trim()}`;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmPayment({
        method: selectedMethod,
        details,
      });
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto sm:overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl lg:max-w-5xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] text-[#18181b] animate-in zoom-in-95 duration-200">
        {/* Header Oficial Nova Salud (Fondo Blanco con Acentos Teal) */}
        <div className="px-5 py-3.5 border-b border-zinc-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0d9488]">
              <ShieldCheck className="w-4 h-4 text-[#0d9488]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-[#18181b]">
                  Finalizar Pago • Método Seguro
                </h2>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-[#0d9488] border border-teal-200">
                  DIGEMID & SUNAT OK
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium">
                Botica Nova Salud · Transacción encriptada con emisión electrónica oficial
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-black transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Estructura Horizontal (Grid 2 Columnas) para Evitar Scroll */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto md:overflow-hidden"
        >
          {/* =========================================================
              COLUMNA IZQUIERDA: SELECTOR DE MÉTODOS Y RESUMEN TRIBUTARIO
              ========================================================= */}
          <div className="md:col-span-5 lg:col-span-4 p-4 sm:p-5 flex flex-col justify-between space-y-3.5 border-b md:border-b-0 md:border-r border-zinc-200 bg-zinc-50/70">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-900">
                  1. Elige tu Forma de Pago
                </span>
                <span className="text-[10px] font-bold text-[#0d9488]">
                  {tipoComprobante === 'FACTURA' ? 'Factura' : 'Boleta'}
                </span>
              </div>

              {/* Botones Verticales de Métodos */}
              <div className="space-y-2">
                {/* Opción Yape / Plin */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('YAPE_PLIN')}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedMethod === 'YAPE_PLIN'
                      ? 'border-[#732282] bg-purple-50/80 ring-1 ring-[#732282] shadow-xs'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedMethod === 'YAPE_PLIN'
                          ? 'bg-[#732282] text-white'
                          : 'bg-purple-100 text-[#732282]'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="block text-xs font-black text-zinc-900 truncate">
                        Yape / Plin
                      </span>
                      <span className="text-[10px] text-zinc-500 block truncate">
                        Código QR o +51 955 545 561
                      </span>
                    </div>
                  </div>
                  {selectedMethod === 'YAPE_PLIN' && (
                    <Check className="w-4 h-4 text-[#732282] stroke-[3] shrink-0" />
                  )}
                </button>

                {/* Opción Tarjeta */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('TARJETA')}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedMethod === 'TARJETA'
                      ? 'border-sky-600 bg-sky-50/80 ring-1 ring-sky-600 shadow-xs'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedMethod === 'TARJETA'
                          ? 'bg-sky-600 text-white'
                          : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="block text-xs font-black text-zinc-900 truncate">
                        Tarjeta Débito / Crédito
                      </span>
                      <span className="text-[10px] text-zinc-500 block truncate">
                        Visa, Mastercard o POS en puerta
                      </span>
                    </div>
                  </div>
                  {selectedMethod === 'TARJETA' && (
                    <Check className="w-4 h-4 text-sky-600 stroke-[3] shrink-0" />
                  )}
                </button>

                {/* Opción Contra Entrega */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('CONTRA_ENTREGA')}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedMethod === 'CONTRA_ENTREGA'
                      ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600 shadow-xs'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedMethod === 'CONTRA_ENTREGA'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="block text-xs font-black text-zinc-900 truncate">
                        Contra Entrega en Juliaca
                      </span>
                      <span className="text-[10px] text-zinc-500 block truncate">
                        Efectivo con vuelto o POS al recibir
                      </span>
                    </div>
                  </div>
                  {selectedMethod === 'CONTRA_ENTREGA' && (
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                  )}
                </button>

                {/* Opción Transferencia Bancaria */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('TRANSFERENCIA')}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedMethod === 'TRANSFERENCIA'
                      ? 'border-amber-600 bg-amber-50/80 ring-1 ring-amber-600 shadow-xs'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedMethod === 'TRANSFERENCIA'
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="block text-xs font-black text-zinc-900 truncate">
                        Transferencia Bancaria
                      </span>
                      <span className="text-[10px] text-zinc-500 block truncate">
                        BCP, BBVA o Interbank
                      </span>
                    </div>
                  </div>
                  {selectedMethod === 'TRANSFERENCIA' && (
                    <Check className="w-4 h-4 text-amber-600 stroke-[3] shrink-0" />
                  )}
                </button>
              </div>
            </div>

            {/* Tarjeta de Resumen Tributario Inferior */}
            <div className="bg-white p-3 rounded-xl border border-zinc-200/90 shadow-2xs space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-500 text-[11px]">
                <span>Cliente:</span>
                <span className="font-bold text-zinc-800 truncate max-w-[170px]">
                  {customerName || 'Cliente Particular'}
                </span>
              </div>
              <div className="flex justify-between text-zinc-500 text-[11px]">
                <span>Comprobante:</span>
                <span className="font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 text-[10px]">
                  {tipoComprobante === 'FACTURA' ? 'FACTURA SUNAT' : 'BOLETA SUNAT'}
                </span>
              </div>
              <div className="pt-1.5 border-t border-zinc-100 flex justify-between items-baseline">
                <span className="font-black text-zinc-900 text-xs uppercase">Total a Pagar:</span>
                <span className="font-black text-[#0d9488] text-lg font-mono">
                  S/ {(Number(total) || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* =========================================================
              COLUMNA DERECHA: DETALLE DEL MÉTODO SELECCIONADO Y ACCIONES
              ========================================================= */}
          <div className="md:col-span-7 lg:col-span-8 p-4 sm:p-5 flex flex-col justify-between space-y-3.5 bg-white">
            <div className="space-y-3.5">
              {/* 1. SECCIÓN YAPE / PLIN */}
              {selectedMethod === 'YAPE_PLIN' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  {/* Selector Yape vs Plin */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                    <span className="text-[11px] font-black uppercase tracking-wider text-purple-900">
                      2. Escanea el Código QR o Transfiere
                    </span>
                    <div className="flex p-0.5 rounded-lg bg-zinc-100 border border-zinc-200">
                      <button
                        type="button"
                        onClick={() => setYapeApp('YAPE')}
                        className={`px-3 py-0.5 text-[10px] font-black uppercase rounded transition cursor-pointer ${
                          yapeApp === 'YAPE'
                            ? 'bg-[#732282] text-white shadow-xs'
                            : 'text-zinc-600 hover:text-black'
                        }`}
                      >
                        Yape
                      </button>
                      <button
                        type="button"
                        onClick={() => setYapeApp('PLIN')}
                        className={`px-3 py-0.5 text-[10px] font-black uppercase rounded transition cursor-pointer ${
                          yapeApp === 'PLIN'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-zinc-600 hover:text-black'
                        }`}
                      >
                        Plin
                      </button>
                    </div>
                  </div>

                  {/* Fila Horizontal QR + Datos del Comercio */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                    {/* Caja del Código QR */}
                    <div className="sm:col-span-5 bg-white p-2.5 rounded-xl border border-purple-200/90 flex flex-col items-center justify-center text-center shadow-2xs">
                      <div className="w-32 h-32 sm:w-36 sm:h-36 bg-white rounded-lg p-1 flex items-center justify-center border border-purple-200/80 shadow-inner overflow-hidden">
                        <img
                          src="/media/qr-yape.jpg"
                          alt="QR Yape Botica Nova Salud"
                          className="w-full h-full object-contain rounded"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-700 mt-1">
                        Paga exacto S/ {(Number(total) || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Información de Pago y Pasos */}
                    <div className="sm:col-span-7 space-y-2 text-xs">
                      <div className="bg-purple-50/80 p-2.5 rounded-xl border border-purple-200/80 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-zinc-600">Número celular:</span>
                          <button
                            type="button"
                            onClick={() => handleCopy('+51 955 545 561', 'Número de celular')}
                            className="font-mono font-bold text-[#732282] flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span>+51 955 545 561</span>
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-zinc-600">Titular oficial:</span>
                          <span className="font-bold text-zinc-900 text-[11px]">
                            Botica Nova Salud E.I.R.L.
                          </span>
                        </div>
                      </div>

                      {/* Guía en 3 Pasos */}
                      <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-600 pl-0.5">
                        <li>
                          Abre tu app <strong>{yapeApp}</strong> en tu teléfono.
                        </li>
                        <li>Escanea el código QR o envía a <strong>+51 955 545 561</strong>.</li>
                        <li>Ingresa el N° de operación abajo para emitir tu comprobante.</li>
                      </ol>

                      {/* Input de Número de Operación */}
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-zinc-700 mb-0.5">
                          Número de Operación ({yapeApp}) *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={12}
                          value={yapeOpNumber}
                          onChange={(e) => setYapeOpNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="Ej: 748921"
                          className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 font-mono focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. SECCIÓN TARJETA DE CRÉDITO O DÉBITO */}
              {selectedMethod === 'TARJETA' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                    <span className="text-[11px] font-black uppercase tracking-wider text-sky-900">
                      2. Datos de tu Tarjeta de Débito o Crédito
                    </span>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      Cifrado PCI-DSS 256-bit
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Visual Card Horizontal */}
                    <div className="sm:col-span-5 bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-950 text-white rounded-xl p-3.5 shadow-md border border-zinc-700 space-y-2.5 font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-sans font-bold">
                          Nova Salud Pay
                        </span>
                        <span className="text-[10px] font-black text-teal-400">
                          {cardNumber.startsWith('4') ? 'VISA' : 'MASTERCARD'}
                        </span>
                      </div>
                      <div className="text-sm tracking-widest text-center py-1 text-zinc-100">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex justify-between items-end text-[10px]">
                        <div>
                          <span className="block text-[8px] text-zinc-400 font-sans uppercase">
                            Titular
                          </span>
                          <span className="font-sans font-bold uppercase truncate max-w-[120px] block">
                            {cardName || customerName || 'NOMBRE Y APELLIDO'}
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

                    {/* Inputs de Formulario de Tarjeta */}
                    <div className="sm:col-span-7 space-y-2">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-zinc-600 mb-0.5">
                          Número de Tarjeta (16 dígitos) *
                        </label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4000 1234 5678 9010"
                          className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 font-mono focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-zinc-600 mb-0.5">
                            Vencimiento (MM/AA) *
                          </label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            placeholder="12/28"
                            className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 font-mono focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-zinc-600 mb-0.5">
                            CVV (3 dígitos) *
                          </label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) =>
                              setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                            }
                            placeholder="123"
                            className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 font-mono focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-zinc-600 mb-0.5">
                          Nombre Impreso en la Tarjeta *
                        </label>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          placeholder="COMO FIGURA EN EL PLÁSTICO"
                          className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 uppercase focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. SECCIÓN CONTRA ENTREGA EN JULIACA */}
              {selectedMethod === 'CONTRA_ENTREGA' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900">
                      2. Modalidad de Pago al Recibir en Domicilio
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Cadena de Frío Garantizada
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setContraEntregaType('EFECTIVO')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        contraEntregaType === 'EFECTIVO'
                          ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600 shadow-xs'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-zinc-900">
                          Efectivo con Vuelto
                        </span>
                        {contraEntregaType === 'EFECTIVO' && (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-tight">
                        Pagas al motorizado con billete exacto o vuelto programado.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setContraEntregaType('POS')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        contraEntregaType === 'POS'
                          ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600 shadow-xs'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-zinc-900">
                          POS Inalámbrico en Puerta
                        </span>
                        {contraEntregaType === 'POS' && (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-tight">
                        El motorizado lleva terminal para tarjeta física o sin contacto.
                      </p>
                    </button>
                  </div>

                  {contraEntregaType === 'EFECTIVO' && (
                    <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-zinc-700">
                        <span className="font-bold text-[11px]">¿Con cuánto vas a pagar?</span>
                        <span className="text-[11px]">
                          Total Pedido: <strong>S/ {(Number(total) || 0).toFixed(2)}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-700 text-sm">S/</span>
                        <input
                          type="number"
                          step="any"
                          min={total}
                          value={cashBill}
                          onChange={(e) => setCashBill(e.target.value)}
                          placeholder={String(Math.ceil(total / 10) * 10)}
                          className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:border-emerald-600 transition-colors"
                        />
                      </div>
                      {parseFloat(cashBill) >= total && (
                        <div className="text-[11px] text-emerald-900 bg-white px-2.5 py-1.5 rounded border border-emerald-200 flex justify-between">
                          <span>Vuelto que llevará el motorizado:</span>
                          <strong className="font-mono font-black text-emerald-800">
                            S/ {(parseFloat(cashBill) - total).toFixed(2)}
                          </strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 4. SECCIÓN TRANSFERENCIA BANCARIA */}
              {selectedMethod === 'TRANSFERENCIA' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                      2. Cuentas Oficiales Botica Nova Salud
                    </span>
                    <div className="flex gap-1">
                      {(['BCP', 'BBVA', 'INTERBANK'] as const).map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBankName(b)}
                          className={`px-2 py-0.5 text-[10px] font-black rounded transition cursor-pointer ${
                            bankName === b
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                        Cuenta Corriente {bankName}:
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-zinc-900">
                          {bankName === 'BCP'
                            ? '193-9481230-0-45'
                            : bankName === 'BBVA'
                            ? '0011-0245-0100084512'
                            : '200-3001458921'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              bankName === 'BCP'
                                ? '193-9481230-0-45'
                                : bankName === 'BBVA'
                                ? '0011-0245-0100084512'
                                : '200-3001458921',
                              'N° de cuenta'
                            )
                          }
                          className="text-amber-800 hover:underline p-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                        Código Interbancario (CCI):
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-zinc-900 text-[11px]">
                          002-193-009481230045-12
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy('002-193-009481230045-12', 'CCI')}
                          className="text-amber-800 hover:underline p-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-zinc-700 mb-0.5">
                      Número de Referencia de Transferencia *
                    </label>
                    <input
                      type="text"
                      required
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      placeholder="Ej: BCP-948123 o 104523"
                      className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 font-mono focus:outline-none focus:border-[#0d9488] transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Acciones Inferiores (Volver / Confirmar y Emitir) */}
            <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Modificar Datos</span>
              </button>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] active:scale-[0.99] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      Emitiendo {tipoComprobante === 'FACTURA' ? 'Factura' : 'Boleta'} SUNAT...
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      Pagar S/ {(Number(total) || 0).toFixed(2)} y Emitir{' '}
                      {tipoComprobante === 'FACTURA' ? 'Factura' : 'Boleta'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
