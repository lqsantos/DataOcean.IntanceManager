'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type FontScaleContextType = {
  fontScale: number;
  setFontScale: (scale: number) => void;
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
  resetFontScale: () => void;
};

const FontScaleContext = createContext<FontScaleContextType | undefined>(undefined);

const MIN_SCALE = 0.8;
const MAX_SCALE = 1.2;
const SCALE_STEP = 0.05;
const DEFAULT_SCALE = 1;

export function FontScaleProvider({ children }: { children: React.ReactNode }) {
  // Inicializar com o valor salvo no localStorage ou o valor padrão
  const [fontScale, setFontScale] = useState<number>(DEFAULT_SCALE);

  useEffect(() => {
    // Carregar a escala salva no localStorage quando disponível
    const savedScale = localStorage.getItem('fontScale');

    if (savedScale) {
      setFontScale(parseFloat(savedScale));
    }
  }, []);

  useEffect(() => {
    // Aplicar o valor da escala ao elemento HTML
    document.documentElement.style.setProperty('--font-scale', fontScale.toString());

    // Salvar configuração no localStorage
    localStorage.setItem('fontScale', fontScale.toString());
  }, [fontScale]);

  const setFontScaleValue = (value: number) => {
    // Garantir que o valor esteja dentro dos limites
    const clampedValue = Math.max(MIN_SCALE, Math.min(MAX_SCALE, value));

    setFontScale(clampedValue);
  };

  const increaseFontScale = () => {
    setFontScale((prev) => Math.min(prev + SCALE_STEP, MAX_SCALE));
  };

  const decreaseFontScale = () => {
    setFontScale((prev) => Math.max(prev - SCALE_STEP, MIN_SCALE));
  };

  const resetFontScale = () => {
    setFontScale(DEFAULT_SCALE);
  };

  return (
    <FontScaleContext.Provider
      value={{
        fontScale,
        setFontScale: setFontScaleValue,
        increaseFontScale,
        decreaseFontScale,
        resetFontScale,
      }}
    >
      {children}
    </FontScaleContext.Provider>
  );
}

export function useFontScale() {
  const context = useContext(FontScaleContext);

  if (context === undefined) {
    throw new Error('useFontScale must be used within a FontScaleProvider');
  }

  return context;
}
