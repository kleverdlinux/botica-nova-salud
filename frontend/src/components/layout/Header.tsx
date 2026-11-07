import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header as InspirateHeader } from '@/components/inspirate/Header';
import { useCart, CartState } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { MenuDrawer } from '@/components/inspirate/MenuDrawer';
import { QuotationModal } from '@/components/inspirate/QuotationModal';
import { EarringBuilderModal } from '@/components/inspirate/EarringBuilderModal';
import { BrandModal } from '@/components/inspirate/BrandModal';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const {
    getItemCount,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    isCheckoutOpen,
    openCheckout,
    closeCheckout,
  } = useCart();
  const cartItemCount = getItemCount();
  const wishlistCount = useWishlist((state) => state.items.length);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);

  const handleOpenCatalog = (category?: string) => {
    if (!category || category === 'ALL') {
      navigate('/catalogo');
    } else {
      navigate(`/catalogo?collection=${encodeURIComponent(category.toLowerCase())}`);
    }
  };

  return (
    <>
      <InspirateHeader
        cartCount={cartItemCount}
        favoritesCount={wishlistCount}
        onOpenCart={() => openDrawer()}
        onOpenFavorites={() => setIsWishlistOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenQuotation={() => setIsQuotationOpen(true)}
        onOpenBuilder={() => setIsBuilderOpen(true)}
        onOpenCatalog={handleOpenCatalog}
        onOpenBrand={() => setIsBrandOpen(true)}
      />

      {/* Official Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />

      {/* Slide-over Cart Drawer idéntico en diseño y animación a Wishlist */}
      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onOpenCheckout={openCheckout}
      />

      {/* Modal Vertical Centrado de Checkout sin scroll innecesario */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
      />

      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenQuotation={() => {
          setIsMenuOpen(false);
          setIsQuotationOpen(true);
        }}
        onOpenCatalog={(cat) => {
          setIsMenuOpen(false);
          handleOpenCatalog(cat);
        }}
        onOpenBuilder={() => {
          setIsMenuOpen(false);
          setIsBuilderOpen(true);
        }}
        onOpenBrand={() => {
          setIsMenuOpen(false);
          setIsBrandOpen(true);
        }}
        onOpenQuickOrder={() => {
          setIsMenuOpen(false);
          navigate('/catalogo');
        }}
        onOpenAllArticles={() => {
          setIsMenuOpen(false);
          navigate('/#journal');
        }}
      />

      <QuotationModal
        isOpen={isQuotationOpen}
        onClose={() => setIsQuotationOpen(false)}
      />

      <EarringBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onAddToCart={() => {}}
      />

      <BrandModal
        isOpen={isBrandOpen}
        onClose={() => setIsBrandOpen(false)}
        onOpenQuotation={() => {
          setIsBrandOpen(false);
          setIsQuotationOpen(true);
        }}
      />
    </>
  );
};

export default Header;
