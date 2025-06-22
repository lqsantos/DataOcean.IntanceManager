# Phase 00: Code Cleanup

## Objetivo

Remover código não utilizado (dead code) antes de iniciar a refatoração arquitetural.

## Análise da Situação Atual

### 1. O Copilot Agent irá automaticamente:

- Identificar componentes, hooks e utils não utilizados
- Verificar imports órfãos
- Detectar código morto (dead code)
- **Remover git-source e pat (não utilizados mais no projeto)**
- Categorizar por nível de risco de remoção

### 2. Remoção Específica: git-source e pat

**Contexto**: git-source e pat foram descontinuados do projeto e devem ser completamente removidos.

**O Copilot Agent deve buscar e remover:**

- Arquivos relacionados a git-source e pat
- Imports e referências no código
- Configurações e dependências
- Scripts e comandos relacionados
- Documentação obsoleta

### 3. Categorização por Risco

- **LOW RISK**: Zero referências encontradas
- **MEDIUM RISK**: Possível uso dinâmico (verificar manualmente)
- **HIGH RISK**: Tipos e interfaces (podem ser usados apenas em anotações)

## Implementação

### Step 1: Instruções de Backup (Usuário)

**ANTES DE INICIAR**: O usuário deve criar backup:

```bash
# Criar branch para cleanup
git checkout -b cleanup/dead-code-removal
git add .
git commit -m "Backup before dead code cleanup"
```

### Step 2: Remoção Prioritária - git-source e pat (Copilot Agent)

**O Copilot Agent deve identificar e remover TUDO relacionado a:**

#### 2.1 git-source

- **Arquivos**: Buscar todos os arquivos que contenham "git-source" no nome ou conteúdo
- **Imports**: `import ... from 'git-source'` ou `import ... from './git-source'`
- **Dependências**: Verificar package.json para dependências relacionadas
- **Configurações**: Arquivos de config que referenciam git-source
- **Scripts**: package.json scripts que usam git-source
- **Documentação**: README, docs que mencionam git-source

#### 2.2 pat (Personal Access Token)

- **Arquivos**: Buscar arquivos que contenham "pat" no contexto de autenticação
- **Variáveis de ambiente**: PAT_TOKEN, GITHUB_PAT, etc.
- **Configurações**: .env.example, configs que referenciam PAT
- **Código**: Funções, utils, services que usam PAT
- **Documentação**: Instruções de setup com PAT

#### 2.3 Ações Específicas

1. **Buscar referencias**: `grep_search` para encontrar todas as ocorrências
2. **Analisar dependências**: `read_file` em package.json
3. **Identificar arquivos**: `file_search` por padrões relacionados
4. **Remover código**: Usar `replace_string_in_file` para limpeza
5. **Validar remoção**: `get_errors` para verificar se não quebrou build

#### 2.4 Padrões de Busca Específicos

**Para git-source:**

- Arquivos: `*git-source*`, `*gitSource*`
- Imports: `from 'git-source'`, `import { ... } from './git-source'`
- Funções: `gitSource()`, `useGitSource()`, `GitSourceProvider`
- Types: `GitSourceConfig`, `GitSourceOptions`

**Para pat:**

- Variáveis: `PAT_TOKEN`, `GITHUB_PAT`, `PERSONAL_ACCESS_TOKEN`
- Funções: `getPat()`, `validatePat()`, `patAuth()`
- Configs: `pat:`, `personalAccessToken:`
- Env vars: `.env` files contendo PAT

### Step 3: Remoção Segura - Outros LOW RISK (Copilot Agent)

O Copilot Agent irá:

- Identificar arquivos com zero referências confirmadas
- Remover automaticamente usando ferramentas nativas
- Atualizar imports e exports relacionados

### Step 4: Verificação MEDIUM/HIGH RISK (Usuário + Copilot Agent)

Para arquivos de risco médio/alto, o Copilot Agent **identifica e reporta**, o usuário decide:

- Abrir no editor
- Verificar se é usado em imports dinâmicos
- Verificar se é usado apenas em tipos
- Decidir se é seguro remover

### Step 5: Limpeza de Index Files (Copilot Agent)

O Copilot Agent irá:

- Localizar todos os arquivos index.ts
- Identificar exports órfãos (que referenciam arquivos removidos)
- Atualizar automaticamente os exports
- Verificar consistência dos barrel exports

### Step 6: Validação e Commit (Usuário)

**APÓS a limpeza completa**: O usuário deve validar e commitar:

```bash
# Validar
npm run build   # Verificar se build passa
npm run test    # Verificar se testes passam
npm run lint    # Verificar se não há erros críticos

# Commitar
git add .
git commit -m "feat: remove dead code and obsolete git-source/pat dependencies"
```

## Checklist de Finalização

### ✅ Antes de Iniciar (Usuário)

- [ ] Branch `cleanup/dead-code-removal` criado
- [ ] Backup realizado

### ✅ Remoção git-source e pat (Copilot Agent)

- [ ] Todas as referências a git-source removidas
- [ ] Todas as referências a pat removidas
- [ ] package.json limpo de dependências relacionadas
- [ ] Variáveis de ambiente PAT removidas
- [ ] Documentação atualizada (sem referências a git-source/pat)

### ✅ Limpeza Geral (Copilot Agent)

- [ ] Dead code LOW RISK removido automaticamente
- [ ] MEDIUM/HIGH RISK identificado e reportado
- [ ] Index files atualizados
- [ ] Imports órfãos removidos

### ✅ Validação Final (Usuário)

- [ ] `npm run build` - Build passa sem erros
- [ ] `npm run test` - Testes passam
- [ ] `npm run lint` - Sem erros críticos
- [ ] App inicia corretamente em dev mode
- [ ] Funcionalidades principais funcionam
- [ ] Alterações commitadas

## Próximo Passo

→ **Phase 01: Foundation Architecture**
