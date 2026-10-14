import { useState, useEffect } from 'react';

const CLAVE_STORAGE = 'tablero-tema';

export type Tema = 'claro' | 'oscuro';

export function useTema() {
  const [tema, setTema] = useState<Tema>(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_STORAGE);
      if (guardado === 'claro' || guardado === 'oscuro') return guardado;
    } catch (e) {
      // ignore
    }
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'oscuro';
    }
    return 'claro';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema);
    if (tema === 'oscuro') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Actualizar barra de estado en iPhone Safari (iOS theme-color)
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', tema === 'oscuro' ? '#0b0f17' : '#009de0');
    }

    try {
      localStorage.setItem(CLAVE_STORAGE, tema);
    } catch (e) {
      // ignore
    }
  }, [tema]);

  const toggleTema = () => {
    setTema((prev) => (prev === 'oscuro' ? 'claro' : 'oscuro'));
  };

  return { tema, toggleTema, isOscuro: tema === 'oscuro' };
}
