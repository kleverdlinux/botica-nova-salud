import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { useCart } from '@/hooks/useCart';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Checkout = () => {
  const navigate = useNavigate();
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-wide pt-36 pb-28 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
            <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h1 className="font-sans font-bold text-2xl md:text-3xl text-zinc-900 tracking-tight mb-3">
            No hay productos en tu pedido
          </h1>
          <p className="text-zinc-500 mb-6 max-w-md mx-auto text-xs leading-relaxed">
            Añade medicamentos o productos de salud antes de tramitar el despacho a domicilio en Lima.
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-sm px-6 py-3 text-xs font-black uppercase tracking-wider bg-[#18181b] hover:bg-[#0d9488] text-white transition-all shadow-sm cursor-pointer"
          >
            <Link to="/catalogo">
              Explorar Catálogo
              <ArrowRight className="ml-2 w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[75vh] flex items-center justify-center py-8">
        <CheckoutModal
          isOpen={true}
          onClose={() => navigate(-1)}
        />
      </div>
    </Layout>
  );
};

export default Checkout;
