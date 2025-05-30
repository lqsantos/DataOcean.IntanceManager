/**
 * Configuração centralizada para navegação e metadados de páginas
 * Uma abordagem dinâmica e manutenível para gerenciar títulos, descrições e outras propriedades de página
 * Com suporte a múltiplos idiomas usando chaves de tradução
 */

export interface PageMetadata {
  titleKey: string; // Chave de tradução para o título
  descriptionKey?: string; // Chave de tradução para a descrição
  icon?: string;
  namespace?: string; // Namespace da tradução (opcional)
}

// Define a estrutura dos metadados de navegação
export interface RouteConfig {
  path: string;
  metadata: PageMetadata;
  // Opcional: subpáginas específicas
  children?: RouteConfig[];
}

// Configuração centralizada das rotas e seus metadados com chaves de tradução
export const routesConfig: RouteConfig[] = [
  {
    path: '/',
    metadata: {
      titleKey: 'dashboard.title',
      descriptionKey: 'dashboard.description',
      namespace: 'common'
    },
  },
  {
    path: '/instances',
    metadata: {
      titleKey: 'instances.title',
      descriptionKey: 'instances.description',
      namespace: 'common'
    },
  },
  {
    path: '/clusters',
    metadata: {
      titleKey: 'clusters.title',
      descriptionKey: 'clusters.description',
      namespace: 'common'
    },
  },
  {
    path: '/git-sources',
    metadata: {
      titleKey: 'gitSources.title',
      descriptionKey: 'gitSources.description',
      namespace: 'common'
    },
  },
  {
    path: '/resources',
    metadata: {
      titleKey: 'resources.title',
      descriptionKey: 'resources.description',
      namespace: 'common'
    },
    children: [
      {
        path: '/resources/templates',
        metadata: {
          titleKey: 'resources.title', // Mantém o título pai
          descriptionKey: 'resources.templates.description',
          namespace: 'common'
        },
      },
      {
        path: '/resources/blueprints',
        metadata: {
          titleKey: 'resources.title', // Mantém o título pai
          descriptionKey: 'resources.blueprints.description',
          namespace: 'common'
        },
      },
    ],
  },
  {
    path: '/settings',
    metadata: {
      titleKey: 'settings.title',
      descriptionKey: 'settings.description',
      namespace: 'common'
    },
  },
];

/**
 * Encontra os metadados correspondentes para uma rota específica
 */
export function getRouteMetadata(path: string): PageMetadata {
  // Default fallback
  const defaultMetadata: PageMetadata = {
    titleKey: 'app.title',
    namespace: 'common'
  };

  // Se o caminho é exatamente igual ao root ou página em branco
  if (path === '' || path === '/') {
    const rootConfig = routesConfig.find((route) => route.path === '/');

    return rootConfig?.metadata || defaultMetadata;
  }

  // Verifica correspondência exata primeiro
  for (const route of routesConfig) {
    if (route.path === path) {
      return route.metadata;
    }

    // Verifica nas subpáginas se houver
    if (route.children) {
      for (const childRoute of route.children) {
        if (childRoute.path === path) {
          return childRoute.metadata;
        }
      }
    }
  }

  // Se não encontrar correspondência exata, procura por prefixo
  // Ordenando do mais específico para o mais genérico
  const sortedRoutes = [...routesConfig].sort((a, b) => b.path.length - a.path.length);

  for (const route of sortedRoutes) {
    if (path.startsWith(route.path) && route.path !== '/') {
      // Verifica se há uma subpágina específica que corresponde
      if (route.children) {
        for (const child of route.children) {
          if (path.startsWith(child.path)) {
            return child.metadata;
          }
        }
      }

      // Retorna a metadata da rota pai se não encontrar uma subpágina específica
      return route.metadata;
    }
  }

  return defaultMetadata;
}
