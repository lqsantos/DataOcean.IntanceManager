# Fase 6: Melhorias para Objetos

## Objetivo

Implementar funcionalidades específicas para campos de objeto com detecção de filhos customizados.

## Dependências

- ✅ Fase 3: Editores de Valor
- ✅ Fase 4: Coluna Unificada
- ✅ Fase 5: Integração na Tabela

## Tarefas

### 1. Analisar Hierarquia de Campos

Examine como funciona a estrutura hierárquica atual:

- Propriedade `children` em `DefaultValueField`
- Como são detectados campos customizados (`source === ValueSourceType.BLUEPRINT`)
- Lógica recursiva existente para expansão

### 2. Implementar Análise de Objetos

No `ObjectDisplayComponent` (criado na Fase 3):

**Função de Análise**:

```typescript
// Baseado em padrões do projeto para análise recursiva
const analyzeObjectChildren = (children: DefaultValueField[]) => {
  // Detectar se há filhos customizados (recursivamente)
  // Contar propriedades total
  // Identificar se objeto está vazio
};
```

### 3. Indicadores Visuais para Estado dos Filhos

**Estados**:

- Sem customizações: Ícone Circle, sem botões
- Com customizações: Ícone Edit3/AlertTriangle, botão "Reset All Children"
- Objeto vazio: Exibir "{empty object}", sem botões

**Seguir padrões visuais do projeto**:

- Classes CSS consistentes com outros componentes
- Cores e ícones do design system
- Transições e animations se usadas no projeto

### 4. Implementar Reset Recursivo

**Funcionalidade**:

- Resetar todos os filhos customizados para valores template
- Aplicar recursivamente em objetos aninhados
- Mostrar confirmação (seguir padrão do projeto para ações destrutivas)

**Integração**:

- Usar callbacks existentes do EnhancedTableRows
- Manter compatibilidade com sistema de change tracking

### 5. Tooltip Informativo (Opcional)

Se o projeto usa tooltips, implementar preview:

- Mostrar primeiras 3-5 propriedades do objeto
- Indicar quantas propriedades foram omitidas
- Seguir padrão de tooltips existente

## Critérios de Aceite

- [ ] Detecção recursiva de filhos customizados funciona
- [ ] Botão reset aparece apenas quando necessário
- [ ] Reset recursivo funciona em objetos aninhados
- [ ] Indicadores visuais seguem design system
- [ ] Informação estrutural é precisa ({X properties})
- [ ] Confirmação para ações destrutivas (se padrão do projeto)

## Arquivos Criados/Modificados

- `src/components/blueprints/sections/DefaultValuesSection/TableComponents/ObjectDisplayComponent.tsx` (modificado)

## Próxima Fase

Após concluir esta fase, prossiga para: **[Fase 7: Traduções e Polimento](./phase-07-final-polish.md)**

## Estimativa: 30 minutos
