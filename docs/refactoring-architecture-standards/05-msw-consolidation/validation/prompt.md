# Prompt: Validação da Consolidação MSW

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Fase**: Validação da consolidação de mocks MSW  
**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`

## Objetivo da Validação

Validar que a consolidação dos mocks MSW foi implementada corretamente, eliminando duplicações e mantendo funcionalidade.

## Pré-requisitos

- [ ] Implementação completa executada
- [ ] Estrutura centralizada criada em `src/mocks/`

## Tarefas de Validação

### 1. Verificação da Estrutura

#### Verificar Estrutura Centralizada

```bash
# Verificar se estrutura foi criada corretamente
ls -la src/mocks/
ls -la src/mocks/handlers/

# Deve mostrar:
# src/mocks/index.ts
# src/mocks/browser.ts
# src/mocks/server.ts
# src/mocks/handlers/index.ts
# src/mocks/handlers/applications.ts
# src/mocks/handlers/environments.ts
# src/mocks/handlers/locations.ts
# src/mocks/handlers/common.ts
```

#### Verificar Eliminação de Duplicações

```bash
# Verificar se handlers duplicados foram removidos
find src/ -name "*mock*" -type f | grep -v "src/mocks/" || echo "Nenhum mock duplicado encontrado"

# Verificar se configurações MSW antigas foram removidas
find src/ -name "*msw*" -type f | grep -v "src/mocks/" || echo "Configurações antigas removidas"
```

### 2. Verificação Técnica

#### Build e Testes

```bash
npm run build
npm run type-check
npm run test
```

#### Verificar Imports Atualizados

```bash
# Verificar se imports foram atualizados para nova estrutura
grep -r "from.*mocks" src/ --include="*.ts" --include="*.tsx" | head -5

# Não deve haver imports antigos
grep -r "from.*tests.*msw\|from.*__mocks__" src/ --include="*.ts" --include="*.tsx" | wc -l
```

### 3. Verificação Funcional

#### Teste de Mocks em Desenvolvimento

```bash
# Iniciar aplicação
npm run dev
```

**Verificações manuais no browser:**

- [ ] Abrir DevTools → Network tab
- [ ] Verificar se requests para `/api/*` são interceptados
- [ ] Verificar se dados mock são retornados corretamente
- [ ] Testar funcionalidades CRUD (create, read, update, delete)

#### Teste de Mocks nos Testes

```bash
# Executar testes que dependem de API
npm run test -- --testPathPattern=".*\.(test|spec)\.(ts|tsx)"

# Verificar se testes de integração passam
npm run test -- --testPathPattern="integration"
```

### 4. Verificação de Organização

#### Handlers por Domínio

```bash
# Verificar se handlers estão organizados corretamente
grep -r "rest\.get\|rest\.post" src/mocks/handlers/ --include="*.ts"

# Verificar se tipos estão corretos
grep -r "Application\|Environment\|Location" src/mocks/handlers/ --include="*.ts"
```

#### Mock Data Realista

- [ ] Mock data segue estrutura real dos tipos TypeScript
- [ ] Dados são realistas e úteis para desenvolvimento
- [ ] Relacionamentos entre entidades fazem sentido

### 5. Verificação de Performance

#### Bundle Size

```bash
# Verificar se mocks não afetam bundle de produção
npm run build
# Verificar .next/static/ para confirmar que mocks não estão incluídos
```

#### Funcionamento em Diferentes Ambientes

- [ ] **Desenvolvimento**: Worker MSW funciona no browser
- [ ] **Testes**: Server MSW funciona no Node.js
- [ ] **Produção**: Mocks não interferem (build limpo)

## Critérios de Aceitação Final

### ✅ Estrutura Consolidada

- [ ] Todos os mocks centralizados em `src/mocks/`
- [ ] Handlers organizados por domínio lógico
- [ ] Configuração unificada para browser/server
- [ ] Duplicações eliminadas completamente

### ✅ Funcionalidade Mantida

- [ ] Todos os endpoints mockados funcionam
- [ ] Testes que dependem de mocks passam
- [ ] Desenvolvimento com mocks funciona normalmente
- [ ] CRUD operations funcionam via mocks

### ✅ Qualidade e Performance

- [ ] Mock data tipado corretamente
- [ ] Performance não degradada
- [ ] Bundle de produção limpo (sem mocks)
- [ ] Imports organizados e consistentes

## Problemas Comuns e Soluções

### Se Mocks Não Funcionam em Dev

1. Verificar se `src/mocks/browser.ts` está sendo importado
2. Verificar console do browser para erros MSW
3. Verificar se Service Worker está registrado
4. Verificar configuração do MSW worker

### Se Testes Falharem

1. Verificar se `src/mocks/server.ts` está no setup de testes
2. Verificar se handlers estão sendo importados corretamente
3. Verificar se tipos de mock data correspondem aos tipos reais
4. Verificar setup/teardown do server MSW

### Se Build Incluir Mocks

1. Verificar se mocks não estão sendo importados em código de produção
2. Verificar tree-shaking está funcionando
3. Revisar imports condicionais por NODE_ENV

### Se Performance Degradar

1. Verificar se mock data não está excessivamente grande
2. Verificar se handlers não têm lógica complexa desnecessária
3. Considerar lazy loading de mock data

## Exemplos de Validação Bem-Sucedida

### Import Consolidado

```typescript
// ✅ Import correto nos testes
import { server } from '@/mocks/server';
import { applicationHandlers } from '@/mocks/handlers';
```

### Handler Bem Estruturado

```typescript
// ✅ Handler organizado por domínio
export const applicationHandlers = [
  rest.get('/api/applications', (req, res, ctx) => {
    return res(ctx.json(mockApplications));
  }),
  // outros handlers...
];
```

### Setup de Teste Correto

```typescript
// ✅ Setup adequado para testes
import { server } from '@/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Relatório de Validação

### Estrutura Verificada

- **Consolidação**: ✅ Completa / ❌ Incompleta
- **Organização**: ✅ Por domínio / ❌ Desorganizada
- **Duplicações**: ✅ Eliminadas / ❌ Ainda existem

### Funcionalidade Testada

- **Development**: ✅ Funcionando / ❌ Com problemas
- **Tests**: ✅ Passando / ❌ Falhando
- **Build**: ✅ Limpo / ❌ Com mocks

### Problemas Encontrados

_Documentar qualquer problema identificado_

## Próximo Passo

Se validação passou:

- Marcar Fase 05 como ✅ **Concluída** no README principal
- Proceder para **Fase 06 - Hooks Optimization** (final)
