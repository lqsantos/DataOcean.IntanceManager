# Proposta de Refatoração do TableView

## Problemas Identificados

- O arquivo TableView.tsx está muito extenso (~670 linhas)
- Mistura várias responsabilidades diferentes
- Dificuldade de manutenção e teste
- Lógica de negócio acoplada à renderização

## Estratégia de Refatoração

### 1. Extrair a lógica de gerenciamento de campos para um hook personalizado

Criar o arquivo `hooks/useFieldManagement.ts` que encapsula as funções:

- handleSourceChange
- handleValueChange
- handleExposeChange
- handleOverrideChange
- findFieldByPath

### 2. Extrair utilitários de propagação para um arquivo separado

Criar o arquivo `utils/propagationUtils.ts` com funções para:

- propagateExposedToAncestors
- propagateOverrideToAncestors
- propagateExposedToAncestorsTraditional
- propagateOverrideToAncestorsTraditional

### 3. Separar a renderização da tabela em componentes menores

- `TableContainer.tsx`: Componente que renderiza a estrutura da tabela
- `TableFooter.tsx`: Componente que renderiza o rodapé da tabela
- `ValidationDisplay.tsx`: Componente que exibe mensagens de validação

### 4. Reimplementar o TableView como um componente mais simples

O TableView renovado apenas:

- Gerencia props e estados
- Delega a lógica ao hook useFieldManagement
- Compõe os componentes da UI

## Arquivos a serem criados/modificados

- ✅ `hooks/useFieldManagement.ts`
- ✅ `utils/propagationUtils.ts`
- ✅ `TableContainer.tsx`
- ✅ `TableFooter.tsx`
- ✅ `TableView.tsx` (modificado)

## Benefícios

- Componentes mais coesos e com responsabilidade única
- Lógica de negócio separada da UI
- Mais fácil de testar isoladamente
- Mais fácil de manter e estender

## Implementação

Os arquivos necessários já foram criados como parte desta refatoração, mas para aplicá-los em produção:

1. Renomear `hooks/useFieldManagement.ts.new` para `hooks/useFieldManagement.ts`
2. Renomear `TableView.tsx.new` para `TableView.tsx` (após backups)

## Considerações Adicionais

- Seria útil considerar a implementação de testes unitários para cada componente e hook
- Poderia ser considerada a migração gradual para TypeScript mais estrito com menos `any`
