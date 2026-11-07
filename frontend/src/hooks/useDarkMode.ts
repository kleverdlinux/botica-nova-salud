import { useState, useEffect } from 'react';

export function useDarkMode(): boolean {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      document.documentElement.classList.contains('dark') ||
      localStorage.getItem('novasalud_theme') === 'dark'
    );
  });

  useEffect(() => {
    // 1. Sincronizar estado inicial
    const checkDark = () => {
      const darkActive = document.documentElement.classList.contains('dark');
      setIsDark(darkActive);
    };

    checkDark();

    // 2. Observar mutaciones en la clase del <html>
    const observer = new MutationObserver(() => {
      checkDark();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // 3. Escuchar evento personalizado
    const handleThemeEvent = (e: any) => {
      if (typeof e.detail?.isDark === 'boolean') {
        setIsDark(e.detail.isDark);
      } else {
        checkDark();
      }
    };

    window.addEventListener('novasalud-theme-change', handleThemeEvent);

    return () => {
      observer.disconnect();
      window.removeEventListener('novasalud-theme-change', handleThemeEvent);
    };
  }, []);

  return isDark;
}

