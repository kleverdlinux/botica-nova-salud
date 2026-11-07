import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/inspirate/Header';
import { Hero } from '@/components/inspirate/Hero';
import { ReadyLineBanner } from '@/components/inspirate/ReadyLineBanner';
import { HitsShowcase } from '@/components/inspirate/HitsShowcase';
import { BuilderSection } from '@/components/inspirate/BuilderSection';
import { NatureCollection } from '@/components/inspirate/NatureCollection';
import { BrandStory } from '@/components/inspirate/BrandStory';
import { ReviewsSlider } from '@/components/inspirate/ReviewsSlider';
import { JournalSection } from '@/components/inspirate/JournalSection';
import { ConsultationForm } from '@/components/inspirate/ConsultationForm';
import Footer from '@/components/layout/Footer';
import { CookieBanner } from '@/components/inspirate/CookieBanner';

// Lazy loading inteligente de modales y drawers para reducir bundle inicial
const MenuDrawer = React.lazy(() => import('@/components/inspirate/MenuDrawer').then(m => ({ default: m.MenuDrawer })));
const WishlistDrawer = React.lazy(() => import('@/components/WishlistDrawer').then(m => ({ default: m.WishlistDrawer })));
const CartDrawer = React.lazy(() => import('@/components/CartDrawer').then(m => ({ default: m.CartDrawer })));
const CheckoutModal = React.lazy(() => import('@/components/checkout/CheckoutModal').then(m => ({ default: m.CheckoutModal })));
const QuotationModal = React.lazy(() => import('@/components/inspirate/QuotationModal').then(m => ({ default: m.QuotationModal })));
const ServicesModal = React.lazy(() => import('@/components/inspirate/ServicesModal').then(m => ({ default: m.ServicesModal })));
const ReclamacionesModal = React.lazy(() => import('@/components/inspirate/ReclamacionesModal').then(m => ({ default: m.ReclamacionesModal })));
const ArticleModal = React.lazy(() => import('@/components/inspirate/ArticleModal').then(m => ({ default: m.ArticleModal })));
const BrandModal = React.lazy(() => import('@/components/inspirate/BrandModal').then(m => ({ default: m.BrandModal })));
const ProductDetailModal = React.lazy(() => import('@/components/ProductDetailModal').then(m => ({ default: m.ProductDetailModal })));
import { ARTICLES } from '@/data/inspirateData';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from '../utils/alertaSweet.js';

export default function Inicio() {
  const navigate = useNavigate();
  const location = useLocation();

  // Official Persistent Cart & Wishlist Stores
  const {
    getItemCount,
    addItem: addItemToCart,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    isCheckoutOpen,
    openCheckout,
    closeCheckout,
  } = useCart();
  const cartItemCount = getItemCount();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  // Modal / Drawer States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [defaultServiceId, setDefaultServiceId] = useState('presion');
  const [isReclamacionesOpen, setIsReclamacionesOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [brandDefaultTab, setBrandDefaultTab] = useState('historia');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedProductModal, setSelectedProductModal] = useState(null);

  // Asegurar que la página principal de la tienda web sea siempre en modo claro
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Deep-linking from URLs or state
  useEffect(() => {
    if (location.state?.openReclamaciones || location.hash === '#reclamaciones') {
      setIsReclamacionesOpen(true);
    }
    if (location.state?.openServices || location.hash === '#servicios') {
      if (location.state?.serviceId) setDefaultServiceId(location.state.serviceId);
      setIsServicesOpen(true);
    }
    if (location.state?.openLocation || location.hash === '#ubicacion' || location.hash === '#mapa') {
      setBrandDefaultTab('mapa');
      setIsBrandOpen(true);
    }
  }, [location]);

  // Global listeners for footer & navigation modal triggers
  useEffect(() => {
    const handleOpenReclamaciones = () => setIsReclamacionesOpen(true);
    const handleOpenServices = (e) => {
      if (e.detail?.serviceId) setDefaultServiceId(e.detail.serviceId);
      setIsServicesOpen(true);
    };
    const handleOpenLocation = () => {
      setBrandDefaultTab('mapa');
      setIsBrandOpen(true);
    };
    const handleOpenBrand = (e) => {
      setBrandDefaultTab(e.detail?.tab || 'historia');
      setIsBrandOpen(true);
    };

    window.addEventListener('open-reclamaciones', handleOpenReclamaciones);
    window.addEventListener('open-services', handleOpenServices);
    window.addEventListener('open-location', handleOpenLocation);
    window.addEventListener('open-brand', handleOpenBrand);

    return () => {
      window.removeEventListener('open-reclamaciones', handleOpenReclamaciones);
      window.removeEventListener('open-services', handleOpenServices);
      window.removeEventListener('open-location', handleOpenLocation);
      window.removeEventListener('open-brand', handleOpenBrand);
    };
  }, []);

  // Toggle wishlist for products (carga diferida de catálogo completo)
  const handleToggleFavorite = async (slugOrId) => {
    const { products } = await import('@/data/products');
    const prod = products.find((p) => p.slug === slugOrId || p.id === slugOrId);
    if (prod) {
      if (isInWishlist(prod.id)) {
        removeFromWishlist(prod.id);
        toast.success(`${prod.name} retirado de tus favoritos`);
      } else {
        addToWishlist(prod);
        toast.success(`${prod.name} guardado en tus favoritos`);
      }
    }
  };

  // Open product detail in modal
  const handleOpenProductModal = async (slugOrId) => {
    const { products } = await import('@/data/products');
    const prod = products.find((p) => p.slug === slugOrId || p.id === slugOrId);
    if (prod) {
      setSelectedProductModal(prod);
    } else {
      navigate('/product/' + slugOrId);
    }
  };

  // Open Catalog with category -> Navigate directly to /catalogo
  const handleOpenCatalog = (category) => {
    if (!category || category === 'ALL' || category === 'NATURE') {
      navigate('/catalogo');
    } else {
      navigate(`/catalogo?collection=${encodeURIComponent(category.toLowerCase())}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-[#222222] font-sans antialiased overflow-x-hidden selection:bg-[#0d9488] selection:text-white">
      {/* 1. Header con Menús Desplegables al Pasar el Cursor y Acciones Oficiales */}
      <Header
        cartCount={cartItemCount}
        favoritesCount={wishlistItems.length}
        onOpenCart={() => openDrawer()}
        onOpenFavorites={() => setIsWishlistOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenQuotation={() => setIsQuotationOpen(true)}
        onOpenBuilder={() => {
          setDefaultServiceId('presion');
          setIsServicesOpen(true);
        }}
        onOpenCatalog={handleOpenCatalog}
        onOpenBrand={() => {
          setBrandDefaultTab('historia');
          setIsBrandOpen(true);
        }}
      />

      <main>
        {/* Hero Section */}
        <Hero
          onOpenProductModal={handleOpenProductModal}
          onOpenQuotation={() => setIsQuotationOpen(true)}
          onOpenCatalog={() => handleOpenCatalog('ALL')}
          onOpenBrand={() => {
            setBrandDefaultTab('historia');
            setIsBrandOpen(true);
          }}
        />

        {/* 2. Ready Line Banner + Interactive Category Switcher */}
        <ReadyLineBanner onSelectCategory={handleOpenCatalog} />

        {/* 3. Most Chosen Pieces with Hotspots linking directly to product pages */}
        <HitsShowcase
          onOpenProductModal={handleOpenProductModal}
          favorites={wishlistItems.map((item) => item.id)}
          onToggleFavorite={handleToggleFavorite}
          onOpenCatalog={() => handleOpenCatalog('ALL')}
        />

        {/* 4. Custom Builder / Servicios Section */}
        <BuilderSection
          onOpenBuilder={() => {
            setDefaultServiceId('presion');
            setIsServicesOpen(true);
          }}
        />

        {/* 5. Capsule Collection */}
        <NatureCollection onExploreNature={() => handleOpenCatalog('bienestar-suplementos')} />

        {/* 6. Brand Story Section */}
        <BrandStory
          onOpenBrand={() => {
            setBrandDefaultTab('historia');
            setIsBrandOpen(true);
          }}
        />

        {/* 7. Verified Customer Reviews Carousel */}
        <ReviewsSlider />

        {/* 8. Journal / Editorial Staggered Layout */}
        <JournalSection onSelectArticle={(art) => setSelectedArticle(art)} />

        {/* 9. Personal Consultation Form */}
        <ConsultationForm />
      </main>

      {/* 10. Footer Oficial Botica Nova Salud (Halftone Wordmark) */}
      <Footer />

      {/* Fullscreen Navigation Drawer */}
      {isMenuOpen && (
        <React.Suspense fallback={null}>
          <MenuDrawer
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onOpenQuotation={() => setIsQuotationOpen(true)}
            onOpenCatalog={handleOpenCatalog}
            onOpenBuilder={() => {
              setDefaultServiceId('presion');
              setIsServicesOpen(true);
            }}
            onOpenBrand={() => {
              setBrandDefaultTab('historia');
              setIsBrandOpen(true);
            }}
            onOpenQuickOrder={() => navigate('/catalogo')}
            onOpenAllArticles={() => setSelectedArticle(ARTICLES[0])}
          />
        </React.Suspense>
      )}

      {/* Official Wishlist / Favorites Drawer */}
      {isWishlistOpen && (
        <React.Suspense fallback={null}>
          <WishlistDrawer
            isOpen={isWishlistOpen}
            onClose={() => setIsWishlistOpen(false)}
          />
        </React.Suspense>
      )}

      {/* Slide-over Cart Drawer idéntico en diseño y animación a Wishlist */}
      {isDrawerOpen && (
        <React.Suspense fallback={null}>
          <CartDrawer
            isOpen={isDrawerOpen}
            onClose={closeDrawer}
            onOpenCheckout={openCheckout}
          />
        </React.Suspense>
      )}

      {/* Modal Vertical Centrado de Checkout sin scroll innecesario */}
      {isCheckoutOpen && (
        <React.Suspense fallback={null}>
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={closeCheckout}
          />
        </React.Suspense>
      )}

      {/* Interactive Quotation Modal */}
      {isQuotationOpen && (
        <React.Suspense fallback={null}>
          <QuotationModal
            isOpen={isQuotationOpen}
            onClose={() => setIsQuotationOpen(false)}
          />
        </React.Suspense>
      )}

      {/* Official Clinical & Pharmaceutical Services Modal */}
      {isServicesOpen && (
        <React.Suspense fallback={null}>
          <ServicesModal
            isOpen={isServicesOpen}
            onClose={() => setIsServicesOpen(false)}
            defaultServiceId={defaultServiceId}
          />
        </React.Suspense>
      )}

      {/* Official INDECOPI Libro de Reclamaciones Virtual Modal */}
      {isReclamacionesOpen && (
        <React.Suspense fallback={null}>
          <ReclamacionesModal
            isOpen={isReclamacionesOpen}
            onClose={() => setIsReclamacionesOpen(false)}
          />
        </React.Suspense>
      )}

      {/* Article Reader Modal */}
      {selectedArticle && (
        <React.Suspense fallback={null}>
          <ArticleModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
            onSelectArticle={(art) => setSelectedArticle(art)}
          />
        </React.Suspense>
      )}

      {/* Brand History & Location Map Modal */}
      {isBrandOpen && (
        <React.Suspense fallback={null}>
          <BrandModal
            isOpen={isBrandOpen}
            onClose={() => setIsBrandOpen(false)}
            onOpenQuotation={() => setIsQuotationOpen(true)}
            defaultTab={brandDefaultTab}
          />
        </React.Suspense>
      )}

      {/* Interactive Product Detail Modal */}
      {selectedProductModal && (
        <React.Suspense fallback={null}>
          <ProductDetailModal
            product={selectedProductModal}
            isOpen={Boolean(selectedProductModal)}
            onClose={() => setSelectedProductModal(null)}
          />
        </React.Suspense>
      )}

      {/* Cookie Consent Floating Banner */}
      <CookieBanner />
    </div>
  );
}
