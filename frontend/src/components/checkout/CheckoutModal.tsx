import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  ArrowRight,
  QrCode,
  CreditCard,
  Banknote,
  CheckCircle2,
  FileText,
  MapPin,
  User,
  Building,
  Phone,
  Mail,
  Home,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import {
  getActiveClient,
  saveActiveClient,
  registerClient,
  saveCustomerOrder,
  generateNextCorrelative,
  CustomerOrder,
  ClientProfile,
} from '@/utils/orderStorage';
import { PaymentModal, PaymentData } from '@/components/checkout/PaymentModal';
import { BoletaModal } from '@/components/checkout/BoletaModal';
import { toast } from '@/utils/alertaSweet';

interface CheckoutModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const {
    items,
    isCheckoutOpen,
    closeCheckout,
    getSubtotal,
    clearCart,
  } = useCart();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isCheckoutOpen;

  const [tipoComprobante, setTipoComprobante] = useState<'BOLETA' | 'FACTURA'>('BOLETA');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    razonSocial: '',
    ruc: '',
    email: '',
    phone: '',
    dni: '',
    address: '',
    reference: '',
    district: 'Juliaca Cercado',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'YAPE_PLIN' | 'TARJETA' | 'CONTRA_ENTREGA'>('YAPE_PLIN');

  // Modales secundarios de pasarela y boleta oficial
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<CustomerOrder | null>(null);
  const [isBoletaOpen, setIsBoletaOpen] = useState(false);

  // Auto-cargar datos del cliente activo si ya ha iniciado sesión
  useEffect(() => {
    if (isOpen) {
      const client = getActiveClient();
      if (client) {
        const parts = (client.name || '').split(' ');
        setFormData((prev) => ({
          ...prev,
          firstName: parts[0] || prev.firstName,
          lastName: parts.slice(1).join(' ') || prev.lastName,
          email: client.email || prev.email,
          phone: client.phone || prev.phone,
          dni: client.dni || prev.dni,
          address: client.address || prev.address,
          district: client.district || prev.district || 'Juliaca Cercado',
        }));
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      closeCheckout();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = getSubtotal();
  const shipping = 0; // Despacho gratis en Juliaca
  const total = subtotal + shipping;

  const validarFormularioEntrega = () => {
    if (items.length === 0) {
      toast.error('Tu carrito está vacío. Agrega medicamentos antes de continuar.');
      return false;
    }

    if (tipoComprobante === 'BOLETA') {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error('Por favor ingresa tu nombre y apellido completos para la boleta.');
        return false;
      }

      const cleanDni = formData.dni.replace(/\D/g, '');
      if (cleanDni.length < 8) {
        toast.error('El DNI debe tener al menos 8 dígitos para emitir tu boleta electrónica.');
        return false;
      }
    } else {
      // FACTURA
      if (!formData.razonSocial.trim()) {
        toast.error('Ingresa la Razón Social de la empresa para la factura.');
        return false;
      }

      const cleanRuc = formData.ruc.replace(/\D/g, '');
      if (cleanRuc.length !== 11) {
        toast.error('El RUC debe contener exactamente 11 dígitos para emitir la factura.');
        return false;
      }
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      toast.error('Ingresa un número de celular de 9 dígitos para la coordinación del delivery.');
      return false;
    }

    if (!formData.address.trim()) {
      toast.error('Por favor ingresa la dirección de entrega en Juliaca / San Román.');
      return false;
    }

    return true;
  };

  const handleProcederAlPago = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormularioEntrega()) {
      return;
    }

    // Abre el modal especializado del método elegido (Yape / Tarjeta / Contra Entrega)
    setIsPaymentModalOpen(true);
  };

  const handleAbrirModalMetodo = (metodo: 'YAPE_PLIN' | 'TARJETA' | 'CONTRA_ENTREGA') => {
    setPaymentMethod(metodo);
    if (!validarFormularioEntrega()) {
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (paymentData: PaymentData) => {
    try {
      const correlative = generateNextCorrelative(tipoComprobante);
      const now = new Date();
      const dateFormatted = now.toLocaleString('es-PE', {
        dateStyle: 'full',
        timeStyle: 'short',
      });

      // Fecha oficial en formato SUNAT YYYY-MM-DD según hora local de Perú (America/Lima)
      let fechaSunat = '';
      try {
        fechaSunat = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Lima',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(now);
      } catch {
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        fechaSunat = `${y}-${m}-${d}`;
      }

      const cleanDni = formData.dni.replace(/\D/g, '');
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const cleanRuc = formData.ruc.replace(/\D/g, '');

      const orderData: CustomerOrder = {
        id: correlative.id,
        serieNumero: correlative.serieNumero,
        tipoComprobante,
        date: dateFormatted,
        fechaSunat,
        timestamp: Date.now(),
        customer: {
          ...formData,
          tipoComprobante,
          dni: cleanDni || cleanRuc,
          phone: cleanPhone,
          ruc: cleanRuc,
          razonSocial: formData.razonSocial,
        },
        items: items.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          presentation: i.product.unitLabel || 'Unidad',
          quantity: i.quantity,
          price: i.product.price,
          subtotal: i.product.price * i.quantity,
          image: i.product.images?.[0],
        })),
        subtotal,
        igv: Number(((subtotal * 0.18) / 1.18).toFixed(2)),
        shipping,
        total,
        paymentMethod: paymentData.method,
        paymentDetails: paymentData.details,
        status: 'CONFIRMADO',
      };

      // Sincronizar o auto-registrar cliente en PostgreSQL
      const clientName =
        tipoComprobante === 'FACTURA' && formData.razonSocial
          ? formData.razonSocial
          : `${formData.firstName} ${formData.lastName}`;
      const clientEmail = formData.email || `${cleanDni || cleanRuc}@cliente.novasalud.pe`;
      const clientDni = cleanDni || cleanRuc;

      const activeClient = getActiveClient();
      const alreadyLoggedIn = Boolean(
        activeClient && (activeClient.dni === clientDni || activeClient.id === clientDni)
      );

      let isBrandNewAccount = false;

      if (alreadyLoggedIn && activeClient) {
        // El cliente ya tiene cuenta y está autenticado: preservar sesión completa intacta sin registrar de nuevo
        const updatedActive: ClientProfile = {
          ...activeClient,
          phone: cleanPhone || activeClient.phone,
          address: formData.address || activeClient.address,
          district: formData.district || activeClient.district,
        };
        saveActiveClient(updatedActive);
        isBrandNewAccount = false;
      } else {
        // Solo para compras como invitado sin sesión activa previa
        const regRes = await registerClient({
          dni: clientDni,
          name: clientName,
          email: clientEmail,
          phone: cleanPhone,
          address: formData.address,
          district: formData.district,
          password: clientDni, // Sólo se usa como clave inicial si la cuenta es 100% nueva
          esAutoRegistro: true,
        });

        isBrandNewAccount = Boolean(regRes.isNewAccount);

        if (regRes.client) {
          saveActiveClient(regRes.client);
        }
      }

      // Guardar pedido persistente con la bandera isNewAccount
      const fullOrderData: CustomerOrder = {
        ...orderData,
        isNewAccount: isBrandNewAccount,
      };
      saveCustomerOrder(fullOrderData);

      // Limpiar y preparar boleta
      clearCart();
      setIsPaymentModalOpen(false);
      handleClose();
      setConfirmedOrder(fullOrderData);
      setIsBoletaOpen(true);

      toast.success(
        `¡Pedido Confirmado! ${
          tipoComprobante === 'FACTURA' ? 'Factura' : 'Boleta'
        } ${correlative.serieNumero} emitida exitosamente.`
      );
    } catch (err) {
      console.error(err);
      toast.error('Hubo un inconveniente al generar el pedido. Intenta nuevamente.');
    }
  };

  const distritosJuliaca = [
    'Juliaca Cercado',
    'San Miguel (Juliaca)',
    'Urb. Santa Adriana',
    'Urb. La Rinconada',
    'Urb. Taparachi',
    'Urb. San Isidro',
    'Urb. Santa Catalina',
    'Urb. Bellavista',
    'Barrio Cerro Colorado',
    'Barrio Tupac Amaru',
    'Hospital Carlos Monge Medrano',
    'Mercado Manco Cápac / Laguna Temporal',
    'Salida a Puno / Av. Huancané',
    'Salida a Cusco / Circunvalación',
    'Salida a Huancané',
    'Caracoto (San Román)',
    'Puno Ciudad (Ruta Interurbana 45 min)',
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto sm:overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] text-[#18181b] animate-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="px-5 py-3.5 border-b border-zinc-100 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-[#0d9488]">
                  <ShieldCheck className="w-4 h-4 text-[#0d9488]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-[#18181b]">
                      Finalizar Pedido • Entrega & Facturación
                    </h2>
                    <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-[#0d9488] border border-teal-200">
                      DIGEMID OK
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-medium">
                    Despacho exprés con cadena de frío en Juliaca, San Román y zonas de cobertura
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-black transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Formulario y Resumen en 2 Columnas equilibradas sin scroll de página */}
            <form
              onSubmit={handleProcederAlPago}
              className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto md:overflow-hidden"
            >
              {/* Columna Izquierda: Datos del Paciente y Dirección */}
              <div className="md:col-span-7 p-4 sm:p-5 flex flex-col justify-between space-y-3.5 border-b md:border-b-0 md:border-r border-zinc-200 bg-white">
                <div className="space-y-3.5">
                  {/* Bloque 1: Tipo de Comprobante & Datos Personales */}
                  <div>
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-zinc-100">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#0d9488]" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-zinc-900">
                          1. Comprobante & Datos del Paciente
                        </span>
                      </div>

                      {/* Selector Boleta vs Factura */}
                      <div className="flex p-0.5 rounded-lg bg-zinc-100 border border-zinc-200">
                        <button
                          type="button"
                          onClick={() => setTipoComprobante('BOLETA')}
                          className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded transition-all cursor-pointer ${
                            tipoComprobante === 'BOLETA'
                              ? 'bg-white text-[#0d9488] shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-900'
                          }`}
                        >
                          Boleta
                        </button>
                        <button
                          type="button"
                          onClick={() => setTipoComprobante('FACTURA')}
                          className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded transition-all cursor-pointer ${
                            tipoComprobante === 'FACTURA'
                              ? 'bg-white text-[#0d9488] shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-900'
                          }`}
                        >
                          Factura
                        </button>
                      </div>
                    </div>

                    {tipoComprobante === 'BOLETA' ? (
                      <>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-zinc-500 mb-0.5">
                              Nombres *
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              required
                              placeholder="Ej. Carlos"
                              className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-zinc-500 mb-0.5">
                              Apellidos *
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              required
                              placeholder="Ej. Mendoza R."
                              className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 mt-2">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-zinc-500 mb-0.5">
                              DNI (8 dígitos) *
                            </label>
                            <input
                              type="text"
                              name="dni"
                              maxLength={8}
                              value={formData.dni}
                              onChange={handleInputChange}
                              required
                              placeholder="76880921"
                              className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-zinc-500 mb-0.5">
                              Celular / WhatsApp *
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              maxLength={12}
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                              placeholder="+51 955 545 561"
                              className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-zinc-500 mb-0.5">
                              R.U.C. Empresa (11 dígitos) *
                            </label>
                            <input
                              type="text"
                              name="ruc"
                              maxLength={11}
                              value={formData.ruc}
                              onChange={handleInputChange}
                              required
                              placeholder="20601234567"
                              className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-zinc-500 mb-0.5">
                              Razón Social *
                            </label>
                            <input
                              type="text"
                              name="razonSocial"
                              value={formData.razonSocial}
                              onChange={handleInputChange}
                              required
                              placeholder="Ej. Distribuidora Salud S.A.C."
                              className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 mt-2">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-zinc-500 mb-0.5">
                              Contacto / Representante
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              placeholder="Ej. Carlos Mendoza"
                              className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-zinc-500 mb-0.5">
                              Celular / WhatsApp *
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              maxLength={12}
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                              placeholder="+51 955 545 561"
                              className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="mt-2">
                      <label className="block text-[10px] font-extrabold uppercase text-zinc-500 mb-0.5">
                        Correo Electrónico ({tipoComprobante === 'FACTURA' ? 'Factura XML/PDF' : 'Boleta PDF'})
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="ejemplo@correo.com"
                        className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Bloque 2: Dirección de Entrega */}
                  <div>
                    <div className="flex items-center gap-1.5 pb-1.5 mb-2 border-b border-zinc-100">
                      <MapPin className="w-3.5 h-3.5 text-[#0d9488]" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-zinc-900">
                        2. Dirección de Entrega en Juliaca
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-zinc-500 mb-0.5">
                        Dirección Exacta (Calle / Jr. / Av. y Número) *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        placeholder="Ej. Av. Nicolás de Piérola 1240, Dpto 301"
                        className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 mt-2">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-zinc-500 mb-0.5">
                          Zona / Sector (Juliaca) *
                        </label>
                        <select
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          className="w-full h-8 px-2 rounded border border-zinc-300 text-xs text-zinc-900 bg-white focus:outline-none focus:border-[#0d9488] transition-colors cursor-pointer"
                        >
                          {distritosJuliaca.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-zinc-500 mb-0.5">
                          Referencia de Entrega
                        </label>
                        <input
                          type="text"
                          name="reference"
                          value={formData.reference}
                          onChange={handleInputChange}
                          placeholder="Ej. Altura cdra 12 de Av. Grau"
                          className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="mt-2">
                      <label className="block text-[10px] font-extrabold uppercase text-zinc-500 mb-0.5">
                        Notas para el motorizado / Receta médica (Opcional)
                      </label>
                      <input
                        type="text"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Ej. Tocar timbre 3B o dejar en recepción"
                        className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Sellos de garantía inferiores */}
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-[#0d9488]" />
                    Entrega Promedio: 45 min en Juliaca
                  </span>
                  <span>Lotes y Vencimiento 100% Verificados</span>
                </div>
              </div>

              {/* Columna Derecha: Resumen de Pedido y Método de Pago */}
              <div className="md:col-span-5 bg-zinc-50/90 p-4 sm:p-5 flex flex-col justify-between space-y-3.5">
                {/* 1. Resumen de Items */}
                <div>
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-zinc-200">
                    <span className="text-[11px] font-black uppercase tracking-wider text-zinc-900">
                      Resumen del Pedido ({items.length})
                    </span>
                    <span className="text-[10px] font-bold text-[#0d9488]">
                      DIGEMID CERTIFICADO
                    </span>
                  </div>

                  <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 divide-y divide-zinc-200/60">
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="pt-1.5 first:pt-0 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={item.product.images?.[0] || '/media/botica-hero-clean.jpg'}
                            alt={item.product.name}
                            className="w-7 h-7 object-contain rounded bg-white border border-zinc-200 p-0.5 shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-bold text-zinc-900 text-[11px] truncate">
                              {item.product.name}
                            </p>
                            <p className="text-[10px] text-zinc-400">
                              Cant: {item.quantity} × S/ {(Number(item.product.price) || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <span className="font-black text-zinc-900 text-xs shrink-0">
                          S/ {((Number(item.product.price) || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totales Claros */}
                  <div className="mt-3 pt-2.5 border-t border-zinc-200 space-y-1 text-xs">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal medicamentos:</span>
                      <span className="font-bold text-zinc-900">S/ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-600">
                      <span>Envío a domicilio (Juliaca):</span>
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] uppercase">
                        GRATIS
                      </span>
                    </div>
                    <div className="pt-2 border-t border-zinc-300 flex justify-between items-baseline">
                      <span className="text-xs font-black uppercase text-zinc-900">Total a Pagar:</span>
                      <span className="text-xl font-black text-[#0d9488]">
                        S/ {total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Selector de Método de Pago Integrado con Modal Dedicado */}
                <div className="pt-2 border-t border-zinc-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-extrabold uppercase text-zinc-500">
                      Método de Pago Seleccionado:
                    </label>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Pago Protegido
                    </span>
                  </div>

                  {/* Tarjeta Visual del Método con Botón para Abrir Modal */}
                  <div className="p-2.5 rounded-xl bg-white border border-zinc-200/90 shadow-2xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0d9488] shrink-0">
                        {paymentMethod === 'YAPE_PLIN' && (
                          <QrCode className="w-5 h-5 text-[#732282]" />
                        )}
                        {paymentMethod === 'TARJETA' && (
                          <CreditCard className="w-5 h-5 text-sky-600" />
                        )}
                        {paymentMethod === 'CONTRA_ENTREGA' && (
                          <Banknote className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <div className="truncate">
                        <span className="block text-xs font-black text-zinc-900 truncate">
                          {paymentMethod === 'YAPE_PLIN' && 'Yape / Plin (+51 955 545 561)'}
                          {paymentMethod === 'TARJETA' && 'Tarjeta Débito / Crédito (POS)'}
                          {paymentMethod === 'CONTRA_ENTREGA' && 'Contra Entrega en Domicilio'}
                        </span>
                        <span className="text-[10px] text-zinc-400 block truncate">
                          {paymentMethod === 'YAPE_PLIN' && 'QR y transferencia directa'}
                          {paymentMethod === 'TARJETA' && 'Visa, Mastercard o inalámbrico'}
                          {paymentMethod === 'CONTRA_ENTREGA' && 'Efectivo con vuelto o POS'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAbrirModalMetodo(paymentMethod)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-[#0d9488] text-white text-[10px] font-extrabold uppercase tracking-wider transition-all duration-150 cursor-pointer shrink-0 shadow-2xs"
                    >
                      Elegir Método de Pago
                    </button>
                  </div>
                </div>

                {/* 3. Botón de Acción Principal para Proceder al Pago y Emisión */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={items.length === 0}
                    className="w-full py-3 px-4 bg-[#0d9488] hover:bg-[#0f766e] active:scale-[0.99] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-700/20 disabled:opacity-50"
                  >
                    <span>CONTINUAR Y CONFIRMAR PEDIDO (S/ {total.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-zinc-400">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Emisión oficial de {tipoComprobante === 'FACTURA' ? 'Factura' : 'Boleta'} SUNAT</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Especializado de Pago (Yape con QR + Instrucciones / Tarjeta / Contra Entrega) */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirmPayment={handleConfirmPayment}
        subtotal={subtotal}
        shipping={shipping}
        total={total}
        customerName={
          tipoComprobante === 'FACTURA' && formData.razonSocial
            ? formData.razonSocial
            : `${formData.firstName} ${formData.lastName}`
        }
        initialMethod={paymentMethod}
        tipoComprobante={tipoComprobante}
      />

      {/* Boleta o Factura Electrónica Modal Oficial SUNAT */}
      <BoletaModal
        isOpen={isBoletaOpen}
        onClose={() => setIsBoletaOpen(false)}
        order={confirmedOrder}
      />
    </>
  );
};

export default CheckoutModal;
