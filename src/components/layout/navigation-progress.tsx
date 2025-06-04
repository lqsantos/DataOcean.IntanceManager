'use client';

import NextTopLoader from 'nextjs-toploader';
import { useEffect, useState } from 'react';

/**
 * Componente que renderiza uma barra de progresso para navegação usando a cor primária do tema
 */
export function NavigationProgress() {
  // Estado para armazenar a cor computada
  const [primaryColor, setPrimaryColor] = useState('#3B82F6'); // Valor padrão

  // Obter a cor primária do tema aplicado
  useEffect(() => {
    // Função para extrair a cor computada do tema
    const getPrimaryColor = () => {
      // Obter os valores HSL da variável CSS --primary
      const primaryVar = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim();

      // Se a variável foi encontrada, retornar a cor no formato HSL
      if (primaryVar) {
        return `hsl(${primaryVar})`;
      }

      // Caso contrário, retornar a cor padrão
      return '#3B82F6';
    };

    // Definir a cor primária
    setPrimaryColor(getPrimaryColor());

    // Atualizar a cor quando o tema mudar (opcional)
    const observer = new MutationObserver(() => {
      setPrimaryColor(getPrimaryColor());
    });

    // Observar mudanças na classe do html (para detectar mudanças de tema)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <NextTopLoader
      color={primaryColor}
      initialPosition={0.08}
      height={3}
      showSpinner={false}
      shadow={`0 0 10px ${primaryColor},0 0 5px ${primaryColor}`}
    />
  );
}
