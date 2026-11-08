import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/data/products';
import { getActiveClient, getApiBaseUrl } from '@/utils/orderStorage';

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  setItems: (items: Product[]) => void;
  syncWithServer: (dni?: string) => Promise<void>;
}

async function persistBotiquinToServer(dni: string, items: Product[]) {
  try {
    const API_BASE = getApiBaseUrl();
    await fetch(`${API_BASE}/catalogo/cliente/botiquin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dni,
        botiquin: items
      })
    });
  } catch (err) {
    console.warn('Advertencia al sincronizar botiquín en la nube:', err);
  }
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const { items } = get();
        if (!items.find((item) => item.id === product.id)) {
          const nextItems = [...items, product];
          set({ items: nextItems });

          const client = getActiveClient();
          if (client && client.dni) {
            persistBotiquinToServer(client.dni, nextItems);
          }
        }
      },
      removeItem: (productId) => {
        const nextItems = get().items.filter((item) => item.id !== productId);
        set({ items: nextItems });

        const client = getActiveClient();
        if (client && client.dni) {
          persistBotiquinToServer(client.dni, nextItems);
        }
      },
      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
      clearWishlist: () => {
        set({ items: [] });
        const client = getActiveClient();
        if (client && client.dni) {
          persistBotiquinToServer(client.dni, []);
        }
      },
      setItems: (items) => {
        set({ items: Array.isArray(items) ? items : [] });
      },
      syncWithServer: async (dni) => {
        const targetDni = dni || getActiveClient()?.dni;
        if (!targetDni) return;

        try {
          const API_BASE = getApiBaseUrl();
          const res = await fetch(`${API_BASE}/catalogo/cliente/botiquin/${targetDni}`);
          if (res.ok) {
            const data = await res.json();
            if (data.ok && Array.isArray(data.botiquin)) {
              // Fusionar ítems locales con los del servidor
              const current = get().items;
              const map = new Map<string, Product>();
              data.botiquin.forEach((it: Product) => {
                if (it && it.id) map.set(it.id, it);
              });
              current.forEach((it: Product) => {
                if (it && it.id && !map.has(it.id)) map.set(it.id, it);
              });
              const merged = Array.from(map.values());
              set({ items: merged });

              // Si había items locales no guardados en el servidor, sincronizarlos
              if (merged.length !== data.botiquin.length) {
                persistBotiquinToServer(targetDni, merged);
              }
            }
          }
        } catch (err) {
          console.warn('Error al obtener botiquín del servidor central:', err);
        }
      }
    }),
    {
      name: 'wishlist-storage',
    }
  )
);

// Escuchar cambios de autenticación para sincronizar de inmediato
if (typeof window !== 'undefined') {
  window.addEventListener('client-auth-changed', (e: any) => {
    const client = e.detail;
    if (client && client.dni) {
      if (Array.isArray(client.botiquin) && client.botiquin.length > 0) {
        useWishlist.getState().setItems(client.botiquin);
      }
      useWishlist.getState().syncWithServer(client.dni);
    }
  });

  // Sincronización inicial si ya había sesión activa guardada
  setTimeout(() => {
    const active = getActiveClient();
    if (active && active.dni) {
      useWishlist.getState().syncWithServer(active.dni);
    }
  }, 100);
}
