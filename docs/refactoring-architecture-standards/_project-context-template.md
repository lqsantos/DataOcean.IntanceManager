## Informações do Projeto

### Estrutura Atual do Projeto

```
src/
├── app/                    # Next.js App Router
├── components/             # React components
│   ├── applications/       # Application-related components
│   ├── blueprints/         # Blueprint management components
│   ├── clusters/           # Cluster management components
│   ├── entities/           # Generic entity components
│   ├── environments/       # Environment-related components
│   ├── form/               # Generic form components
│   ├── git-source/         # Git source management components
│   ├── layout/             # Layout components (Sidebar, Header)
│   ├── locations/          # Location-related components
│   ├── pat/                # Personal Access Token components
│   ├── resources/          # Resource management components
│   └── ui/                 # Generic UI components
├── contexts/               # React Context providers
├── hooks/                  # Custom React hooks
│   ├── use-applications.ts
│   ├── use-blueprints.ts
│   ├── use-clusters.ts
│   ├── use-environments.ts
│   ├── use-locations.ts
│   ├── use-pat.ts
│   └── use-templates.ts
├── lib/                    # Utility libraries and configurations
├── locales/                # i18n translation files
├── mocks/                  # MSW mocks for testing/development
├── services/               # API services
│   ├── application-service.ts
│   ├── blueprint-service.ts
│   ├── cluster-service.ts
│   ├── environment-service.ts
│   ├── git-service.ts
│   ├── git-source-service.ts
│   ├── location-service.ts
│   ├── pat-service.ts
│   ├── template-schema-service.ts
│   └── template-service.ts
├── tests/                  # Test utilities and setup
├── types/                  # TypeScript type definitions
│   ├── application.ts
│   ├── blueprint.ts
│   ├── cluster.ts
│   ├── environment.ts
│   ├── git-source.ts
│   ├── location.ts
│   ├── pat.ts
│   └── template.ts
└── utils/                  # Utility functions
```

### Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Mocking**: MSW (Mock Service Worker)
- **State**: React hooks + Context
- **i18n**: Custom i18n implementation

### Domínios Principais

1. **Applications** - Gerenciamento de aplicações
2. **Blueprints** - Gerenciamento de templates/blueprints
3. **Clusters** - Gerenciamento de clusters de infraestrutura
4. **Environments** - Gerenciamento de ambientes (prod, staging, dev)
5. **Git Sources** - Gerenciamento de fontes Git
6. **Locations** - Gerenciamento de localizações/datacenters
7. **PAT (Personal Access Tokens)** - Gerenciamento de tokens de acesso
8. **Templates** - Gerenciamento de templates de configuração

### Configurações Importantes

- **tsconfig.json**: Configurado com alias `@/*` → `./src/*`
- **package.json**: Scripts para build, test, lint, dev
- **Tailwind**: Configurado para todo o projeto
- **MSW**: Configurado para mocks em desenvolvimento e testes
