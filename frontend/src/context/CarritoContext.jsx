import React, { createContext, useContext, useState, useMemo } from 'react';
import toast from 'react-hot-toast';

const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  const [items, setItems] = useState([]);

  // Agregar producto o incrementar cantidad
  const agregarProducto = (producto) => {
    if (!producto || producto.stock <= 0) {
      toast.error(`"${producto.nombre}" está agotado y no puede agregarse.`);
      return;
    }

    setItems((actuales) => {
      const index = actuales.findIndex((i) => i.productoId === producto.id);
      
      if (index !== -1) {
        const itemExistente = actuales[index];
        if (itemExistente.cantidad >= producto.stock) {
          toast.error(`Stock máximo alcanzado (${producto.stock} unidades) para "${producto.nombre}".`);
          return actuales;
        }

        const copia = [...actuales];
        copia[index] = {
          ...itemExistente,
          cantidad: itemExistente.cantidad + 1
        };
        toast.success(`Se añadió otra unidad de "${producto.nombre}"`);
        return copia;
      }

      toast.success(`"${producto.nombre}" añadido al carrito`);
      return [
        ...actuales,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          presentacion: producto.presentacion,
          precio: Number(producto.precio),
          stock: Number(producto.stock),
          cantidad: 1
        }
      ];
    });
  };

  // Modificar cantidad directamente (+ o -)
  const actualizarCantidad = (productoId, nuevaCantidad) => {
    const cant = parseInt(nuevaCantidad, 10);
    
    setItems((actuales) => {
      return actuales.map((item) => {
        if (item.productoId === productoId) {
          if (cant <= 0) return null; // Eliminar si es 0
          if (cant > item.stock) {
            toast.error(`Solo hay ${item.stock} unidades disponibles en inventario.`);
            return { ...item, cantidad: item.stock };
          }
          return { ...item, cantidad: cant };
        }
        return item;
      }).filter(Boolean);
    });
  };

  // Quitar ítem completo
  const eliminarProducto = (productoId) => {
    setItems((actuales) => actuales.filter((i) => i.productoId !== productoId));
    toast('Producto removido del carrito', { icon: '🗑️' });
  };

  // Limpiar carrito completo
  const limpiarCarrito = () => {
    setItems([]);
  };

  // Cálculo en memoria únicamente para la interfaz (el total legal lo calcula el backend)
  const totalCalculadoUI = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }, [items]);

  const cantidadTotalUI = useMemo(() => {
    return items.reduce((acc, item) => acc + item.cantidad, 0);
  }, [items]);

  return (
    <CarritoContext.Provider
      value={{
        items,
        agregarProducto,
        actualizarCantidad,
        eliminarProducto,
        limpiarCarrito,
        totalCalculadoUI,
        cantidadTotalUI
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe ser usado dentro de un CarritoProvider');
  }
  return context;
}
