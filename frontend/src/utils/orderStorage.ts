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
  isNewAccount?: boolean;
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
  avatar?: string;
  password?: string;
  fichaSalud?: any;
  botiquin?: any[];
  puntos?: number;
  createdAt?: number;
  isNewAccount?: boolean;
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
            (o.customer?.ruc && o.customer.ruc.trim().toLowerCase() === idf)
        );
      } else {
        const dni = clientIdentifier.dni?.trim().toLowerCase();
        const email = clientIdentifier.email?.trim().toLowerCase();
        const id = clientIdentifier.id?.trim().toLowerCase();

        return orders.filter((o) => {
          if (!o.customer) return false;
          const cDni = o.customer.dni?.trim().toLowerCase() || '';
          const cEmail = o.customer.email?.trim().toLowerCase() || '';
          const cRuc = o.customer.ruc?.trim().toLowerCase() || '';

          if (dni && (cDni === dni || cRuc === dni)) return true;
          if (email && cEmail === email) return true;
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

export function getApiBaseUrl(): string {
  if ((import.meta as any).env?.VITE_API_URL) return (import.meta as any).env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1') && !hostname.startsWith('192.168.') && !hostname.startsWith('10.')) {
      return '/api';
    }
    if (hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
      return `http://${hostname}:4000/api`;
    }
  }
  return 'http://localhost:4000/api';
}

/**
 * Sincroniza el pedido web con la base de datos backend de Botica Nova Salud
 * Registra la venta atómica, descuenta stock del inventario y alimenta las métricas del panel Admin
 */
export async function syncOrderToBackend(order: CustomerOrder) {
  try {
    const API_BASE = getApiBaseUrl();
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
        ordenCompleta: order,
      }),
    });
  } catch (err) {
    console.warn('Backend sync warning (continuando en modo offline):', err);
  }
}

/**
 * Consulta y sincroniza los pedidos del cliente desde la base de datos PostgreSQL
 * fusionándolos con el almacenamiento local para que estén disponibles en cualquier dispositivo
 */
export async function fetchCustomerOrdersFromServer(
  clientIdentifier?: string | { dni?: string; email?: string }
): Promise<CustomerOrder[]> {
  const dni = typeof clientIdentifier === 'string'
    ? clientIdentifier.trim()
    : (clientIdentifier?.dni || '').trim();

  if (!dni) return getCustomerOrders(clientIdentifier);

  try {
    const API_BASE = getApiBaseUrl();
    const res = await fetch(`${API_BASE}/catalogo/cliente/pedidos/${dni}`);
    if (res.ok) {
      const json = await res.json();
      if (json.ok && Array.isArray(json.pedidos)) {
        const serverOrders: CustomerOrder[] = json.pedidos;

        // Actualizar el almacenamiento local con las órdenes oficiales de PostgreSQL
        const localOrders = getCustomerOrders();
        // Preservar órdenes de otros clientes pero limpiar duplicados o fantasmas sin DNI
        const otherOrders = localOrders.filter(
          (o) => o?.customer?.dni && o.customer.dni.trim() !== dni
        );
        const updatedLocal = [...serverOrders, ...otherOrders];
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(updatedLocal));

        // Retornar exactamente las órdenes de PostgreSQL para sincronización perfecta entre móvil y laptop
        return serverOrders;
      }
    }
  } catch (err) {
    console.warn('Error al sincronizar pedidos desde el servidor central:', err);
  }

  return getCustomerOrders(clientIdentifier);
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

    // Normalizar distrito de Juliaca si viene de la configuración anterior en Lima
    if (!client.district || client.district.toLowerCase().includes('breña') || client.district.toLowerCase().includes('lima')) {
      client.district = 'Juliaca Cercado';
    }

    return client;
  } catch {
    return null;
  }
}

/**
 * Guarda el cliente con sesión activa (en localStorage y sincroniza con PostgreSQL)
 */
export function saveActiveClient(client: ClientProfile): void {
  try {
    const existing = getActiveClient();
    const finalClient: ClientProfile = {
      ...existing,
      ...client,
      avatar: client.avatar !== undefined ? client.avatar : (existing?.avatar || null),
      fichaSalud: client.fichaSalud !== undefined ? client.fichaSalud : (existing?.fichaSalud || undefined),
      botiquin: client.botiquin !== undefined ? client.botiquin : (existing?.botiquin || undefined),
      puntos: client.puntos !== undefined ? client.puntos : (existing?.puntos || undefined),
      password: client.password || (existing?.dni === client.dni ? existing?.password : undefined)
    };

    localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(finalClient));

    // Asegurar que también esté guardado en la lista de clientes registrados localmente
    const clients = getRegisteredClients();
    const index = clients.findIndex((c) => c.dni === finalClient.dni || c.email === finalClient.email);
    if (index >= 0) {
      clients[index] = { ...clients[index], ...finalClient };
    } else {
      clients.push(finalClient);
    }
    localStorage.setItem(CLIENTS_DB_KEY, JSON.stringify(clients));

    window.dispatchEvent(new CustomEvent('client-auth-changed', { detail: finalClient }));

    // Sincronizar en segundo plano con PostgreSQL SIN tocar contraseña
    const API_BASE = getApiBaseUrl();
    fetch(`${API_BASE}/catalogo/cliente/perfil`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dni: finalClient.dni,
        nombre: finalClient.name,
        email: finalClient.email,
        telefono: finalClient.phone,
        direccion: finalClient.address,
        distrito: finalClient.district,
        fichaMedica: {
          ...(finalClient.fichaSalud || {}),
          avatar: finalClient.avatar || undefined,
        }
      })
    }).catch(() => {});
  } catch (e) {
    console.error('Error guardando cliente:', e);
  }
}

/**
 * Actualiza el perfil de cliente (nombre, teléfono, correo, dirección, distrito, avatar, contraseña)
 * sincronizando de forma segura tanto en PostgreSQL como en localStorage.
 */
export async function updateClientProfile(data: {
  dni: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  district?: string;
  reference?: string;
  avatar?: string;
  password?: string;
  fichaSalud?: any;
  botiquin?: any[];
}): Promise<{ success: boolean; message: string; client?: ClientProfile }> {
  try {
    const cleanDni = data.dni.trim();
    const current = getActiveClient() || {
      id: cleanDni,
      dni: cleanDni,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      district: data.district || 'Juliaca Cercado',
    };

    const updatedClient: ClientProfile = {
      ...current,
      name: data.name !== undefined ? data.name.trim() : current.name,
      email: data.email !== undefined ? data.email.trim() : current.email,
      phone: data.phone !== undefined ? data.phone.trim() : current.phone,
      address: data.address !== undefined ? data.address.trim() : current.address,
      district: data.district !== undefined ? data.district.trim() : current.district,
      reference: data.reference !== undefined ? data.reference.trim() : current.reference,
      avatar: data.avatar !== undefined ? data.avatar : current.avatar,
      fichaSalud: data.fichaSalud !== undefined ? data.fichaSalud : current.fichaSalud,
      botiquin: data.botiquin !== undefined ? data.botiquin : current.botiquin,
    };
    if (data.password) {
      updatedClient.password = data.password;
    }

    saveActiveClient(updatedClient);

    // Actualizar en el backend de PostgreSQL
    const API_BASE = getApiBaseUrl();
    try {
      const res = await fetch(`${API_BASE}/catalogo/cliente/perfil`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni: cleanDni,
          nombre: updatedClient.name,
          email: updatedClient.email,
          telefono: updatedClient.phone,
          direccion: updatedClient.address,
          distrito: updatedClient.district,
          botiquin: updatedClient.botiquin,
          password: data.password || undefined,
          fichaMedica: {
            ...(updatedClient.fichaSalud || {}),
            avatar: updatedClient.avatar || undefined,
          }
        })
      });
      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: json.error || json.mensaje || 'Error al actualizar perfil en el servidor central.',
          client: updatedClient,
        };
      }
      if (json.client) {
        const merged = { ...updatedClient, ...json.client, avatar: updatedClient.avatar || json.client.avatar };
        saveActiveClient(merged);
        return {
          success: true,
          message: json.mensaje || 'Perfil actualizado exitosamente en todos tus dispositivos.',
          client: merged,
        };
      }
    } catch (networkErr) {
      console.warn('Servidor central no disponible, perfil actualizado en este dispositivo:', networkErr);
    }

    return {
      success: true,
      message: 'Perfil actualizado exitosamente en este dispositivo.',
      client: updatedClient,
    };
  } catch (err: any) {
    console.error('Error en updateClientProfile:', err);
    return { success: false, message: err.message || 'Error al actualizar el perfil.' };
  }
}

/**
 * Registrar un nuevo cliente en la base de datos central de PostgreSQL
 * Funciona de inmediato en cualquier dispositivo (celular, laptop, tablet)
 */
export async function registerClient(data: {
  name: string;
  dni: string;
  email: string;
  phone: string;
  address: string;
  district?: string;
  password?: string;
  esAutoRegistro?: boolean;
}): Promise<{ success: boolean; message: string; client?: ClientProfile; isNewAccount?: boolean }> {
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

    // 1. Intentar registrar en la Base de Datos central de PostgreSQL
    const API_BASE = getApiBaseUrl();
    try {
      const res = await fetch(`${API_BASE}/catalogo/cliente/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni: cleanDni,
          nombre: cleanName,
          email: cleanEmail,
          telefono: data.phone?.trim() || '',
          direccion: data.address?.trim() || 'Juliaca',
          distrito: data.district?.trim() || 'Juliaca Cercado',
          password: data.password || cleanDni,
          esAutoRegistro: Boolean(data.esAutoRegistro)
        })
      });

      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: json.error || json.mensaje || 'Error al registrar cliente en el servidor.'
        };
      }

      if (json.client) {
        const isNew = Boolean(json.isNewAccount ?? json.client.isNewAccount);
        const existingActive = getActiveClient();
        const clientToSave: ClientProfile = {
          ...json.client,
          isNewAccount: isNew,
          password: (!isNew && existingActive && existingActive.dni === json.client.dni && existingActive.password)
            ? existingActive.password
            : (json.client.password || undefined)
        };
        saveActiveClient(clientToSave);
        return {
          success: true,
          message: json.mensaje || `¡Bienvenido(a), ${cleanName}! Tu cuenta ha sido creada exitosamente.`,
          client: clientToSave,
          isNewAccount: isNew
        };
      }
    } catch (networkErr) {
      console.warn('Servidor central no disponible, aplicando fallback local:', networkErr);
    }

    // 2. Fallback de contingencia local
    const clients = getRegisteredClients();
    const existing = clients.find((c) => c.dni === cleanDni || c.email.toLowerCase() === cleanEmail);
    if (existing) {
      if (data.esAutoRegistro) {
        existing.phone = data.phone?.trim() || existing.phone;
        existing.address = data.address?.trim() || existing.address;
        existing.district = data.district?.trim() || existing.district;
        existing.isNewAccount = false;
        localStorage.setItem(CLIENTS_DB_KEY, JSON.stringify(clients));
        saveActiveClient(existing);
        return {
          success: true,
          message: `Datos sincronizados para ${existing.name}.`,
          client: existing,
          isNewAccount: false,
        };
      }
      return {
        success: false,
        message: 'Ya existe una cuenta registrada con este DNI. Por favor inicia sesión.',
      };
    }

    const newClient: ClientProfile = {
      id: cleanDni,
      dni: cleanDni,
      name: cleanName,
      email: cleanEmail,
      phone: data.phone.trim(),
      address: data.address.trim(),
      district: data.district?.trim() || 'Juliaca Cercado',
      password: data.password || '',
      createdAt: Date.now(),
      isNewAccount: true,
    };

    clients.push(newClient);
    localStorage.setItem(CLIENTS_DB_KEY, JSON.stringify(clients));
    saveActiveClient(newClient);

    return {
      success: true,
      message: `¡Bienvenido(a), ${cleanName}! Tu cuenta ha sido creada exitosamente.`,
      client: newClient,
      isNewAccount: true,
    };
  } catch (e: any) {
    console.error('Error en registerClient:', e);
    return { success: false, message: e.message || 'Ocurrió un error al registrar la cuenta.' };
  }
}

/**
 * Iniciar sesión de cliente consultando la base de datos central de PostgreSQL
 * Si la cuenta se creó en un celular, podrá ingresar en una laptop sin problema
 */
export async function loginClient(
  identifier: string,
  password?: string
): Promise<{ success: boolean; message: string; client?: ClientProfile }> {
  try {
    const idf = identifier.trim().toLowerCase();
    if (!idf) {
      return { success: false, message: 'Ingresa tu DNI o correo electrónico.' };
    }

    // 1. Consultar primero en la base de datos central del servidor
    const API_BASE = getApiBaseUrl();
    try {
      const res = await fetch(`${API_BASE}/catalogo/cliente/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: idf,
          password: password || ''
        })
      });

      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: json.error || json.mensaje || 'Credenciales incorrectas.'
        };
      }

      if (json.client) {
        saveActiveClient(json.client);
        // Sincronizar inmediatamente todas las compras desde PostgreSQL en este nuevo dispositivo
        fetchCustomerOrdersFromServer(json.client).catch(() => {});
        return {
          success: true,
          message: json.mensaje || `¡Bienvenido(a) de nuevo, ${json.client.name.split(' ')[0]}!`,
          client: json.client
        };
      }
    } catch (networkErr) {
      console.warn('Servidor central no disponible, buscando en memoria local:', networkErr);
    }

    // 2. Fallback de contingencia en almacenamiento local
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
  } catch (e: any) {
    console.error('Error en loginClient:', e);
    return { success: false, message: e.message || 'Ocurrió un error al iniciar sesión.' };
  }
}

/**
 * Cerrar la sesión del cliente y purgar completamente la memoria local del navegador
 */
export function logoutClient(): void {
  try {
    localStorage.removeItem(CLIENT_USER_KEY);
    localStorage.removeItem('wishlist-storage');
    localStorage.removeItem('maison-cart');

    window.dispatchEvent(new CustomEvent('client-auth-changed', { detail: null }));
    window.dispatchEvent(new CustomEvent('client-logout'));
  } catch (e) {
    console.error('Error al cerrar sesión:', e);
  }
}
