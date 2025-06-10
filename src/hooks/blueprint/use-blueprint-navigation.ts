import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { type SectionId, useSectionValidation } from '@/hooks/blueprint';

/**
 * Opções para o hook useBlueprintNavigation
 */
interface BlueprintNavigationOptions {
  /**
   * Modo do navegador (criar ou editar)
   */
  mode: 'create' | 'edit';

  /**
   * ID do blueprint (apenas para modo de edição)
   */
  blueprintId?: string;

  /**
   * Se deve sincronizar a URL com a seção atual
   */
  syncWithUrl?: boolean;

  /**
   * URL base para a navegação (ex: /blueprints/create)
   */
  baseUrl?: string;
}

/**
 * useBlueprintNavigation - Hook para gerenciar navegação entre seções do blueprint
 *
 * @param initialSection - Seção inicial a ser exibida
 * @param options - Opções adicionais para o hook
 * @returns Objeto com funções e estados para gerenciar navegação
 */
export function useBlueprintNavigation(
  initialSection: SectionId = 'metadata',
  options: BlueprintNavigationOptions
) {
  const router = useRouter();
  const pathname = usePathname();
  const { syncWithUrl = true, baseUrl } = options;

  // Estado para a seção atual
  const [activeSection, setActiveSection] = useState<SectionId>(initialSection);
  // Estado para controlar se a navegação já foi iniciada pelo usuário
  const [hasUserNavigated, setHasUserNavigated] = useState(false);

  // Hook de validação de seções
  const {
    validations,
    canAccessSection,
    updateSectionValidation,
    setSectionCompleted,
    validateSection,
    isSectionComplete,
    getNextAvailableSection,
  } = useSectionValidation();

  // Mapeamento de seções para a URL
  const sectionUrlMap: Record<SectionId, string> = {
    metadata: 'metadata',
    templates: 'templates',
    variables: 'variables',
    defaults: 'defaults',
    preview: 'preview',
  };

  /**
   * Atualiza a URL com base na seção atual
   * (Desativado para usar apenas navegação baseada em estado)
   */
  const updateUrlForSection = useCallback(
    (_section: SectionId) => {
      // Comentado para evitar redirecionamento para URLs separadas
      // if (syncWithUrl && baseUrl && hasUserNavigated) {
      //   const url = `${baseUrl}/${sectionUrlMap[_section]}`;
      //   router.replace(url);
      // }
    },
    [syncWithUrl, baseUrl, router, hasUserNavigated]
  );

  /**
   * Muda para uma nova seção - sempre permite navegação livre
   */
  const navigateToSection = useCallback(
    (section: SectionId) => {
      setHasUserNavigated(true);
      setActiveSection(section);
      updateUrlForSection(section);
    },
    [updateUrlForSection]
  );

  /**
   * Avança para a próxima seção disponível
   */
  const navigateNext = useCallback(() => {
    const nextSection = getNextAvailableSection(activeSection);

    if (nextSection) {
      navigateToSection(nextSection);
    }
  }, [activeSection, getNextAvailableSection, navigateToSection]);

  /**
   * Retorna para a seção anterior - sempre permite navegação livre
   */
  const navigateBack = useCallback(() => {
    const sections: SectionId[] = ['metadata', 'templates', 'variables', 'defaults', 'preview'];
    const currentIndex = sections.indexOf(activeSection);

    if (currentIndex > 0) {
      const previousSection = sections[currentIndex - 1];

      navigateToSection(previousSection);
    }
  }, [activeSection, navigateToSection]);

  /**
   * Sincroniza a seção atual com a URL (se syncWithUrl estiver habilitado)
   * Sempre permite navegação para qualquer seção
   */
  useEffect(() => {
    if (syncWithUrl && pathname && baseUrl) {
      // Extrai a parte da URL após o baseUrl
      const urlPart = pathname.replace(`${baseUrl}/`, '');

      // Encontra a seção correspondente na URL
      const entries = Object.entries(sectionUrlMap) as [SectionId, string][];
      const matchingSection = entries.find(([_, value]) => urlPart === value)?.[0];

      // Se encontrou uma seção na URL e é diferente da atual, atualiza
      // Sem verificar canAccessSection para permitir navegação livre
      if (matchingSection && matchingSection !== activeSection) {
        setActiveSection(matchingSection);
      }
    }
  }, [pathname, baseUrl, syncWithUrl, sectionUrlMap, activeSection]);

  // Atualiza URL na montagem inicial do componente
  useEffect(() => {
    updateUrlForSection(activeSection);
    // Dependência intencional apenas na montagem inicial
  }, []);

  return {
    activeSection,
    validations,
    canAccessSection,
    navigateToSection,
    navigateNext,
    navigateBack,
    updateSectionValidation,
    setSectionCompleted,
    validateSection,
    isSectionComplete,
  };
}
