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
