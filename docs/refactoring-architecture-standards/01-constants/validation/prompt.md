# Prompt: Validação da Centralização de Constantes

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Objetivo**: Validar que centralização de constantes funcionou corretamente  
**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`

## Objetivo da Validação

Validar que a centralização de constantes foi implementada corretamente, sem regressões funcionais e seguindo os padrões arquiteturais.

## Pré-requisitos

- [ ] Implementação completa executada
- [ ] Build sem erros
- [ ] Commits com as mudanças realizados

## Tarefas de Validação

### 1. Verificação Técnica

#### Build e Linting

```bash
npm run build
npm run lint
npm run type-check
```

#### Testes

```bash
npm run test
# Verificar se todos os testes passam
```

#### Comandos Específicos de Validação

```bash
# 1. Verificar se arquivo constants.ts foi criado/atualizado
ls -la src/lib/constants.ts

# 2. Verificar se não restaram constantes duplicadas
grep -r "const.*API_BASE_URL\|const.*'/api/'" src/ --include="*.ts" --include="*.tsx" | grep -v constants.ts

# 3. Verificar se imports estão usando @/lib/constants
grep -r "from '@/lib/constants'" src/ --include="*.ts" --include="*.tsx"

# 4. Buscar strings hardcoded que deveriam estar centralizadas
grep -r '"active"\|"inactive"\|"pending"' src/ --include="*.ts" --include="*.tsx" | grep -v constants.ts | head -5

# 5. Verificar se testes ainda funcionam
npm run test -- --passWithNoTests
```

### 2. Verificação de Qualidade

#### Verificar Remoção de Duplicações

```bash
# Buscar constantes que ainda podem estar duplicadas
grep -r "FIXME\|TODO" src/ --include="*.ts" --include="*.tsx"

# Verificar se strings hardcoded foram removidas
grep -r '"[A-Z_]{3,}"' src/ --include="*.ts" --include="*.tsx" | grep -v constants.ts
```

#### Verificar Estrutura de Imports

```bash
# Verificar se imports estão corretos
grep -r "from.*constants" src/ --include="*.ts" --include="*.tsx"
```

### 3. Verificação Funcional

#### Teste Manual da Interface

- [ ] Navegação entre páginas funciona
- [ ] Formulários exibem placeholders corretos
- [ ] Mensagens de erro/sucesso aparecem
- [ ] Componentes mantêm funcionalidade original

### 4. Verificação de Padrões

#### Conformidade com Architecture Standards

- [ ] Constantes tipadas com `as const`
- [ ] Estrutura hierárquica clara (UI, BUSINESS, CONFIG, MESSAGES)
- [ ] Imports usando alias `@/lib/constants`
- [ ] Nomes de constantes em SCREAMING_SNAKE_CASE
- [ ] Documentação JSDoc quando necessário

## Critérios de Aceitação Final

- [ ] ✅ Build e testes passando
- [ ] ✅ Nenhuma constante duplicada identificada
- [ ] ✅ Funcionalidade mantida (teste manual)
- [ ] ✅ Imports padronizados
- [ ] ✅ Estrutura seguindo padrões arquiteturais
- [ ] ✅ Performance não degradada

## Problemas Comuns e Soluções

### Se Build Falhar

1. Verificar imports quebrados
2. Verificar tipos TypeScript
3. Verificar nomes de constantes

### Se Testes Falharem

1. Atualizar mocks que usavam valores hardcoded
2. Verificar constantes em arquivos de teste
3. Atualizar snapshots se necessário

### Se Funcionalidade Quebrar

1. Verificar se todas as substituições foram corretas
2. Verificar se valores de constantes estão corretos
3. Verificar imports em todos os arquivos afetados

## Próximo Passo

Se validação passou, marcar Fase 01 como ✅ **Concluída** no README principal e proceder para **Fase 02 - Imports Standardization**.
