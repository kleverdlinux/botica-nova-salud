import React, { useState } from 'react';

export const CookieBanner: React.FC = () => {
  const [accepted, setAccepted] = useState(() => {
    try {
      return localStorage.getItem('novasalud_cookie_accepted') === 'true';
    } catch {
      return false;
    }
  });

  const handleAccept = () => {
    try {
      localStorage.setItem('novasalud_cookie_accepted', 'true');
    } catch {
      // ignore
    }
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm sm:max-w-md bg-white border border-gray-200/90 shadow-2xl p-4 sm:p-5 flex items-center justify-between gap-4 text-[#222222] animate-fade-in">
      <p className="text-[11px] sm:text-xs text-[#333333] leading-relaxed">
        El sitio web utiliza archivos Cookie. Al continuar navegando, aceptas los términos del{' '}
        <span className="font-bold text-[#111111]">Acuerdo de uso de Cookie-files</span>.
      </p>
      <button
        onClick={handleAccept}
        className="px-5 py-2 bg-[#222222] hover:bg-black text-white text-xs font-black uppercase tracking-wider transition-colors flex-shrink-0 cursor-pointer"
      >
        OK
      </button>
    </div>
  );
};
