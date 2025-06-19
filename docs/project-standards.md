# DataOcean Instance Manager - Padrões de Projeto

## Sumário

1. [Introdução](#introdução)
2. [Estrutura de Diretórios](#estrutura-de-diretórios)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Padrões de Código](#padrões-de-código)
5. [Ferramentas de Qualidade](#ferramentas-de-qualidade)
6. [Testes](#testes)
7. [Mock de APIs (MSW)](#mock-de-apis-msw)
8. [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
9. [Deploy](#deploy)
10. [VS Code Configurações](#vs-code-configurações)

## Introdução

DataOcean Instance Manager é um aplicativo frontend desenvolvido com NextJS para gerenciamento de instâncias. Este documento descreve os padrões, estruturas e ferramentas utilizadas no projeto.

## Estrutura de Diretórios

```
/
├── docs/                  # Documentação do projeto
├── public/                # Arquivos estáticos (imagens, favicon, etc.)
├── src/
│   ├── app/               # Rotas e arquivos globais do Next.js (ex: globals.css, layout.tsx, page.tsx)
│   ├── components/        # Componentes reutilizáveis e específicos de features
│   │   ├── applications/      # Componentes para aplicações
│   │   ├── clusters/          # Componentes para clusters
│   │   ├── entities/          # Componentes de entidades genéricas
│   │   ├── environments/      # Componentes para ambientes
│   │   ├── form/              # Componentes de formulário
│   │   ├── git-source/        # Componentes para fontes Git
│   │   ├── layout/            # Componentes de layout (header, sidebar, etc.)
│   │   ├── locations/         # Componentes para localizações
│   │   ├── pat/               # Componentes para Personal Access Token
│   │   ├── resources/         # Componentes para recursos (blueprints, templates, etc.)
│   │   │   ├── blueprints/        # Componentes de formulário e lógica de blueprints
│   │   │   └── templates/         # Componentes de templates Helm
│   │   ├── templates/         # Componentes para templates Helm
│   │   └── ui/                # Componentes de UI genéricos (botão, modal, etc.)
│   ├── contexts/          # Contextos React (ex: modal, blueprint, template)
│   ├── hooks/             # Custom hooks (ex: useTemplates, useGitNavigation)
│   ├── lib/               # Funções utilitárias e helpers
│   ├── locales/           # Arquivos de tradução (i18n)
│   ├── mocks/             # Mocks de API com MSW
│   │   ├── data/              # Fixtures simuladas
│   │   └── handlers/          # Manipuladores de endpoints
│   ├── services/          # Serviços de API e integrações externas
│   ├── tests/             # Testes unitários e de integração
│   │   ├── integration/       # Testes de integração
│   │   ├── mocks/             # Mocks para testes
│   │   ├── msw/               # Handlers do MSW para testes
│   │   └── utils/             # Utilitários para testes
│   ├── types/             # Tipos e interfaces TypeScript
│   └── utils/             # Funções utilitárias
├── .vscode/               # Configurações do VS Code (INSTRUCTIONS.md, settings.json, etc.)
├── package.json           # Dependências e scripts
├── tsconfig.json          # Configuração do TypeScript
├── next.config.ts         # Configuração do Next.js
├── eslint.config.mjs      # Configuração do ESLint
├── tailwind.config.js     # Configuração do Tailwind CSS
├── vite.config.ts         # Configuração do Vite
├── vitest.config.ts       # Configuração do Vitest
└── README.md              # Documentação principal
```

> **Observação:**
>
> - Os diretórios e subdiretórios refletem a organização atual do projeto.
> - Componentes de UI genéricos ficam em `src/components/ui/`.
> - Cada feature possui sua própria pasta dentro de `src/components/`.
> - Os hooks, serviços, tipos e utilitários são organizados por domínio.
> - Os testes ficam em `src/tests/` e utilizam mocks e MSW para simulação de APIs.

## Stack Tecnológica

- **Framework**: Next.js
- **Linguagem**: TypeScript
- **Estilização**: [Definir: CSS Modules, Tailwind, Styled Components, etc.]
- **Gerenciamento de Estado**: [Definir: Context API, Redux, Zustand, etc.]
- **Roteamento**: Next.js App Router
- **Testes**: Vitest, Testing Library

## Padrões de Código

### Nomenclatura

- **Arquivos e Diretórios**: Utilizar kebab-case para nomes de arquivos e diretórios
- **Componentes**: Utilizar PascalCase para nomes de componentes React
- **Funções e variáveis**: Utilizar camelCase
- **Constantes**: Utilizar UPPER_SNAKE_CASE para constantes globais
- **Interfaces e Types**: Utilizar PascalCase para interfaces e types (ex: UserProps, ButtonProps)
  - Não usar prefixo "I" (como IUser) pois o TypeScript já diferencia naturalmente interfaces de outros tipos
  - Usar sufixos como `Props`, `State`, `Context` quando apropriado para maior clareza

### Importações

Organizar importações na seguinte ordem:

1. Bibliotecas externas
2. Componentes
3. Hooks
4. Utilitários/Helpers
5. Estilos

Utilizar o alias `@/*` para importações internas, conforme configurado no tsconfig.json:

```tsx
// Preferir:
import { Button } from '@/components/ui/Button';

// Em vez de:
import { Button } from '../../../components/ui/Button';
```

### Componentes

- Utilizar componentes funcionais com hooks
- Evitar props drilling, preferir Context API para estados compartilhados
- Documentar props com JSDoc ou criar interfaces TypeScript

```tsx
interface ButtonProps {
  /** Texto a ser exibido no botão */
  label: string;
  /** Função executada ao clicar no botão */
  onClick: () => void;
  /** Variante visual do botão */
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = ({ label, onClick, variant = 'primary' }: ButtonProps) => {
  // Implementação
};
```

## Ferramentas de Qualidade

### ESLint

Configuração recomendada para garantir consistência e qualidade de código, utilizando o novo formato Flat Config:

```js
// eslint.config.mjs
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactHooks from 'eslint-plugin-react-hooks/recommended';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  reactRecommended,
  reactHooks,
  ...tseslint.configs.recommended,
  nextPlugin.configs['core-web-vitals'],
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
```

### Prettier

Configuração para formatação consistente:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100,
  "endOfLine": "auto"
}
```

### Husky e lint-staged

Configurar Husky para executar verificações antes de commits:

```json
{
  "scripts": {
    "prepare": "husky install",
    "lint-staged": "lint-staged"
  }
}
```

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
}
```

## Testes

### Vitest e Testing Library

O projeto utiliza Vitest para testes, configurado no `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Padrões de Teste

- **Testes unitários**: Testar componentes e funções isoladamente
- **Testes de integração**: Testar interações entre componentes
- **Testes E2E**: Testar fluxos completos da aplicação

Exemplo de teste para um componente:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders correctly with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('executes onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Mock de APIs (MSW)

O projeto utiliza Mock Service Worker (MSW) para simular chamadas de API durante o desenvolvimento e testes.

### Estrutura dos Mocks

```
src/
└── mocks/
    ├── handlers/           # Manipuladores de requisições por recurso
    │   ├── auth.ts         # Endpoints de autenticação
    │   ├── users.ts        # Endpoints de usuários
    │   └── ...
    ├── data/               # Dados simulados (fixtures)
    ├── browser.ts          # Configuração para ambiente de navegador
    ├── server.ts           # Configuração para testes
    └── index.ts            # Exportações principais
```

### Uso em Desenvolvimento

MSW é configurado no ambiente de desenvolvimento para interceptar requisições HTTP e fornecer respostas simuladas:

```tsx
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

Inicialização no código da aplicação:

```tsx
// src/app/layout.tsx ou outro arquivo de inicialização
if (process.env.NODE_ENV === 'development') {
  // Carrega MSW dinamicamente apenas em desenvolvimento
  import('../mocks/browser').then(({ worker }) => {
    worker.start({ onUnhandledRequest: 'bypass' });
  });
}
```

### Uso em Testes

MSW é configurado nos testes para simular chamadas de API sem dependências externas:

```tsx
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

Configuração nos testes:

```tsx
// tests/setup.ts
import { server } from '@/mocks/server';
import { afterAll, afterEach, beforeAll } from 'vitest';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Exemplo de Handler

```tsx
// src/mocks/handlers/users.ts
import { http, HttpResponse } from 'msw';
import { users } from '../data/users';

export const userHandlers = [
  http.get('/api/users', () => {
    return HttpResponse.json(users);
  }),

  http.get('/api/users/:id', ({ params }) => {
    const user = users.find((user) => user.id === params.id);

    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(user);
  }),
];
```

## Fluxo de Desenvolvimento

### Branches

- `main`: Código de produção
- `develop`: Código de desenvolvimento
- `feature/nome-da-feature`: Para novas funcionalidades
- `fix/nome-do-fix`: Para correções de bugs

### Commits

Seguir o padrão Conventional Commits:

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

Tipos comuns:

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações na documentação
- `style`: Alterações que não afetam o código (espaços, formatação)
- `refactor`: Refatorações de código
- `test`: Adição ou correção de testes
- `chore`: Alterações no processo de build, ferramentas, etc.

## Deploy

O projeto utiliza uma pipeline de CI/CD automatizada para garantir qualidade e facilitar a entrega contínua.

### Ambientes

- **Desenvolvimento**: Ambiente para testes de novas funcionalidades
- **Homologação**: Ambiente para validação antes da produção
- **Produção**: Ambiente de uso final pelos usuários

### Pipeline (Azure DevOps)

```yaml
# Exemplo básico de azure-pipelines.yml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: Build
    jobs:
      - job: BuildAndTest
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '18.x'
          - script: npm ci
          - script: npm run lint
          - script: npm run test
          - script: npm run build
          - task: PublishBuildArtifacts@1
            inputs:
              pathToPublish: '.next'
              artifactName: 'nextjs-build'

  - stage: Deploy
    dependsOn: Build
    condition: succeeded()
    jobs:
      - deployment: DeployToAzure
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                # Configuração do deploy na plataforma escolhida
                # (Azure App Service, Vercel, AWS Amplify, etc.)
```

### Estratégia de Deploy

- Builds automatizados em cada commit para branches principais
- Testes automatizados antes de cada deploy
- Deploy zero-downtime com possibilidade de rollback
- Monitoramento de erros pós-deploy

## VS Code Configurações

Para maximizar a produtividade e garantir consistência no desenvolvimento, recomendamos as seguintes configurações para o Visual Studio Code:

### Extensões Recomendadas

- **ESLint** (`dbaeumer.vscode-eslint`) - Integração do ESLint para detectar problemas de código
- **Prettier** (`esbenp.prettier-vscode`) - Formatação consistente do código
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) - Autocomplete para classes Tailwind CSS
- **Import Cost** (`wix.vscode-import-cost`) - Mostra o tamanho dos pacotes importados
- **GitLens** (`eamodio.gitlens`) - Melhora a visualização do histórico Git
- **Error Lens** (`usernamehw.errorlens`) - Exibe erros e avisos inline no código
- **Todo Tree** (`gruntfuggly.todo-tree`) - Lista todos os comentários TODO e FIXME
- **Auto Rename Tag** (`formulahendry.auto-rename-tag`) - Renomeia automaticamente tags HTML/JSX
- **Path Intellisense** (`christian-kohler.path-intellisense`) - Autocomplete para caminhos de arquivos

### Arquivo `.vscode/extensions.json`

Crie um arquivo para recomendar extensões para todos os membros da equipe:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenprettier-vscode",
    "bradlc.vscode-tailwindcss",
    "wix.vscode-import-cost",
    "eamodio.gitlens",
    "usernamehw.errorlens",
    "gruntfuggly.todo-tree",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Arquivo `.vscode/settings.json`

Configure o ambiente de desenvolvimento com configurações padronizadas:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "prettier.requireConfig": true,
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "editor.quickSuggestions": {
    "strings": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.tabSize": 2,
  "editor.detectIndentation": false,
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  }
}
```

### Arquivo `.vscode/launch.json`

Configure depuração da aplicação NextJS:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "serverReadyAction": {
        "pattern": "started server on .+, url: (https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

### Snippets Personalizados

Opcionalmente, crie um arquivo `.vscode/typescript.code-snippets` com snippets úteis:

```json
{
  "React Functional Component": {
    "prefix": "rfc",
    "body": [
      "interface ${1:Component}Props {",
      "  $2",
      "}",
      "",
      "export function ${1:Component}({ $3 }: ${1:Component}Props) {",
      "  return (",
      "    <div>",
      "      $4",
      "    </div>",
      "  )",
      "}"
    ],
    "description": "Create a React Functional Component with TypeScript props"
  },
  "Next.js Page": {
    "prefix": "npage",
    "body": [
      "export const metadata = {",
      "  title: '$1',",
      "  description: '$2'"
      "}",
      "",
      "export default function ${3:Page}() {",
      "  return (",
      "    <div>",
      "      $4",
      "    </div>",
      "  )",
      "}"
    ],
    "description": "Create a Next.js page with metadata"
  }
}
```

### Workspaces

Para projetos maiores, considere utilizar arquivos de workspace VS Code (`*.code-workspace`) para definir múltiplas pastas, configurações específicas e melhorar a organização:

```json
{
  "folders": [
    {
      "name": "DataOcean Instance Manager",
      "path": "."
    }
  ],
  "settings": {
    "typescript.tsdk": "DataOcean Instance Manager/node_modules/typescript/lib",
    "window.title": "${activeEditorShort}${separator}${rootName}"
  },
  "extensions": {
    "recommendations": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode"]
  }
}
```

---

Este documento deve ser mantido atualizado conforme o projeto evolui.

## Próximos Passos

Após a criação deste documento, considere:

1. Personalizar os detalhes específicos para seu projeto (como estratégia de estilização, gerenciamento de estado e CI/CD)
2. Criar um índice de documentação se mais documentos forem adicionados
3. Adicionar exemplos específicos do seu projeto
4. Considerar criar documentação API ou de componentes
