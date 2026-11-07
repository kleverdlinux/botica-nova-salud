import Swal from 'sweetalert2';

let cssLoaded = false;
const ensureCss = () => {
  if (!cssLoaded && typeof document !== 'undefined') {
    cssLoaded = true;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/vendor/sweetalert2.min.css';
    document.head.appendChild(link);
  }
};

// Configuración corporativa Botica Nova Salud (Monocromático Blanco & Negro de Alta Fidelidad)
const ModalSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black shadow-2xl font-sans text-neutral-900 dark:text-white p-6 max-w-md',
    title: 'text-base font-black text-neutral-900 dark:text-white tracking-tight',
    htmlContainer: 'text-xs text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed',
    confirmButton: 'px-5 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer mx-1.5',
    cancelButton: 'px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold transition cursor-pointer mx-1.5',
    actions: 'flex items-center justify-center gap-2 mt-4'
  },
  buttonsStyling: false
});

// Toast flotante moderno de SweetAlert2 (Monocromático Blanco & Negro)
const ToastSwal = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toastEl) => {
    toastEl.onmouseenter = Swal.stopTimer;
    toastEl.onmouseleave = Swal.resumeTimer;
  },
  customClass: {
    popup: 'rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-900 dark:text-white shadow-xl font-sans !px-4 !py-3',
    title: 'text-xs font-bold text-neutral-900 dark:text-white',
    timerProgressBar: 'bg-black dark:bg-white'
  }
});

export const notificarExito = (titulo, texto = '') => {
  ensureCss();
  return ModalSwal.fire({
    icon: 'success',
    title: titulo,
    text: texto,
    timer: 2400,
    showConfirmButton: false,
    iconColor: '#10b981'
  });
};

export const notificarError = (titulo, texto = '') => {
  ensureCss();
  return ModalSwal.fire({
    icon: 'error',
    title: titulo,
    text: texto,
    confirmButtonText: 'Entendido'
  });
};

export const notificarAdvertencia = (titulo, texto = '') => {
  ensureCss();
  return ModalSwal.fire({
    icon: 'warning',
    title: titulo,
    text: texto,
    confirmButtonText: 'Continuar'
  });
};

export const confirmarAccion = async ({ titulo, texto, confirmText = 'Sí, continuar', cancelText = 'Cancelar' }) => {
  ensureCss();
  const result = await ModalSwal.fire({
    title: titulo,
    text: texto,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true
  });
  return result.isConfirmed;
};

// Objeto drop-in para reemplazar react-hot-toast en toda la web
export const toast = {
  success: (msg, opts = {}) => {
    ensureCss();
    return ToastSwal.fire({
      icon: 'success',
      title: typeof msg === 'string' ? msg : 'Operación exitosa',
      ...opts
    });
  },
  error: (msg, opts = {}) => {
    ensureCss();
    return ToastSwal.fire({
      icon: 'error',
      title: typeof msg === 'string' ? msg : 'Ocurrió un error',
      ...opts
    });
  },
  info: (msg, opts = {}) => {
    ensureCss();
    return ToastSwal.fire({
      icon: 'info',
      title: typeof msg === 'string' ? msg : '',
      ...opts
    });
  },
  warning: (msg, opts = {}) => {
    ensureCss();
    return ToastSwal.fire({
      icon: 'warning',
      title: typeof msg === 'string' ? msg : 'Atención',
      ...opts
    });
  },
  loading: (msg = 'Procesando...') => {
    ensureCss();
    return ToastSwal.fire({
      title: msg,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  },
  dismiss: () => {
    Swal.close();
  }
};

export default toast;
