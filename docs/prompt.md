# Criar Testes Unitários para a Página `Settings` e Artefatos Relacionados

**Descrição:**

Gostaria de criar testes unitários para a página `Settings` e todos os artefatos relacionados, incluindo componentes como `EntityPage`, tabelas, formulários e modais. Os testes devem seguir as melhores práticas de organização e reutilização, utilizando o framework [MSW (Mock Service Worker)](https://mswjs.io/) para mock de dados. Abaixo estão as diretrizes para a implementação:

---

## **1. Organização dos Testes**

- Coloque os testes na mesma pasta dos componentes principais, utilizando uma subpasta chamada `__tests__`.
- Para a página `Settings`, o arquivo de teste deve ser salvo como:
  ```
  src/app/settings/__tests__/page.test.tsx
  ```
- Para componentes relacionados, como `EntityPage`, os testes devem ser salvos na mesma pasta do componente:
  ```
  src/components/entities/__tests__/entity-page.test.tsx
  ```

---

## **2. Configuração do MSW**

- Utilize o MSW para mockar as chamadas de API relacionadas às ações da página `Settings` e seus componentes.
- Centralize os handlers do MSW em `src/tests/msw/handlers.ts` para facilitar o compartilhamento entre os testes.

### Exemplo de Handlers:

```ts
// filepath: /src/tests/msw/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/applications', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', name: 'Application 1', slug: 'app-1' },
        { id: '2', name: 'Application 2', slug: 'app-2' },
      ])
    );
  }),
  rest.post('/api/applications', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ id: '3', name: 'Application 3', slug: 'app-3' }));
  }),
  rest.get('/api/environments', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', name: 'Environment 1', slug: 'env-1' },
        { id: '2', name: 'Environment 2', slug: 'env-2' },
      ])
    );
  }),
];
```

---

## **3. Testes para a Página `Settings`**

- Crie testes para os seguintes cenários:
  1. Renderização inicial da página com abas (`Applications`, `Environments`, `Locations`).
  2. Navegação entre as abas e carregamento de dados mockados.
  3. Exibição de mensagens de erro ao falhar no carregamento de dados.
  4. Atualização de dados ao clicar no botão de "Refresh".

### Exemplo de Teste:

```tsx
// filepath: /src/app/settings/__tests__/page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from '@/tests/msw/handlers';
import SettingsPage from '../page';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Settings Page', () => {
  it('should render the Settings page with tabs', async () => {
    render(<SettingsPage />);

    expect(screen.getByText('Applications')).toBeInTheDocument();
    expect(screen.getByText('Environments')).toBeInTheDocument();
    expect(screen.getByText('Locations')).toBeInTheDocument();
  });

  it('should display applications data when Applications tab is selected', async () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByText('Applications'));

    await waitFor(() => {
      expect(screen.getByText('Application 1')).toBeInTheDocument();
      expect(screen.getByText('Application 2')).toBeInTheDocument();
    });
  });
});
```

---

## **4. Testes para o Componente `EntityPage`**

- Crie testes para os seguintes cenários:
  1. Renderização inicial do componente com dados mockados.
  2. Abertura e fechamento dos modais de criação e edição.
  3. Submissão de formulários de criação e edição.
  4. Exclusão de uma entidade.
  5. Exibição de mensagens de erro.

### Exemplo de Teste:

```tsx
// filepath: /src/components/entities/__tests__/entity-page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from '@/tests/msw/handlers';
import { EntityPage } from '../entity-page';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('EntityPage', () => {
  const defaultProps = {
    entities: [],
    isLoading: false,
    isRefreshing: false,
    refreshEntities: jest.fn(),
    createEntity: jest.fn(),
    updateEntity: jest.fn(),
    deleteEntity: jest.fn(),
    EntityTable: ({ entities }: any) => (
      <table>
        <tbody>
          {entities.map((entity: any) => (
            <tr key={entity.id}>
              <td>{entity.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
    EntityForm: ({ onSubmit }: any) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ name: 'New Entity' });
        }}
      >
        <button type="submit">Submit</button>
      </form>
    ),
    entityName: {
      singular: 'Entity',
      plural: 'Entities',
      description: 'Manage your entities here.',
    },
    testIdPrefix: 'entity',
  };

  it('should render the EntityPage with a title and description', () => {
    render(<EntityPage {...defaultProps} />);

    expect(screen.getByText('Entities')).toBeInTheDocument();
    expect(screen.getByText('Manage your entities here.')).toBeInTheDocument();
  });

  it('should open and close the create dialog', async () => {
    render(<EntityPage {...defaultProps} />);

    const addButton = screen.getByText('Adicionar Entity');
    fireEvent.click(addButton);

    expect(screen.getByTestId('entity-page-create-dialog')).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId('entity-page-create-dialog')).not.toBeInTheDocument();
    });
  });
});
```

---

## **5. Reutilização de Componentes de Teste**

- Crie utilitários de teste para cenários comuns, como abrir modais, preencher formulários e verificar mensagens de erro.
- Centralize esses utilitários em `src/tests/test-utils.tsx`.

---

## **6. Benefícios da Abordagem**

- **Organização Modular**: Os testes ficam próximos aos componentes, facilitando a navegação e manutenção.
- **Reutilização**: Utilitários e mocks centralizados evitam duplicação de código.
- **Confiabilidade**: O uso do MSW simula chamadas reais de API, garantindo que os testes sejam mais próximos do comportamento em produção.
- **Escalabilidade**: A estrutura modular facilita a adição de novos testes no futuro.

---

Use este documento como referência para implementar os testes unitários para a página `Settings` e seus artefatos relacionados.
