/**
 * Almacenamiento local persistente para pedidos, boletas electrónicas
 * y autenticación de clientes de Botica Nova Salud
 */

export interface OrderCustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  tipoComprobante?: 'BOLETA' | 'FACTURA';
  ruc?: string;
  razonSocial?: string;
  address: string;
  reference?: string;
  district: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  presentation: string;
  quantity: number;
  price: number;
  subtotal: number;
  image?: string;
}

export interface CustomerOrder {
  id: string; // e.g. "NS-2026-0842"
  serieNumero: string; // e.g. "B001-00004523" o "F001-00004523"
  tipoComprobante?: 'BOLETA' | 'FACTURA';
  date: string;
  fechaSunat?: string; // Formato oficial SUNAT YYYY-MM-DD
  timestamp: number;
  customer: OrderCustomerInfo;
  items: OrderItem[];
  subtotal: number;
  igv: number;
  shipping: number;
  total: number;
  paymentMethod: 'YAPE_PLIN' | 'TARJETA' | 'CONTRA_ENTREGA' | 'TRANSFERENCIA';
  paymentDetails: string;
  status: 'CONFIRMADO' | 'PREPARANDO' | 'EN_CAMINO' | 'ENTREGADO';
}

export interface ClientProfile {
  id: string;
  dni: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  reference?: string;
  password?: string;
  createdAt?: number;
}

const STORAGE_ORDERS_KEY = 'nova_salud_customer_orders';
const CLIENT_USER_KEY = 'nova_salud_client_user';
const CLIENTS_DB_KEY = 'nova_salud_registered_clients';

/**
 * Obtener todos los pedidos almacenados o filtrados por DNI/correo del cliente
 */
export function getCustomerOrders(clientIdentifier?: string | { dni?: string; email?: string; phone?: string; id?: string }): CustomerOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (!raw) return [];

    let orders: CustomerOrder[] = JSON.parse(raw);
    if (!Array.isArray(orders)) return [];

    // Filtrar entradas corruptas o nulas
    orders = orders.filter((o) => o && typeof o === 'object');

    // Si se pasa un objeto de cliente o un identificador en string
    if (clientIdentifier) {
      if (typeof clientIdentifier === 'string') {
        const idf = clientIdentifier.trim().toLowerCase();
        if (!idf) return orders;
        return orders.filter(
          (o) =>
            o.customer?.dni?.trim().toLowerCase() === idf ||
            o.customer?.email?.trim().toLowerCase() === idf ||
            (o.customer?.ruc && o.customer.ruc.trim().toLowerCase() === idf) ||
            (o.customer?.phone && o.customer.phone.trim().replace(/\D/g, '') === idf.replace(/\D/g, ''))
        );
      } else {
        const dni = clientIdentifier.dni?.trim().toLowerCase();
        const email = clientIdentifier.email?.trim().toLowerCase();
        const phone = clientIdentifier.phone?.trim().replace(/\D/g, '');
        const id = clientIdentifier.id?.trim().toLowerCase();

        return orders.filter((o) => {
          if (!o.customer) return false;
          const cDni = o.customer.dni?.trim().toLowerCase() || '';
          const cEmail = o.customer.email?.trim().toLowerCase() || '';
          const cRuc = o.customer.ruc?.trim().toLowerCase() || '';
          const cPhone = o.customer.phone?.trim().replace(/\D/g, '') || '';

          if (dni && (cDni === dni || cRuc === dni)) return true;
          if (email && cEmail === email) return true;
          if (phone && cPhone === phone) return true;
          if (id && (cDni === id || cRuc === id)) return true;
          return false;
        });
      }
    }

    return orders;
  } catch (e) {
    console.error('Error al leer pedidos de cliente:', e);
    return [];
  }
}

/**
 * Sincroniza el pedido web con la base de datos backend de Botica Nova Salud
 * Registra la venta atómica, descuenta stock del inventario y alimenta las métricas del panel Admin
 */
export async function syncOrderToBackend(order: CustomerOrder) {
  try {
    const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';
    await fetch(`${API_BASE}/catalogo/pedido-web`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: order.items.map((it) => ({
          productoId: it.id,
          cantidad: it.quantity,
          name: it.name,
        })),
        metodoPago: order.paymentMethod,
        clienteDoc: order.customer.dni || order.customer.ruc,
        clienteNom:
          order.customer.tipoComprobante === 'FACTURA' && order.customer.razonSocial
            ? order.customer.razonSocial
            : `${order.customer.firstName} ${order.customer.lastName}`,
        direccion: order.customer.address,
        distrito: order.customer.district,
        tipoComprobante: order.customer.tipoComprobante || 'BOLETA',
        ruc: order.customer.ruc,
        razonSocial: order.customer.razonSocial,
        correlativo: order.serieNumero,
        total: order.total,
      }),
    });
  } catch (err) {
    console.warn('Backend sync warning (continuando en modo offline):', err);
  }
}

/**
 * Guardar un nuevo pedido en el almacenamiento local y sincronizar con backend y admin
 */
export function saveCustomerOrder(order: CustomerOrder): void {
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    const existing: CustomerOrder[] = raw ? JSON.parse(raw) : [];
    const updated = [order, ...existing];
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('new-order-placed', { detail: order }));

    // Disparar sincronización con el backend sin bloquear la UI
    syncOrderToBackend(order);
  } catch (e) {
    console.error('Error al guardar pedido:', e);
  }
}

/**
 * Genera el siguiente número correlativo de serie y boleta B001-XXXXXXXX o Factura F001-XXXXXXXX
 */
export function generateNextCorrelative(tipo: 'BOLETA' | 'FACTURA' = 'BOLETA'): { id: string; serieNumero: string } {
  const orders = getCustomerOrders();
  const nextNum = 4521 + orders.length;
  const correlative = String(nextNum).padStart(8, '0');
  const orderId = `NS-2026-${String(nextNum).slice(-4)}`;
  const prefix = tipo === 'FACTURA' ? 'F001' : 'B001';
  return {
    id: orderId,
    serieNumero: `${prefix}-${correlative}`,
  };
}

/**
 * Obtener el listado de clientes registrados en el sistema
 */
export function getRegisteredClients(): ClientProfile[] {
  try {
    const raw = localStorage.getItem(CLIENTS_DB_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * Obtiene el cliente que tiene la sesión activa actualmente
 */
export function getActiveClient(): ClientProfile | null {
  try {
    const raw = localStorage.getItem(CLIENT_USER_KEY);
    if (!raw) return null;
    const client: ClientProfile = JSON.parse(raw);

    // Evitar persistencia de demostraciones anteriores no deseadas
    if (client.email === 'maria.gonzalez@gmail.com' || client.dni === '45892147') {
      localStorage.removeItem(CLIENT_USER_KEY);
      return null;
    }

    return client;
  } catch {
    return null;
  }
}

/**
 * Guarda el cliente con sesión activa
 */
export function saveActiveClient(client: ClientProfile): void {
  try {
    localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(client));

    // Asegurar que también esté guardado en la lista de clientes registrados
    const clients = getRegisteredClients();
    const index = clients.findIndex((c) => c.dni === client.dni || c.email === client.email);
    if (index >= 0) {
      clients[index] = { ...clients[index], ...client };
    } else {
      clients.push(client);
    }
    localStorage.setItem(CLIENTS_DB_KEY, JSON.stringify(clients));

    window.dispatchEvent(new CustomEvent('client-auth-changed', { detail: client }));
  } catch (e) {
    console.error('Error guardando cliente:', e);
  }
}

/**
 * Registrar un nuevo cliente
 */
export function registerClient(data: {
  name: string;
  dni: string;
  email: string;
  phone: string;
  address: string;
  district?: string;
  password?: string;
}): { success: boolean; message: string; client?: ClientProfile } {
  try {
    const cleanDni = data.dni.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.name.trim();

    if (!cleanName) {
      return { success: false, message: 'Ingresa tus nombres y apellidos completos.' };
    }
    if (!/^\d{8}$/.test(cleanDni)) {
      return { success: false, message: 'El DNI debe contener exactamente 8 dígitos numéricos.' };
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, message: 'Ingresa un correo electrónico válido.' };
    }
    if (data.password && data.password.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const clients = getRegisteredClients();

    // Validar duplicidad
    if (clients.some((c) => c.dni === cleanDni)) {
      return {
        success: false,
        message: 'Ya existe una cuenta registrada con este DNI. Por favor inicia sesión.',
      };
    }
    if (clients.some((c) => c.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        message: 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.',
      };
    }

    const newClient: ClientProfile = {
      id: cleanDni,
      dni: cleanDni,
      name: cleanName,
      email: cleanEmail,
      phone: data.phone.trim(),
      address: data.address.trim(),
      district: data.district?.trim() || 'Lima',
      password: data.password || '',
      createdAt: Date.now(),
    };

    clients.push(newClient);
    localStorage.setItem(CLIENTS_DB_KEY, JSON.stringify(clients));
    saveActiveClient(newClient);

    return {
      success: true,
      message: `¡Bienvenido(a), ${cleanName}! Tu cuenta ha sido creada exitosamente.`,
      client: newClient,
    };
  } catch (e) {
    console.error('Error en registerClient:', e);
    return { success: false, message: 'Ocurrió un error al registrar la cuenta.' };
  }
}

/**
 * Iniciar sesión de un cliente por DNI o correo
 */
export function loginClient(
  identifier: string,
  password?: string
): { success: boolean; message: string; client?: ClientProfile } {
  try {
    const idf = identifier.trim().toLowerCase();
    if (!idf) {
      return { success: false, message: 'Ingresa tu DNI o correo electrónico.' };
    }

    const clients = getRegisteredClients();
    const found = clients.find(
      (c) => c.dni.toLowerCase() === idf || c.email.toLowerCase() === idf
    );

    if (!found) {
      return {
        success: false,
        message: 'No encontramos una cuenta con ese DNI o correo. Por favor crea una cuenta nueva.',
      };
    }

    // Si tiene contraseña registrada, verificarla
    if (found.password && password) {
      if (found.password !== password) {
        return { success: false, message: 'Contraseña incorrecta. Por favor verifica tus datos.' };
      }
    }

    saveActiveClient(found);

    return {
      success: true,
      message: `¡Bienvenido(a) de nuevo, ${found.name.split(' ')[0]}!`,
      client: found,
    };
  } catch (e) {
    console.error('Error en loginClient:', e);
    return { success: false, message: 'Ocurrió un error al iniciar sesión.' };
  }
}

/**
 * Cerrar la sesión del cliente
 */
export function logoutClient(): void {
  try {
    localStorage.removeItem(CLIENT_USER_KEY);
    window.dispatchEvent(new CustomEvent('client-auth-changed', { detail: null }));
  } catch (e) {
    console.error('Error al cerrar sesión:', e);
  }
}
