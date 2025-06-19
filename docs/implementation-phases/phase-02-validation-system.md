# Fase 2: Sistema de Validação Central

## Contexto Rápido

Estamos unificando duas colunas de valor em uma tabela hierárquica (Next.js + TypeScript). Esta fase cria um sistema de validação reutilizável para o futuro fluxo Apply/Cancel.

**Dependência:** Você deve ter completado a Fase 1 (tipos base e análise de padrões).

## Objetivo

Criar um sistema de validação reutilizável baseado nos padrões do projeto.

## Dependências

- ✅ Fase 1: Análise e Preparação

## Tarefas

### 1. Analisar Validação Existente

Examine como o projeto já trata validação:

- `src/components/blueprints/sections/DefaultValuesSection/utils/`
- Padrões de error handling nos componentes existentes
- Como são exibidas mensagens de erro atualmente

### 2. Criar Hook de Validação

**Arquivo**: `src/components/blueprints/sections/DefaultValuesSection/hooks/useFieldValidation.ts`

**Baseado nos padrões encontrados**:

- Seguir convenções de hooks existentes no projeto
- Usar mesma estrutura de retorno (ex: `{ isValid, error, validate }`)
- Implementar debounce seguindo padrão do projeto
- Incluir cache de validação se for padrão do projeto

### 3. Validadores por Tipo

**Arquivo**: `src/components/blueprints/sections/DefaultValuesSection/validators/`

Criar validadores para:

- `stringValidator.ts` - Formato básico de string
- `numberValidator.ts` - Validação numérica
- `booleanValidator.ts` - Validação booleana

**Seguir padrões**:

- Interface comum para todos os validadores
- Mensagens de erro usando sistema de tradução existente
- Async/await patterns se usado no projeto

### 4. Integrar com Sistema de Tradução

Adicionar keys de tradução necessárias:

**Em**: `src/locales/en/blueprints.json`
**PT**: `src/locales/pt/blueprints.json`

```json
// Seguir padrão existente da seção values.table
// Adicionar apenas keys para validação:
// "validation": { "invalid": "...", "required": "..." }
```

## Critérios de Aceite

- [ ] Hook segue padrões de hooks existentes no projeto
- [ ] Validadores têm interface consistente
- [ ] Mensagens de erro traduzidas corretamente
- [ ] Debounce implementado seguindo padrão do projeto
- [ ] Testes unitários (se for padrão do projeto)

## Arquivos Criados/Modificados

- `src/components/blueprints/sections/DefaultValuesSection/hooks/useFieldValidation.ts` (novo)
- `src/components/blueprints/sections/DefaultValuesSection/validators/stringValidator.ts` (novo)
- `src/components/blueprints/sections/DefaultValuesSection/validators/numberValidator.ts` (novo)
- `src/components/blueprints/sections/DefaultValuesSection/validators/booleanValidator.ts` (novo)
- `src/locales/en/blueprints.json` (modificado)
- `src/locales/pt/blueprints.json` (modificado)

## Próxima Fase

---

## ✅ Fase 2 Concluída!

Parabéns! O sistema de validação está implementado.

**🎯 Próximo passo para o usuário:**  
Esta fase termina aqui.

**📋 PRÓXIMOS PASSOS PARA O USUÁRIO:**
Para continuar a implementação, **você deve iniciar um novo chat** e colar o conteúdo da **[Fase 3: Editores de Valor](./phase-03-value-editors.md)**

## Estimativa: 45 minutos
