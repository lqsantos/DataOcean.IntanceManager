# Fase 6: Melhorias para Objetos

## 🆕 NOVO CHAT AQUI!

Esta fase deve ser executada em um **novo chat** (Chat 5 da abordagem híbrida). Continue no mesmo chat para a Fase 7.

## Contexto Completo do Projeto

### **Quase Lá! 🎯**

Iniciamos o **Chat 5 (Finalização)**. A coluna unificada já está funcionando, agora vamos implementar funcionalidades específicas para campos de objeto.

### **Progresso Completo:**

**✅ Fase 1**: Tipos e análise de padrões  
**✅ Fase 2**: Sistema de validação  
**✅ Fase 3**: Editores Apply/Cancel  
**✅ Fase 4**: UnifiedValueColumn principal  
**✅ Fase 5**: Integração na tabela (duas colunas → uma)  
**🎯 Agora**: Melhorias específicas para objetos  
**🔜 Próximo**: Fase 7 (traduções e polimento)

### **Problema dos Objetos:**

Campos de objeto são diferentes - não são editados diretamente. Precisam:

- **Informação estrutural**: `{5 properties}` ou `{empty object}`
- **Detecção recursiva**: Verificar se filhos foram customizados
- **Reset condicional**: Botão "Reset All Children" só quando necessário
- **Estados visuais**: Indicador visual se há customizações nos filhos

### **Estados Visuais para Objetos:**

```
Sem customizações:     ⚪ {5 properties}
Com customizações:     🟡 {5 properties} [Reset All Children]
Objeto vazio:          ⚪ {empty object}
```

### **Lógica Recursiva Necessária:**

- Analisar todos os filhos (children) do objeto
- Verificar recursivamente se algum está customizado (`source === BLUEPRINT`)
- Aplicar reset recursivamente em objetos aninhados
- Mostrar confirmação para ações destrutivas

### **Integração com Existente:**

- `ObjectDisplayComponent` criado na Fase 3 precisa ser aprimorado
- Usar callbacks do `EnhancedTableRows` para reset
- Manter compatibilidade com sistema de change tracking

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

✅ **CONTINUE NO MESMO CHAT**: Prossiga para **[Fase 7: Traduções e Polimento](./phase-07-final-polish.md)**

**Por quê mesmo chat?** As Fases 6+7 são relacionadas e se beneficiam de contexto compartilhado para finalização.

## Estimativa: 30 minutos
