# Fase 0: Análise Completa da Estrutura Atual

## Resumo da Análise

✅ **Setup de Contexto Concluído** - O projeto possui uma estrutura bem organizada e o problema foi claramente identificado.

## Estrutura Atual Descoberta

### 1. Localização das Colunas Problemáticas

**Arquivo:** `src/components/blueprints/sections/DefaultValuesSection/TableComponents/EnhancedTableRows.tsx`

**Linhas 433-445:** Encontradas as duas colunas que precisam ser unificadas:

```tsx
// Coluna 1: "Template Default" (linha 433-438)
<TableCell
  className="text-xs text-muted-foreground"
  style={{ width: COLUMN_WIDTHS.defaultValue }}
>
  {field.originalValue !== undefined ? String(field.originalValue) : '-'}
</TableCell>

// Coluna 2: "Blueprint Value" (linha 440-445)
<TableCell style={{ width: COLUMN_WIDTHS.value }}>
  <div className="flex items-center justify-between">
    <div className="w-full">{renderValueEditor(field)}</div>
    <div className="ml-2 flex">{renderActionButton(field)}</div>
  </div>
</TableCell>
```

### 2. Cabeçalhos da Tabela

**Arquivo:** `src/components/blueprints/sections/DefaultValuesSection/TableComponents/TableContainer.tsx`

**Linhas 39-46:** Os cabeçalhos são definidos usando traduções:

```tsx
<TableHead style={{ width: COLUMN_WIDTHS.defaultValue }}>
  {t('values.table.defaultValue')}  // "Template Default" / "Padrão do Template"
</TableHead>
<TableHead style={{ width: COLUMN_WIDTHS.value }}>
  {t('values.table.value')}         // "Blueprint Value" / "Valor do Blueprint"
</TableHead>
```

### 3. Traduções Atuais

**Inglês** (`src/locales/en/blueprints.json` linha 441-442):

```json
"defaultValue": "Template Default",
"value": "Blueprint Value",
```

**Português** (`src/locales/pt/blueprints.json` linha 441-442):

```json
"defaultValue": "Padrão do Template",
"value": "Valor do Blueprint",
```

### 4. Larguras das Colunas

**Arquivo:** `src/components/blueprints/sections/DefaultValuesSection/TableComponents/EnhancedTableRows.tsx` (linha 28-34):

```tsx
export const COLUMN_WIDTHS = {
  field: '33%',
  type: '8%',
  defaultValue: '17%', // ← Coluna que será removida
  value: '25%', // ← Coluna que será expandida
  exposed: '8.5%',
  overridable: '8.5%',
};
```

### 5. Estrutura de Dados

**Arquivo:** `src/components/blueprints/sections/DefaultValuesSection/types.ts`

**Campo `DefaultValueField`** possui:

- `value`: Valor atual (blueprint)
- `originalValue`: Valor original (template)
- `source`: Enum indicando se valor vem do template ou blueprint
- `type`: Tipo do campo ('string', 'number', 'boolean', 'object', 'array')

### 6. Editores Existentes

**Arquivo:** `src/components/blueprints/sections/DefaultValuesSection/TableComponents/ValueEditors.tsx`

Editores básicos já existem:

- `StringEditor` - Campo de texto simples
- `NumberEditor` - Campo numérico
- `BooleanEditor` - Select true/false
- `ObjectEditor` - Display para objetos complexos
- `ArrayEditor` - Display para arrays

### 7. Botões de Ação Atuais

Na `EnhancedTableRows.tsx` já existe lógica para:

- Botão "Customize" para campos template
- Botão "Reset" para campos customizados
- Sistema de toggle entre fontes de valor

## Estados Visuais Identificados

### Estado Atual Template

```
Coluna "Template Default" | Coluna "Blueprint Value"
"default-value"           | [input] + [Customize]
```

### Estado Atual Customizado

```
Coluna "Template Default" | Coluna "Blueprint Value"
"default-value"           | [input] + [Reset]
```

## Próximos Passos para Implementação

### 1. Fase 1: Análise de Padrões ✅ PRONTA

- Estrutura descoberta e documentada
- Arquivos principais identificados
- Padrões de tradução mapeados

### 2. Fase 2: Sistema de Validação

- Criar hook `useValueValidation`
- Implementar validação por tipo de campo
- Preparar feedback de erro

### 3. Fase 3: Editores com Apply/Cancel

- Estender editores existentes com estados
- Implementar lógica Apply/Cancel
- Adicionar validação inline

### 4. Fase 4: Coluna Unificada

- Criar componente `UnifiedValueColumn`
- Implementar indicadores visuais
- Integrar estados e lógica

### 5. Fase 5: Integração na Tabela

- Substituir as duas colunas por uma
- Ajustar larguras das colunas
- Atualizar traduções

### 6. Fase 6: Melhorias para Objetos

- Funcionalidades específicas para objetos
- Reset em cascata para children

### 7. Fase 7: Polimento Final

- Traduções completas
- Ajustes de UX
- Testes finais

## Observações Técnicas

### Compatibilidade

- O projeto usa tanto estrutura legacy (`DefaultValueField[]`) quanto nova (`ValueConfiguration`)
- Sistema de toggle já implementado via `useTypedValueConfiguration`
- Handlers duplicados para ambos os formatos

### Padrões Descobertos

- Uso consistente de shadcn/ui components
- Sistema de tradução com i18next
- Estrutura bem modularizada por responsabilidade
- Testes com data-testid já implementados

### Riscos Identificados

- Duas estruturas de dados coexistindo
- Lógica de conversão entre formatos
- Possível quebra de funcionalidade durante transição

## Conclusão

✅ **A estrutura está bem organizada e pronta para refatoração incremental**
✅ **O problema foi claramente localizado e compreendido**  
✅ **Padrões do projeto foram identificados e serão seguidos**
✅ **Estratégia de implementação validada e viável**

**Próximo passo:** Iniciar [Fase 1: Análise e Preparação](./phase-01-analysis-preparation.md)
