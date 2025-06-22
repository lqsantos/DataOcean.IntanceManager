# Prompt: Validação da Unificação de Props Interfaces

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Fase**: Validação da padronização de props interfaces  
**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`

## Objetivo da Validação

Validar que a unificação de props interfaces foi implementada corretamente, seguindo padrões consistentes e mantendo funcionalidade.

## Pré-requisitos

- [ ] Implementação completa executada
- [ ] Interfaces padronizadas aplicadas

## Tarefas de Validação

### 1. Verificação Técnica

#### Build e Type Checking

```bash
npm run build
npm run type-check
npm run lint
```

#### Verificar Padrão de Nomenclatura

```bash
# Deve retornar ZERO resultados (nomenclaturas inconsistentes removidas)
grep -r "interface.*Properties\|interface.*IProps" src/components/ --include="*.tsx" | wc -l

# Verificar se padrão ComponentNameProps foi aplicado
grep -r "interface.*Props" src/components/ --include="*.tsx" | head -10
```

#### Verificar Props Inline Migradas

```bash
# Deve ter reduzido significativamente
grep -r "React\.FC<{" src/components/ --include="*.tsx" | wc -l

# Props complexas devem ter interfaces nomeadas
grep -r "React\.FC<{.*}>" src/components/ --include="*.tsx"
```

### 2. Verificação de Consistência

#### Props Comuns Padronizadas

```bash
# Verificar se className está sendo usado consistentemente
grep -r "className\?" src/components/ --include="*.tsx" | head -5

# Verificar se data-testid está sendo aplicado
grep -r "data-testid" src/components/ --include="*.tsx" | head -5
```

#### Documentação JSDoc

```bash
# Verificar se props complexas têm documentação
grep -B5 -A1 "\*.*@param\|/\*\*.*\*/" src/components/ --include="*.tsx" | head -10
```

### 3. Verificação Funcional

#### Teste Manual dos Componentes

- [ ] **Formulários**: ApplicationForm, EnvironmentForm, LocationForm

  - Props são passadas corretamente
  - Callbacks funcionam (onSubmit, onCancel)
  - Estados controlados adequadamente (isSubmitting)

- [ ] **Listas**: ApplicationList, EnvironmentList, LocationList

  - Data props recebidas e renderizadas
  - Callbacks de ação funcionam (onSelect, onDelete)
  - Loading states funcionam

- [ ] **Layout**: Sidebar, Header, Navigation
  - Props de configuração funcionam
  - className customizações aplicadas
  - Estados visuais corretos

#### Verificar IntelliSense/Autocomplete

- [ ] IDE mostra sugestões corretas para props
- [ ] Documentação JSDoc aparece no hover
- [ ] Tipos são inferidos corretamente

### 4. Verificação de Performance

```bash
# Verificar se não há problemas de performance
npm run dev
# Usar React DevTools para verificar re-renders
```

#### Pontos de Atenção

- [ ] Components não re-renderizam desnecessariamente
- [ ] Props são memoizadas adequadamente quando necessário
- [ ] Não há props drilling excessivo

## Critérios de Aceitação Final

### ✅ Nomenclatura Padronizada

- [ ] Todas as interfaces seguem padrão `ComponentNameProps`
- [ ] Não há nomenclaturas inconsistentes (Properties, IProps, etc.)
- [ ] Props inline migradas para interfaces nomeadas

### ✅ Estrutura Consistente

- [ ] Props comuns padronizadas (className, style, data-testid)
- [ ] Documentação JSDoc em props complexas
- [ ] Tipos específicos aplicados (não any/unknown)

### ✅ Funcionalidade Mantida

- [ ] Todos os componentes funcionam como antes
- [ ] Props são passadas e recebidas corretamente
- [ ] TypeScript IntelliSense funciona adequadamente

### ✅ Qualidade de Código

- [ ] Build e type-check passam sem erros
- [ ] Lint não reporta problemas de interface
- [ ] Performance não degradada

## Problemas Comuns e Soluções

### Se Type Check Falhar

1. Verificar se todas as props opcionais têm `?`
2. Verificar se tipos importados estão corretos
3. Verificar se interfaces estão exportadas adequadamente

### Se Funcionalidade Quebrar

1. Verificar se callback props mantêm as mesmas assinaturas
2. Verificar se props obrigatórias não foram marcadas como opcionais
3. Verificar se defaultProps foram atualizadas

### Se Performance Degradar

1. Verificar se props objects não são recriadas a cada render
2. Considerar React.memo para components com props estáveis
3. Verificar se callbacks são memoizados adequadamente

## Exemplos de Validação Bem-Sucedida

### Interface Padronizada

```typescript
// ✅ Exemplo de interface bem estruturada
interface ApplicationFormProps {
  /**
   * Application data for editing (undefined for create mode)
   */
  application?: Application;

  /**
   * Callback fired when form is submitted
   */
  onSubmit: (data: CreateApplicationDto | UpdateApplicationDto) => Promise<void>;

  /**
   * Additional CSS classes
   */
  className?: string;
}
```

### Uso Correto

```typescript
// ✅ Component usando interface padronizada
const ApplicationForm: React.FC<ApplicationFormProps> = ({ application, onSubmit, className }) => {
  // implementação
};
```

## Próximo Passo

Se validação passou:

- Marcar Fase 03 como ✅ **Concluída** no README principal
- Proceder para **Fase 04** (opcional) ou considerar fases críticas completas
