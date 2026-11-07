export interface ConfirmarAccionOptions {
  titulo: string;
  texto?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface ToastOptions {
  timer?: number;
  [key: string]: any;
}

export declare function notificarExito(titulo: string, texto?: string): Promise<any>;
export declare function notificarError(titulo: string, texto?: string): Promise<any>;
export declare function notificarAdvertencia(titulo: string, texto?: string): Promise<any>;
export declare function confirmarAccion(opts: ConfirmarAccionOptions): Promise<boolean>;

export declare const toast: {
  success: (msg: any, opts?: ToastOptions) => Promise<any>;
  error: (msg: any, opts?: ToastOptions) => Promise<any>;
  info: (msg: any, opts?: ToastOptions) => Promise<any>;
  warning: (msg: any, opts?: ToastOptions) => Promise<any>;
  loading: (msg?: string) => Promise<any>;
  dismiss: () => void;
};

export default toast;

