import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Heart,
  User,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Lock,
  Sparkles,
  CreditCard,
  AlertTriangle,
  RotateCcw,
  Activity,
  HeartPulse,
  Pill,
  ExternalLink,
  MessageCircle,
  Stethoscope,
  ChevronRight,
  Search,
  Check,
  CircleDollarSign,
  Receipt,
  Eye,
  X,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Product } from '@/data/products';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import {
  getCustomerOrders,
  getActiveClient,
  saveActiveClient,
  logoutClient,
  CustomerOrder,
  ClientProfile,
} from '@/utils/orderStorage';
import { BoletaModal } from '@/components/checkout/BoletaModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthSwitch from '@/components/ui/auth-switch';
import { notificarExito, notificarAdvertencia, notificarError, confirmarAccion } from '@/utils/alertaSweet';

const DISTRITOS_LIMA = [
  'Lima Cercado',
  'Breña',
  'Jesús María',
  'Lince',
  'Magdalena del Mar',
  'Miraflores',
  'Pueblo Libre',
  'San Isidro',
  'San Borja',
  'Santiago de Surco',
  'San Miguel',
  'Barranco',
  'La Molina',
  'Los Olivos',
  'Independencia',
  'Ate',
  'Chorrillos',
  'Surquillo',
];

interface FichaSaludPaciente {
  alergias: string[];
  condiciones: string[];
  grupoSanguineo: string;
  contactoEmergenciaNombre: string;
  contactoEmergenciaTelefono: string;
  observaciones: string;
}

export default function ClientPortal() {
  const navigate = useNavigate();
  const location = useLocation();

  const { addItem: addToCart, openDrawer } = useCart();
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState<'pedidos' | 'botiquin' | 'salud' | 'datos'>(
    location.state?.tab === 'botiquin' || location.state?.tab === 'salud' || location.state?.tab === 'datos'
      ? location.state.tab
      : 'pedidos'
  );

  // Estado para el modal de contenido en dispositivos móviles
  const [mobileModalTab, setMobileModalTab] = useState<'pedidos' | 'botiquin' | 'salud' | 'datos' | null>(
    location.state?.tab === 'botiquin' || location.state?.tab === 'salud' || location.state?.tab === 'datos'
      ? location.state.tab
      : null
  );

  const [activeClient, setActiveClient] = useState<ClientProfile | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [filtroPedidos, setFiltroPedidos] = useState('');
  const [selectedBoletaOrder, setSelectedBoletaOrder] = useState<CustomerOrder | null>(null);
  const [isBoletaOpen, setIsBoletaOpen] = useState(false);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<CustomerOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Formulario de edición de perfil
  const [profileForm, setProfileForm] = useState({
    name: '',
    dni: '',
    email: '',
    phone: '',
    address: '',
    district: 'Lima Cercado',
    reference: '',
  });

  // Ficha de salud y prevención de interacciones farmacológicas
  const [fichaSalud, setFichaSalud] = useState<FichaSaludPaciente>({
    alergias: [],
    condiciones: [],
    grupoSanguineo: 'O+',
    contactoEmergenciaNombre: '',
    contactoEmergenciaTelefono: '',
    observaciones: '',
  });

  // Cargar cliente activo, pedidos y ficha de salud al montar
  useEffect(() => {
    const client = getActiveClient();
    if (client) {
      setActiveClient(client);
      setProfileForm({
        name: client.name || '',
        dni: client.dni || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        district: client.district || 'Lima Cercado',
        reference: (client as any).reference || '',
      });
      setOrders(getCustomerOrders(client));

      // Cargar ficha de salud personalizada
      try {
        const fichaGuardada = localStorage.getItem(`novasalud_ficha_${client.dni}`);
        if (fichaGuardada) {
          const parsed = JSON.parse(fichaGuardada);
          setFichaSalud({
            alergias: Array.isArray(parsed?.alergias) ? parsed.alergias : [],
            condiciones: Array.isArray(parsed?.condiciones) ? parsed.condiciones : [],
            grupoSanguineo: parsed?.grupoSanguineo || 'O+',
            contactoEmergenciaNombre: parsed?.contactoEmergenciaNombre || '',
            contactoEmergenciaTelefono: parsed?.contactoEmergenciaTelefono || '',
            observaciones: parsed?.observaciones || '',
          });
        }
      } catch (e) {
        console.warn('Error al leer ficha de salud:', e);
      }
    } else {
      setActiveClient(null);
      setOrders([]);
    }
  }, []);

  // Escuchar eventos de autenticación o nuevos pedidos en vivo
  useEffect(() => {
    const handleAuthChange = (e: any) => {
      const client = e.detail;
      if (client) {
        setActiveClient(client);
        setProfileForm({
          name: client.name || '',
          dni: client.dni || '',
          email: client.email || '',
          phone: client.phone || '',
          address: client.address || '',
          district: client.district || 'Lima Cercado',
          reference: client.reference || '',
        });
        setOrders(getCustomerOrders(client));
      } else {
        setActiveClient(null);
        setOrders([]);
      }
    };

    const handleNewOrder = (e: any) => {
      const current = getActiveClient();
      if (current) {
        setOrders(getCustomerOrders(current));
      } else if (e.detail?.customer) {
        setOrders(getCustomerOrders(e.detail.customer));
      }
      if (e.detail) {
        setSelectedBoletaOrder(e.detail);
      }
    };

    window.addEventListener('client-auth-changed', handleAuthChange);
    window.addEventListener('new-order-placed', handleNewOrder);
    return () => {
      window.removeEventListener('client-auth-changed', handleAuthChange);
      window.removeEventListener('new-order-placed', handleNewOrder);
    };
  }, []);

  // Cerrar sesión con confirmación
  const handleLogout = async () => {
    const confirmado = await confirmarAccion({
      titulo: '¿Cerrar Sesión de Paciente?',
      texto: 'Podrás volver a ingresar con tu DNI o correo electrónico en cualquier momento.',
      confirmText: 'Sí, cerrar sesión',
      cancelText: 'Permanecer aquí'
    });

    if (confirmado) {
      logoutClient();
      setActiveClient(null);
      setOrders([]);
      notificarExito('Sesión Finalizada', 'Hasta pronto, esperamos haber cuidado de tu salud.');
    }
  };

  // Guardar perfil y datos de contacto
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.dni.trim()) {
      notificarAdvertencia('Campos Obligatorios', 'Nombre y DNI son obligatorios para emitir comprobantes SUNAT.');
      return;
    }

    if (!/^\d{8}$/.test(profileForm.dni.trim())) {
      notificarAdvertencia('DNI Inválido', 'El DNI debe contener exactamente 8 dígitos.');
      return;
    }

    const updated: ClientProfile = {
      id: profileForm.dni,
      ...profileForm,
    };

    saveActiveClient(updated);
    setActiveClient(updated);
    notificarExito('Datos Actualizados', 'Tu información de entrega y facturación ha sido guardada correctamente.');
  };

  // Guardar ficha de salud
  const handleGuardarFichaSalud = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient) return;

    try {
      localStorage.setItem(`novasalud_ficha_${activeClient.dni}`, JSON.stringify(fichaSalud));
      notificarExito(
        'Ficha de Salud Guardada',
        'Tu historial de alergias y cuidados fue registrado para validar interacciones en tus despachos.'
      );
    } catch (err) {
      notificarError('Error al Guardar', 'No se pudo guardar la ficha de salud.');
    }
  };

  // Toggle de alergias
  const toggleAlergia = (alergia: string) => {
    setFichaSalud((prev) => {
      const existe = prev.alergias.includes(alergia);
      const nuevas = existe
        ? prev.alergias.filter((a) => a !== alergia)
        : [...prev.alergias, alergia];
      return { ...prev, alergias: nuevas };
    });
  };

  // Toggle de condiciones crónicas
  const toggleCondicion = (condicion: string) => {
    setFichaSalud((prev) => {
      const existe = prev.condiciones.includes(condicion);
      const nuevas = existe
        ? prev.condiciones.filter((c) => c !== condicion)
        : [...prev.condiciones, condicion];
      return { ...prev, condiciones: nuevas };
    });
  };

  // Recomprar un pedido completo en 1 clic
  const handleRecomprarPedido = (order: CustomerOrder) => {
    order.items.forEach((it) => {
      const productObj: Product = {
        id: it.id,
        name: it.name,
        slug: it.id,
        collection: 'medicamentos',
        price: it.price,
        unitLabel: it.presentation || 'Unidad',
        description: it.name,
        longDescription: it.name,
        materials: 'Certificación DIGEMID',
        images: it.image ? [it.image] : ['/media/catalog-hero/pexels-polina-tankilevitch-3735715.jpg'],
      };
      addToCart(productObj, it.quantity);
    });

    notificarExito(
      'Fármacos Agregados al Carrito',
      `Se agregaron los ${order.items.length} productos del pedido ${order.id}.`
    );
    openDrawer();
  };

  const handleOpenBoleta = (order: CustomerOrder) => {
    setSelectedBoletaOrder(order);
    setIsBoletaOpen(true);
  };

  const handleMoveWishlistToCart = (prod: any) => {
    addToCart(prod, 1);
    removeFromWishlist(prod.id);
    notificarExito('Agregado al Carrito', `${prod.name} ya está en tu lista de compra.`);
  };

  // Filtrado de pedidos
  const pedidosFiltrados = orders.filter((o) => {
    if (!filtroPedidos.trim()) return true;
    const term = filtroPedidos.toLowerCase();
    const matchId = (o?.id || '').toLowerCase().includes(term);
    const matchSerie = (o?.serieNumero || '').toLowerCase().includes(term);
    const matchItems = Array.isArray(o?.items) && o.items.some((i) => (i?.name || '').toLowerCase().includes(term));
    return matchId || matchSerie || matchItems;
  });

  // Si el usuario no ha iniciado sesión, mostrar la pantalla de acceso oficial
  if (!activeClient) {
    return <AuthSwitch onLoginSuccess={(client) => setActiveClient(client)} />;
  }

  // Puntos salud estimados
  const puntosSalud = orders.length * 25 + 50;

  // Items de navegación lateral y móvil con metadata completa
  const navItems = [
    {
      id: 'pedidos' as const,
      label: 'Mis Pedidos & Boletas',
      shortTitle: 'Mis Pedidos',
      icon: Receipt,
      count: orders.length,
      badgeText: `${orders.length} pedidos`,
      subtitle: orders.length === 1 ? '1 pedido registrado' : `${orders.length} pedidos registrados`,
      description: 'Historial de compras, estado y boletas electrónicas SUNAT',
      accentColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    },
    {
      id: 'botiquin' as const,
      label: 'Mi Botiquín Habitual',
      shortTitle: 'Mi Botiquín',
      icon: Pill,
      count: wishlistItems.length,
      badgeText: `${wishlistItems.length} fármacos`,
      subtitle: wishlistItems.length === 1 ? '1 fármaco guardado' : `${wishlistItems.length} fármacos guardados`,
      description: 'Medicamentos frecuentes para reposición rápida en 1 clic',
      accentColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    },
    {
      id: 'salud' as const,
      label: 'Ficha Médica & Alergias',
      shortTitle: 'Ficha Médica',
      icon: HeartPulse,
      hasAlert: (fichaSalud?.alergias || []).length > 0,
      badgeText: `Grupo ${fichaSalud?.grupoSanguineo || 'O+'}`,
      subtitle: (fichaSalud?.alergias || []).length > 0
        ? `${(fichaSalud?.alergias || []).length} alergias registradas`
        : 'Sin alergias registradas',
      description: 'Alergias a fármacos y prevención de interacciones cruzadas',
      accentColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    },
    {
      id: 'datos' as const,
      label: 'Direcciones & Facturación',
      shortTitle: 'Mis Datos',
      icon: User,
      badgeText: 'SUNAT',
      subtitle: activeClient?.district || 'Lima Cercado',
      description: 'Dirección de despacho a domicilio y datos de emisión',
      accentColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    },
  ];

  // =========================================================================
  // FUNCIONES DE RENDERIZADO MODULAR DE LAS PESTAÑAS (USADAS EN PC Y MÓVIL)
  // =========================================================================
  const renderPedidosContent = () => (
    <div className="space-y-4">
      {/* Barra de Búsqueda y Botón Nuevo Pedido al Lado Derecho */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="flex-1 w-full bg-white dark:bg-neutral-900 px-3.5 py-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex items-center gap-2.5">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={filtroPedidos}
            onChange={(e) => setFiltroPedidos(e.target.value)}
            placeholder="Buscar por código de pedido, boleta SUNAT o medicamento..."
            className="w-full text-xs bg-transparent focus:outline-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500"
          />
          {filtroPedidos && (
            <button
              type="button"
              onClick={() => setFiltroPedidos('')}
              className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 font-bold px-1.5 cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>

        <Button
          asChild
          className="w-full sm:w-auto h-9.5 rounded-2xl px-4 text-xs font-black uppercase tracking-wider bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-xs shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Link to="/products">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Nuevo Pedido</span>
          </Link>
        </Button>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl py-7 sm:py-8 px-6 sm:px-10 text-center max-w-lg mx-auto space-y-3 shadow-xs flex flex-col items-center justify-center my-auto">
          <div className="w-13 h-13 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#0d9488] dark:text-teal-400 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
              {orders.length === 0
                ? 'Aún no registras compras o despachos'
                : 'No se encontraron pedidos con ese término'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 max-w-sm mx-auto leading-relaxed">
              {orders.length === 0
                ? 'Tus compras de medicamentos, fórmulas magistrales y productos de cuidado personal aparecerán aquí con seguimiento en vivo y boleta electrónica SUNAT.'
                : 'Prueba buscando con otro número o limpia el filtro.'}
            </p>
          </div>
          <Button
            asChild
            className="rounded-2xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#0d9488] hover:bg-teal-700 text-white shadow-xs cursor-pointer"
          >
            <Link to="/products">Explorar Catálogo Farmacéutico</Link>
          </Button>
        </div>
      ) : (
        pedidosFiltrados.map((order) => {
          const totalItemsCount = order.items.reduce((acc, it) => acc + (it.quantity || 1), 0);
          const esFactura = order.tipoComprobante === 'FACTURA' || order.serieNumero?.startsWith('F');

          return (
            <div
              key={order.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3 sm:p-4 shadow-2xs hover:border-teal-400 dark:hover:border-teal-600 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Izquierda: Icono + Datos Clave */}
              <div
                className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                onClick={() => {
                  setSelectedDetailOrder(order);
                  setIsDetailModalOpen(true);
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#0d9488] dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                  <Package className="w-5 h-5" />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono font-black text-xs sm:text-sm text-neutral-900 dark:text-white">
                      {order.id}
                    </span>
                    <span className="text-[9.5px] px-1.5 py-0.2 rounded font-mono font-bold bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                      {order.serieNumero}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9.5px] px-1.5 py-0.2 rounded font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{order.status === 'ENTREGADO' ? 'Entregado' : 'En Preparación'}</span>
                    </span>
                    <span className="text-[9.5px] px-1.5 py-0.2 rounded font-bold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800">
                      {order.paymentMethod === 'YAPE_PLIN' ? 'Yape' : order.paymentMethod === 'TARJETA' ? 'Tarjeta' : 'Contra Entrega'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span>{order.date}</span>
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[260px] sm:max-w-md text-neutral-700 dark:text-neutral-300 font-medium">
                      {totalItemsCount} {totalItemsCount === 1 ? 'producto' : 'productos'}: {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Derecha: Total e Icono del Ojito + Acciones */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800 shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">
                    Total
                  </span>
                  <span className="text-sm sm:text-base font-black text-neutral-900 dark:text-white font-mono leading-none">
                    S/ {(Number(order.total) || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Botón Ojito para abrir el detalle completo */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDetailOrder(order);
                      setIsDetailModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-[#0d9488] text-[#0d9488] hover:text-white dark:text-teal-300 dark:hover:text-white border border-teal-200 dark:border-teal-800 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer shadow-2xs"
                    title="Ver detalle completo del pedido"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Detalle</span>
                  </button>

                  {/* Botón Boleta SUNAT */}
                  <button
                    type="button"
                    onClick={() => handleOpenBoleta(order)}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition flex items-center gap-1 text-xs font-bold cursor-pointer shadow-2xs"
                    title="Ver comprobante electrónico SUNAT"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#0d9488]" />
                    <span className="hidden md:inline">{esFactura ? 'Factura' : 'Boleta'}</span>
                  </button>

                  {/* Botón Recomprar */}
                  <button
                    type="button"
                    onClick={() => handleRecomprarPedido(order)}
                    className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 transition cursor-pointer"
                    title="Volver a pedir estos fármacos"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderBotiquinContent = () => (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Pill className="w-4 h-4 text-[#0d9488] dark:text-teal-400" />
            Mi Botiquín Familiar y Recetas Frecuentes
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Guarda los medicamentos que tomas con regularidad para reponer tu tratamiento en un solo clic.
          </p>
        </div>
        <Button
          asChild
          className="rounded-xl px-4 py-2 text-xs font-bold uppercase bg-[#0d9488] hover:bg-teal-700 text-white cursor-pointer shrink-0"
        >
          <Link to="/products">+ Agregar Fármacos</Link>
        </Button>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="py-8 sm:py-9 text-center max-w-md mx-auto space-y-3">
          <div className="w-13 h-13 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#0d9488] dark:text-teal-400 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h4 className="text-base font-bold text-neutral-900 dark:text-white">Tu botiquín frecuente está vacío</h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
            Marca medicamentos con el icono del corazón en nuestro catálogo para tenerlos siempre a mano y programar su reposición.
          </p>
          <Button
            asChild
            variant="outline"
            className="rounded-xl px-4 py-2 text-xs font-bold text-[#0d9488] dark:text-teal-400 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 mt-1 cursor-pointer"
          >
            <Link to="/products">Ver Catálogo de Medicamentos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map((prod) => {
            const productImage = prod.images?.[0] || (prod as any).image;
            const productCategory = prod.collection || (prod as any).category || 'Fármaco Certificado';

            return (
              <div
                key={prod.id}
                className="bg-neutral-50/60 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-teal-300 dark:hover:border-teal-700 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-2xs">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={prod.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-neutral-300 dark:text-neutral-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#0d9488] dark:text-teal-400 block truncate">
                      {productCategory}
                    </span>
                    <h4 className="text-xs font-extrabold text-neutral-900 dark:text-white truncate">
                      {prod.name}
                    </h4>
                    <span className="text-xs font-black font-mono text-neutral-900 dark:text-white block mt-0.5">
                      S/ {(Number(prod.price) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-200/80 dark:border-neutral-700">
                  <button
                    type="button"
                    onClick={() => handleMoveWishlistToCart(prod)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#0d9488] hover:bg-teal-700 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Agregar al Carrito</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(prod.id)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                    title="Quitar de mi botiquín"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSaludContent = () => (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6">
      <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <Stethoscope className="w-3 h-3 text-[#0d9488] dark:text-teal-400" />
            <span>Prevención Farmacológica</span>
          </div>
          <h3 className="text-lg font-black text-neutral-900 dark:text-white">
            Ficha Médica y Alergias a Medicamentos
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
            Esta información es confidencial. Ayuda a nuestro Químico Farmacéutico a validar que los medicamentos que compras no produzcan alergias graves ni interacciones cruzadas.
          </p>
        </div>
        <HeartPulse className="w-6 h-6 text-[#0d9488] dark:text-teal-400 shrink-0" />
      </div>

      <form onSubmit={handleGuardarFichaSalud} className="space-y-6">
        {/* Alergias medicamentosas */}
        <div className="space-y-2.5">
          <label className="block text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">
            ¿Presentas alergia a algún medicamento?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              'Penicilina / Amoxicilina',
              'AINEs (Ibuprofeno, Naproxeno)',
              'Sulfas / Trimetoprim',
              'Aspirina / Ác. Acetilsalicílico',
              'Cefalosporinas',
              'Ninguna conocida',
            ].map((alergia) => {
              const seleccionada = (fichaSalud?.alergias || []).includes(alergia);
              return (
                <button
                  type="button"
                  key={alergia}
                  onClick={() => toggleAlergia(alergia)}
                  className={`p-3 rounded-2xl text-xs font-bold text-left transition border cursor-pointer flex items-center justify-between ${
                    seleccionada
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 ring-1 ring-rose-200 dark:ring-rose-900'
                      : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className="truncate">{alergia}</span>
                  {seleccionada ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-neutral-300 dark:border-neutral-600"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Condiciones crónicas */}
        <div className="space-y-2.5">
          <label className="block text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">
            Condiciones crónicas o tratamientos en curso
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              'Hipertensión Arterial',
              'Diabetes Tipo 1 / 2',
              'Asma Bronquial',
              'Gastritis / Úlcera',
              'Enfermedad Renal',
              'Ninguna condición',
            ].map((cond) => {
              const seleccionada = (fichaSalud?.condiciones || []).includes(cond);
              return (
                <button
                  type="button"
                  key={cond}
                  onClick={() => toggleCondicion(cond)}
                  className={`p-3 rounded-2xl text-xs font-bold text-left transition border cursor-pointer flex items-center justify-between ${
                    seleccionada
                      ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800 ring-1 ring-teal-200 dark:ring-teal-900'
                      : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className="truncate">{cond}</span>
                  {seleccionada ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488] dark:text-teal-400 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-neutral-300 dark:border-neutral-600"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grupo Sanguíneo y Contacto de Emergencia */}
        <div className="grid sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Grupo Sanguíneo
            </label>
            <select
              value={fichaSalud.grupoSanguineo}
              onChange={(e) => setFichaSalud({ ...fichaSalud, grupoSanguineo: e.target.value })}
              className="w-full text-xs rounded-xl h-10 border border-neutral-200 dark:border-neutral-700 px-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono font-bold focus:border-[#0d9488] focus:outline-none"
            >
              {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'No sé'].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Contacto de Emergencia
            </label>
            <Input
              type="text"
              placeholder="Ej. María Pérez (Madre)"
              value={fichaSalud.contactoEmergenciaNombre}
              onChange={(e) =>
                setFichaSalud({ ...fichaSalud, contactoEmergenciaNombre: e.target.value })
              }
              className="text-xs rounded-xl h-10 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Teléfono de Emergencia
            </label>
            <Input
              type="tel"
              maxLength={9}
              placeholder="955545561"
              value={fichaSalud.contactoEmergenciaTelefono}
              onChange={(e) =>
                setFichaSalud({
                  ...fichaSalud,
                  contactoEmergenciaTelefono: e.target.value.replace(/\D/g, ''),
                })
              }
              className="text-xs rounded-xl h-10 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-[11px] text-neutral-400 dark:text-neutral-400">
            Protegido bajo secreto profesional farmacéutico
          </span>
          <Button
            type="submit"
            className="rounded-xl px-5 py-2.5 text-xs font-bold uppercase bg-[#0d9488] hover:bg-teal-700 text-white shadow-xs cursor-pointer"
          >
            Guardar Ficha Sanitaria
          </Button>
        </div>
      </form>
    </div>
  );

  const renderDatosContent = () => (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6">
      <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-neutral-900 dark:text-white">
            Datos de Facturación y Entrega en Lima
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Se usarán de forma predeterminada para tus boletas electrónicas SUNAT y la dirección de despacho.
          </p>
        </div>
        <ShieldCheck className="w-5 h-5 text-[#0d9488] dark:text-teal-400 shrink-0" />
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Nombres y Apellidos Completos *
            </label>
            <Input
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="rounded-xl text-xs h-10 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-[#0d9488]"
              placeholder="Juan Pérez"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              DNI (8 dígitos) *
            </label>
            <Input
              required
              maxLength={8}
              value={profileForm.dni}
              onChange={(e) =>
                setProfileForm({ ...profileForm, dni: e.target.value.replace(/\D/g, '') })
              }
              className="rounded-xl text-xs h-10 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono focus:border-[#0d9488]"
              placeholder="72345678"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Celular / WhatsApp *
            </label>
            <Input
              type="tel"
              maxLength={9}
              value={profileForm.phone}
              onChange={(e) =>
                setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '') })
              }
              className="rounded-xl text-xs h-10 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono focus:border-[#0d9488]"
              placeholder="955545561"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Correo Electrónico
            </label>
            <Input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="rounded-xl text-xs h-10 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-[#0d9488]"
              placeholder="juan@correo.com"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Dirección Habitual de Entrega *
            </label>
            <Input
              required
              value={profileForm.address}
              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              className="rounded-xl text-xs h-10 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-[#0d9488]"
              placeholder="Av. Principal 1248, Dpto 302"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Distrito de Lima *
            </label>
            <select
              value={profileForm.district}
              onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
              className="w-full text-xs rounded-xl h-10 border border-neutral-200 dark:border-neutral-700 px-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-[#0d9488] focus:outline-none"
            >
              {DISTRITOS_LIMA.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Referencia de Entrega (Opcional)
          </label>
          <Input
            value={profileForm.reference}
            onChange={(e) => setProfileForm({ ...profileForm, reference: e.target.value })}
            className="rounded-xl text-xs h-10 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-[#0d9488]"
            placeholder="Ej. Portón blanco, frente al parque, timbre 402"
          />
        </div>

        <div className="pt-3 flex justify-end">
          <Button
            type="submit"
            className="rounded-xl px-6 py-2.5 text-xs font-bold uppercase bg-[#0d9488] hover:bg-teal-700 text-white shadow-xs cursor-pointer"
          >
            Guardar y Actualizar
          </Button>
        </div>
      </form>
    </div>
  );

  const renderTabContent = (tab: 'pedidos' | 'botiquin' | 'salud' | 'datos') => {
    switch (tab) {
      case 'pedidos':
        return renderPedidosContent();
      case 'botiquin':
        return renderBotiquinContent();
      case 'salud':
        return renderSaludContent();
      case 'datos':
        return renderDatosContent();
      default:
        return null;
    }
  };

  return (
    <Layout>
      {/* Contenedor Principal: Calibrado para encajar perfectamente tanto en PC como en móviles */}
      <div className="container-full py-3.5 lg:py-4 min-h-[calc(100vh-76px)] flex flex-col justify-start">
        {/* =========================================================================
            VISTA DESKTOP / PC: SIDEBAR LATERAL + PANE PRINCIPAL (INTACTO COMO ANTES)
            ========================================================================= */}
        <div className="hidden lg:flex lg:flex-row gap-4 items-stretch flex-1">
          {/* LADO IZQUIERDO: MENÚ LATERAL CON ESTILO DE PANEL ADMINISTRATIVO */}
          <aside className="w-full lg:w-72 xl:w-76 shrink-0 flex flex-col">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-4 sm:p-4.5 shadow-xs flex flex-col justify-between flex-1 space-y-3">
              <div className="space-y-3">
                {/* Perfil Condensado del Paciente */}
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800 text-[#0d9488] dark:text-teal-400 flex items-center justify-center font-black text-lg shadow-2xs shrink-0">
                    {activeClient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                        <span>Verificado</span>
                      </span>
                      <span className="text-[9.5px] font-mono text-neutral-400 dark:text-neutral-500">
                        ID: {activeClient.dni}
                      </span>
                    </div>
                    <h2 className="text-sm font-black text-neutral-900 dark:text-white truncate mt-0.5">
                      {activeClient.name}
                    </h2>
                    <p className="text-[10.5px] text-neutral-400 dark:text-neutral-500 truncate">
                      {activeClient.district || 'Lima Cercado'}
                    </p>
                  </div>
                </div>

                {/* Ficha médica rápida (Sangre y Alergias) */}
                <div className="bg-neutral-50/80 dark:bg-neutral-800/60 rounded-2xl p-2 px-3 border border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-[#0d9488] dark:text-teal-400" />
                    <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                      Grupo <span className="font-mono font-black text-neutral-900 dark:text-white">{fichaSalud?.grupoSanguineo || 'O+'}</span>
                    </span>
                  </div>
                  {(fichaSalud?.alergias || []).length > 0 ? (
                    <span className="text-[9px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-800">
                      {(fichaSalud?.alergias || []).length} Alergia{(fichaSalud?.alergias || []).length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                      Sin Alergias
                    </span>
                  )}
                </div>

                {/* Menú de Navegación Vertical Directo (Estilo Admin Layout) */}
                <nav className="space-y-0.5">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-2.5 block mb-1">
                    Menú del Paciente
                  </span>

                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`relative w-full px-3 py-2 rounded-2xl text-xs sm:text-[13px] font-bold flex items-center justify-between transition cursor-pointer text-left select-none ${
                          isActive
                            ? 'bg-teal-50/90 dark:bg-teal-950/40 text-[#0d9488] dark:text-teal-300 shadow-2xs'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#0d9488] dark:bg-teal-400 rounded-r-full" />
                        )}
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#0d9488] dark:text-teal-400 stroke-[2.2]' : 'text-neutral-400 dark:text-neutral-500'}`} />
                          <span className="truncate leading-none">{item.label}</span>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0 ml-1.5">
                          {typeof item.count === 'number' && (
                            <span
                              className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                                isActive
                                  ? 'bg-[#0d9488] text-white'
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                              }`}
                            >
                              {item.count}
                            </span>
                          )}
                          {item.hasAlert && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-rose-200 dark:ring-rose-950"></span>
                          )}
                          <ChevronRight
                            className={`w-3 h-3 transition-transform ${
                              isActive ? 'text-[#0d9488] dark:text-teal-400 translate-x-0.5' : 'text-neutral-300 dark:text-neutral-600'
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Pie del Sidebar: Soporte WhatsApp + Cierre de Sesión */}
              <div className="pt-2.5 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5">
                <a
                  href="https://wa.me/51955545561?text=Hola%20Botica%20Nova%20Salud,%20deseo%20orientaci%C3%B3n%20farmac%C3%A9utica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Asistencia WhatsApp</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-emerald-500" />
                </a>

                <button
                  onClick={handleLogout}
                  className="w-full py-1.5 px-3 rounded-xl text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </aside>

          {/* LADO DERECHO: TARJETAS ESTADÍSTICAS DEL ADMIN + CONTENIDO */}
          <main className="flex-1 min-w-0 flex flex-col space-y-3 w-full">
            {/* Fila de 4 Tarjetas Estadísticas con la Paleta Cromática del Dashboard de Admin (Solo visible en Mis Pedidos) */}
            {activeTab === 'pedidos' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Tarjeta 1: Azul Cobalto (Mis Pedidos) */}
                <div className="bg-white dark:bg-neutral-900 p-3.5 sm:p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition min-h-[96px]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900/50 flex items-center justify-center shrink-0">
                      <Receipt className="w-3.5 h-3.5" />
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                      Mis Pedidos
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-mono leading-tight mt-0.5">
                      {orders.length}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-block text-[9.5px] font-bold px-1.5 py-0.2 rounded border bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                      100% Conformes
                    </span>
                  </div>
                </div>

                {/* Tarjeta 2: Esmeralda / Teal (Puntos Salud) */}
                <div className="bg-white dark:bg-neutral-900 p-3.5 sm:p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition min-h-[96px]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/50 flex items-center justify-center shrink-0">
                      <CircleDollarSign className="w-3.5 h-3.5" />
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                      Puntos Salud
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#0d9488] dark:text-teal-400 font-mono leading-tight mt-0.5">
                      {puntosSalud}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-block text-[9.5px] font-bold px-1.5 py-0.2 rounded border bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                      S/ 15 en dscto
                    </span>
                  </div>
                </div>

                {/* Tarjeta 3: Púrpura (En Tratamiento) */}
                <div className="bg-white dark:bg-neutral-900 p-3.5 sm:p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-700 transition min-h-[96px]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-900/50 flex items-center justify-center shrink-0">
                      <Pill className="w-3.5 h-3.5" />
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-purple-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                      En Tratamiento
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-mono leading-tight mt-0.5">
                      {wishlistItems.length}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-block text-[9.5px] font-bold px-1.5 py-0.2 rounded border bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                      Fármacos guardados
                    </span>
                  </div>
                </div>

                {/* Tarjeta 4: Ámbar Cálido (Entrega Lima) */}
                <div className="bg-white dark:bg-neutral-900 p-3.5 sm:p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-700 transition min-h-[96px]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900/50 flex items-center justify-center shrink-0">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                      Entrega Lima
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white block truncate leading-tight mt-1">
                      {activeClient.district || 'Lima Cercado'}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-block text-[9.5px] font-bold px-1.5 py-0.2 rounded border bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                      Prom. 45 min
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Contenido Dinámico de la Pestaña Activa en PC */}
            <div className="space-y-4">
              {renderTabContent(activeTab)}
            </div>
          </main>
        </div>

        {/* =========================================================================
            VISTA MÓVIL: RESUMEN DEL PACIENTE + OPCIONES CENTRADAS EN EL MEDIO + MODAL
            ========================================================================= */}
        <div className="block lg:hidden w-full space-y-3.5 pb-6">
          {/* 1. Tarjeta de Perfil Móvil */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800 text-[#0d9488] dark:text-teal-400 flex items-center justify-center font-black text-xl shadow-2xs shrink-0">
                {activeClient.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                    <span>Verificado</span>
                  </span>
                  <span className="text-[9.5px] font-mono text-neutral-400 dark:text-neutral-500">
                    DNI: {activeClient.dni}
                  </span>
                </div>
                <h2 className="text-base font-black text-neutral-900 dark:text-white truncate mt-0.5">
                  {activeClient.name}
                </h2>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
                  {activeClient.district || 'Lima Cercado'} • {activeClient.phone || 'Sin celular registrado'}
                </p>
              </div>
            </div>

            {/* Badges de salud y puntos en móvil */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-center">
              <div className="bg-neutral-50 dark:bg-neutral-800/60 p-2 rounded-xl border border-neutral-200/70 dark:border-neutral-800">
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">
                  Sangre
                </span>
                <span className="text-xs font-black font-mono text-neutral-900 dark:text-white">
                  {fichaSalud?.grupoSanguineo || 'O+'}
                </span>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-800/60 p-2 rounded-xl border border-neutral-200/70 dark:border-neutral-800">
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">
                  Alergias
                </span>
                <span className={`text-xs font-black ${(fichaSalud?.alergias || []).length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {(fichaSalud?.alergias || []).length > 0 ? `${(fichaSalud?.alergias || []).length} reg.` : 'Ninguna'}
                </span>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-800/60 p-2 rounded-xl border border-neutral-200/70 dark:border-neutral-800">
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">
                  Puntos
                </span>
                <span className="text-xs font-black font-mono text-[#0d9488] dark:text-teal-400">
                  {puntosSalud}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Grid de 4 Estadísticas Rápidas en Móvil */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900/50 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block truncate">
                  Pedidos
                </span>
                <span className="text-base font-black text-neutral-900 dark:text-white font-mono leading-none">
                  {orders.length}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/50 flex items-center justify-center shrink-0">
                <CircleDollarSign className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block truncate">
                  Puntos
                </span>
                <span className="text-base font-black text-[#0d9488] dark:text-teal-400 font-mono leading-none">
                  {puntosSalud}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-900/50 flex items-center justify-center shrink-0">
                <Pill className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block truncate">
                  Botiquín
                </span>
                <span className="text-base font-black text-neutral-900 dark:text-white font-mono leading-none">
                  {wishlistItems.length}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900/50 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block truncate">
                  Despacho
                </span>
                <span className="text-xs font-black text-neutral-900 dark:text-white truncate block leading-none">
                  {activeClient.district || 'Lima'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. MENÚ DE OPCIONES EN EL MEDIO (CENTRADAS) */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Opciones del Portal
              </span>
              <span className="text-[10px] font-bold text-[#0d9488] dark:text-teal-400">
                Toca para abrir contenido
              </span>
            </div>

            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-mobile-card={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileModalTab(item.id);
                    }}
                    className="w-full p-3.5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/60 hover:bg-teal-50/60 dark:hover:bg-teal-950/40 border border-neutral-200/80 dark:border-neutral-700/80 hover:border-teal-300 dark:hover:border-teal-700 transition-all flex items-center justify-between gap-3 text-left cursor-pointer active:scale-[0.99] group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.accentColor} group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white truncate">
                            {item.label}
                          </h3>
                          {item.badgeText && (
                            <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">
                              {item.badgeText}
                            </span>
                          )}
                          {item.hasAlert && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-rose-200 dark:ring-rose-950 shrink-0"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0 group-hover:bg-[#0d9488] group-hover:border-[#0d9488] group-hover:text-white transition">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Accesos Rápidos Inferiores: WhatsApp + Cerrar Sesión */}
          <div className="space-y-2 pt-1">
            <a
              href="https://wa.me/51955545561?text=Hola%20Botica%20Nova%20Salud,%20deseo%20orientaci%C3%B3n%20farmac%C3%A9utica"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Asistencia WhatsApp Nova Salud</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
            </a>

            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 rounded-2xl text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-neutral-200 dark:border-neutral-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL MÓVIL CON EL CONTENIDO DE LA OPCIÓN SELECCIONADA
          ========================================================================= */}
      {mobileModalTab && (
        <div
          className="fixed inset-0 z-45 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 lg:hidden"
          onClick={() => setMobileModalTab(null)}
        >
          <div
            className="relative w-full sm:max-w-xl md:max-w-2xl bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 text-neutral-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal Móvil */}
            <div className="px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#0d9488] dark:text-teal-400 flex items-center justify-center shrink-0">
                  {mobileModalTab === 'pedidos' && <Receipt className="w-5 h-5" />}
                  {mobileModalTab === 'botiquin' && <Pill className="w-5 h-5" />}
                  {mobileModalTab === 'salud' && <HeartPulse className="w-5 h-5" />}
                  {mobileModalTab === 'datos' && <User className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-neutral-900 dark:text-white uppercase tracking-tight">
                    {navItems.find((n) => n.id === mobileModalTab)?.label}
                  </h2>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {navItems.find((n) => n.id === mobileModalTab)?.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileModalTab(null)}
                className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido scrolleable del Modal Móvil */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {renderTabContent(mobileModalTab)}
            </div>

            {/* Footer del Modal Móvil con botón de cerrar */}
            <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setMobileModalTab(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Cerrar Ventana</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle Completo del Pedido & Trazabilidad Sanitaria */}
      {isDetailModalOpen && selectedDetailOrder && (
        <div
          className="fixed inset-0 z-55 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 text-[#18181b] dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#0d9488] dark:text-teal-400 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-black text-neutral-900 dark:text-white uppercase tracking-tight">
                      Detalle del Pedido {selectedDetailOrder.id}
                    </h2>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                      {selectedDetailOrder.serieNumero}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Emitido el {selectedDetailOrder.date}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* 1. Seguimiento de Despacho en Vivo */}
              <div className="bg-neutral-50/80 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-neutral-900 dark:text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Truck className="w-4 h-4 text-[#0d9488] dark:text-teal-400" />
                    Seguimiento de Despacho en Vivo
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {selectedDetailOrder.status === 'ENTREGADO' ? 'Entrega Conforme' : 'En Proceso'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { label: 'Confirmado', detalle: 'Boleta emitida SUNAT', activo: true },
                    {
                      label: 'En Preparación',
                      detalle: 'Control FEFO y lote DIGEMID',
                      activo: ['PREPARANDO', 'EN_CAMINO', 'ENTREGADO'].includes(selectedDetailOrder.status),
                    },
                    {
                      label: 'En Ruta',
                      detalle: 'Motorizado Nova Salud',
                      activo: ['EN_CAMINO', 'ENTREGADO'].includes(selectedDetailOrder.status),
                    },
                    {
                      label: 'Entregado',
                      detalle: 'Recepción conforme',
                      activo: selectedDetailOrder.status === 'ENTREGADO',
                    },
                  ].map((f, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          f.activo
                            ? 'bg-[#0d9488] text-white'
                            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                        }`}
                      >
                        {f.activo ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                      </div>
                      <div className="min-w-0">
                        <span className={`block text-xs font-bold leading-tight ${f.activo ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
                          {f.label}
                        </span>
                        <span className="text-[9.5px] text-neutral-400 block leading-tight mt-0.5">
                          {f.detalle}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Medicamentos Solicitados */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-900 dark:text-white block">
                  Medicamentos y Productos ({selectedDetailOrder.items.length})
                </span>
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
                  {selectedDetailOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-neutral-900 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-1 flex items-center justify-center shrink-0">
                          {it.image ? (
                            <img src={it.image} alt={it.name} className="w-full h-full object-contain" />
                          ) : (
                            <Pill className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-neutral-900 dark:text-white text-xs truncate">
                            {it.name}
                          </p>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            Cant: {it.quantity} × S/ {(Number(it.price) || 0).toFixed(2)} ({it.presentation})
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-black text-neutral-900 dark:text-white shrink-0">
                        S/ {(Number(it.subtotal) || (Number(it.price) * it.quantity)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Datos de Despacho y Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-neutral-50 dark:bg-neutral-800/60 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-neutral-900 dark:text-white font-bold text-[11px] uppercase">
                    <MapPin className="w-3.5 h-3.5 text-[#0d9488]" />
                    <span>Lugar de Entrega</span>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                    {selectedDetailOrder.customer.address}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Distrito: <strong>{selectedDetailOrder.customer.district || 'Lima Cercado'}</strong>
                  </p>
                  {selectedDetailOrder.customer.reference && (
                    <p className="text-[10px] text-neutral-400 italic">
                      Ref: {selectedDetailOrder.customer.reference}
                    </p>
                  )}
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800/60 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-neutral-900 dark:text-white font-bold text-[11px] uppercase">
                    <CreditCard className="w-3.5 h-3.5 text-[#0d9488]" />
                    <span>Método de Pago</span>
                  </div>
                  <p className="font-bold text-[#0d9488] dark:text-teal-400">
                    {selectedDetailOrder.paymentDetails}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Contacto: {selectedDetailOrder.customer.phone}
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    DNI/RUC: {selectedDetailOrder.customer.dni || selectedDetailOrder.customer.ruc}
                  </p>
                </div>
              </div>

              {/* 4. Resumen de Liquidación */}
              <div className="bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800 rounded-2xl p-3.5 space-y-1 text-xs">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Subtotal productos:</span>
                  <span>S/ {(Number(selectedDetailOrder.subtotal) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Envío a domicilio:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">GRATIS</span>
                </div>
                <div className="pt-2 border-t border-teal-200 dark:border-teal-800 flex justify-between items-baseline font-bold text-sm text-neutral-950 dark:text-white">
                  <span className="uppercase font-black text-xs">Total Facturado SUNAT:</span>
                  <span className="font-mono text-base font-black text-[#0d9488] dark:text-teal-400">
                    S/ {(Number(selectedDetailOrder.total) || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer de Acciones del Modal */}
            <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => handleRecomprarPedido(selectedDetailOrder)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#0d9488]" />
                <span>Recomprar Fármacos</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenBoleta(selectedDetailOrder);
                    setIsDetailModalOpen(false);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-teal-700/20"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Ver Boleta / Factura SUNAT</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Visualizar / Descargar Boleta Oficial */}
      <BoletaModal
        isOpen={isBoletaOpen}
        onClose={() => setIsBoletaOpen(false)}
        order={selectedBoletaOrder}
      />
    </Layout>
  );
}
