# Fluxo Detalhado de Criação de Blueprints

## Visão Geral

O processo de criação de blueprints no DataOcean Instance Manager é um assistente passo-a-passo que guia o usuário através de 4 etapas principais. Cada etapa coleta informações específicas necessárias para criar um blueprint funcional que pode ser usado para gerar instâncias de aplicações.

## Estrutura do Assistente

### Componente Principal: `BlueprintFormWrapper`

O assistente é controlado pelo componente `BlueprintFormWrapper` que gerencia:

- **Estado atual da etapa** (`currentStep`)
- **Dados do formulário** (`formData`)
- **Validações** (`errors`)
- **Navegação** entre etapas

```typescript
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState({
  name: '',
  description: '',
  selectedTemplates: [],
  blueprintVariables: [],
});
```

---

## Etapa 1: Informações Gerais (`StepGeneralInfo`)

### Objetivo

Coletar informações básicas sobre o blueprint.

### Campos do Formulário

1. **Nome do Blueprint** _(obrigatório)_

1. Campo de texto livre
1. Exemplo: "E-commerce Platform"
1. Validação: Não pode estar vazio

1. **Descrição** _(obrigatório)_

1. Campo de texto longo (textarea)
1. Exemplo: "Plataforma completa de e-commerce com frontend, backend e banco de dados"
1. Validação: Não pode estar vazio

### Validações

```typescript
if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
```

### Interface Visual

- Tooltips explicativos para cada campo
- Validação em tempo real com mensagens de erro
- Campos obrigatórios claramente marcados

---

## Etapa 2: Associação de Templates (`StepTemplateSelection`)

### Objetivo

Selecionar e configurar os templates que farão parte do blueprint.

### Layout da Interface

A interface é dividida em duas colunas:

#### Coluna Esquerda: Catálogo de Templates

- **Busca**: Campo para filtrar templates por nome, descrição ou categoria
- **Filtros por Categoria**: Botões para filtrar por tipo (Backend, Frontend, Database, etc.)
- **Lista de Templates**: Cards com informações de cada template disponível

#### Coluna Direita: Templates Selecionados

- **Lista de Selecionados**: Templates que farão parte do blueprint
- **Drag & Drop**: Suporte para reordenação dos templates
- **Configuração de Alias**: Cada template recebe um identificador único

### Processo de Seleção

1. **Visualização do Catálogo**

```typescript
// Cada template exibe:
{
  name: "PostgreSQL Template",
  category: "Database",
  version: "1.2.0",
  description: "Template para banco PostgreSQL",
  repository: "https://repo.git",
  path: "/charts/postgres"
}
```

2. **Adição de Template**

1. Usuário clica em "Adicionar" ou arrasta o template
1. Modal de configuração de alias é aberto
1. Sistema sugere um alias baseado no nome do template

1. **Configuração de Alias**

```typescript
// Exemplo de alias sugerido
let baseAlias = template.name.toLowerCase().replace(/\s+/g, '-');
// "PostgreSQL Template" → "postgresql-template"

// Se já existe, adiciona número
if (existingCount > 0) {
  baseAlias = `${baseAlias}-${existingCount + 1}`;
}
```

4. **Validação de Duplicatas**

```typescript
// Verifica identificadores únicos
const identifiers = formData.selectedTemplates.map((t) => t.identifier);
const uniqueIdentifiers = new Set(identifiers);
if (uniqueIdentifiers.size !== identifiers.length) {
  newErrors.identifiers = 'Existem identificadores duplicados';
}
```

### Funcionalidades Avançadas

- **Drag & Drop**: Reordenação visual dos templates selecionados
- **Busca Inteligente**: Filtro por múltiplos critérios
- **Validação em Tempo Real**: Verificação de duplicatas e conflitos

---

## Etapa 3: Blueprint Variables (`StepBlueprintVariables`)

### Objetivo

Definir variáveis reutilizáveis que serão usadas nos templates do blueprint.

### Tipos de Variáveis

#### 1. Variáveis de Valor Fixo (`type: "simple"`)

- **Uso**: Valores estáticos que não mudam
- **Exemplo**:

```yaml
helper.app_name: 'my-application'
helper.environment: 'production'
```

#### 2. Variáveis de Expressão Avançada (`type: "advanced"`)

- **Uso**: Expressões Go Template com lógica condicional
- **Exemplo**:

```go
{{- if eq .Values.environment "production" -}}
prod-app
{{- else -}}
dev-app
{{- end -}}
```

### Interface de Criação

#### Seleção do Tipo de Variável

```typescript
// Menu dropdown para escolher o tipo
<DropdownMenu>
  <DropdownMenuItem onClick={() => handleVariableTypeSelect("simple")}>
    <TextQuote className="h-4 w-4 mr-2" />
    Valor Fixo
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => handleVariableTypeSelect("advanced")}>
    <Braces className="h-4 w-4 mr-2" />
    Expressão Avançada
  </DropdownMenuItem>
</DropdownMenu>
```

#### Formulário de Variável

1. **Nome da Variável**

1. Formato recomendado: `helper.nome_da_variavel`
1. Exemplo: `helper.app_name`, `helper.database_host`

1. **Valor/Expressão**

1. Para valores fixos: campo de texto simples
1. Para expressões: editor de código com syntax highlighting

1. **Descrição** _(opcional)_

1. Documentação sobre o propósito da variável

### Preview do helper.tpl

A interface mostra um preview em tempo real do arquivo `helper.tpl` que será gerado:

```go
{{/* Nome da aplicação */}}
{{- define "helper.app_name" -}}
my-application
{{- end }}

{{/* Configuração de ambiente */}}
{{- define "helper.environment_config" -}}
{{- if eq .Values.environment "production" -}}
prod-config
{{- else -}}
dev-config
{{- end -}}
{{- end }}
```

### Validações

```typescript
// Verificar nomes duplicados
const variableNames = formData.blueprintVariables.map((v) => v.name);
const uniqueNames = new Set(variableNames);
if (uniqueNames.size !== variableNames.length) {
  newErrors.variables = 'Existem nomes de variáveis duplicados';
}

// Verificar sintaxe Go Template
formData.blueprintVariables.forEach((variable) => {
  const openBraces = (variable.value.match(/{{/g) || []).length;
  const closeBraces = (variable.value.match(/}}/g) || []).length;
  if (openBraces !== closeBraces) {
    newErrors[variable.name] = 'Chaves não fechadas na expressão';
  }
});
```

---

## Etapa 4: Resumo e Confirmação (`StepConfirmation`)

### Objetivo

Apresentar um resumo completo do blueprint e validar sua integridade antes da criação.

### Seções do Resumo

#### 1. Informações Gerais

```typescript
<Card>
  <CardTitle>Informações Gerais</CardTitle>
  <CardContent>
    <div>Nome: {formData.name}</div>
    <div>Descrição: {formData.description}</div>
  </CardContent>
</Card>
```

#### 2. Templates Associados

```typescript
<Card>
  <CardTitle>Templates Associados</CardTitle>
  <CardDescription>{formData.selectedTemplates.length} templates</CardDescription>
  <CardContent>
    {formData.selectedTemplates.map(template => (
      <div key={template.id}>
        <span>{template.name}</span>
        <Badge>{template.identifier}</Badge>
        <span>{template.category}</span>
      </div>
    ))}
  </CardContent>
</Card>
```

#### 3. Blueprint Variables

```typescript
<Card>
  <CardTitle>Blueprint Variables</CardTitle>
  <CardDescription>{formData.blueprintVariables.length} variáveis</CardDescription>
  <CardContent>
    {formData.blueprintVariables.map(variable => (
      <Badge key={variable.name}>{variable.name}</Badge>
    ))}
  </CardContent>
</Card>
```

### Sistema de Validação Integrado

#### Validações Automáticas

1. **Verificação de Variáveis Duplicadas**

```typescript
const variableNames = formData.blueprintVariables.map((v) => v.name);
const uniqueNames = new Set(variableNames);
if (uniqueNames.size !== variableNames.length) {
  validations.push({
    type: 'error',
    message: 'Existem nomes de variáveis duplicados',
  });
}
```

2. **Validação de Sintaxe Go Template**

```typescript
formData.blueprintVariables.forEach((variable) => {
  const openBraces = (variable.value.match(/{{/g) || []).length;
  const closeBraces = (variable.value.match(/}}/g) || []).length;
  if (openBraces !== closeBraces) {
    validations.push({
      type: 'error',
      message: `Variável "${variable.name}" tem chaves não fechadas`,
    });
  }
});
```

3. **Verificação de Templates**

```typescript
if (formData.selectedTemplates.length === 0) {
  validations.push({
    type: 'error',
    message: 'Nenhum template selecionado',
  });
}
```

4. **Verificação de Identificadores Únicos**

```typescript
const identifiers = formData.selectedTemplates.map((t) => t.identifier);
const uniqueIdentifiers = new Set(identifiers);
if (uniqueIdentifiers.size !== identifiers.length) {
  validations.push({
    type: 'error',
    message: 'Existem identificadores duplicados',
  });
}
```

#### Tipos de Validação

1. **Erros** (`type: "error"`)

1. Impedem a criação do blueprint
1. Exibidos com ícone vermelho de alerta
1. Usuário deve corrigir antes de prosseguir

1. **Avisos** (`type: "warning"`)

1. Não impedem a criação
1. Exibidos com ícone amarelo de atenção
1. Exemplo: "Nenhuma variável definida"

1. **Sucesso** (`type: "success"`)

1. Exibido quando todas as validações passam
1. Ícone verde de confirmação
1. Mensagem: "Blueprint válido e pronto para uso"

### Interface de Validação

```typescript
<Card>
  <CardTitle>Validação do Blueprint</CardTitle>
  <CardContent>
    {validations.map((validation, index) => (
      <Alert key={index} variant={validation.type}>
        {validation.type === "error" ? (
          <AlertTriangle className="h-4 w-4" />
        ) : validation.type === "warning" ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        <AlertDescription>
          {validation.message}
          <Badge variant={validation.type}>
            {validation.type === "error" ? "Erro" :
             validation.type === "warning" ? "Aviso" : "Sucesso"}
          </Badge>
        </AlertDescription>
      </Alert>
    ))}
  </CardContent>
</Card>
```

---

## Navegação e Controles

### Barra de Progresso

```typescript
// Indicador visual do progresso
<div className="flex items-center gap-1">
  {Array.from({ length: totalSteps }).map((_, index) => (
    <div
      key={index}
      className={`h-1.5 w-8 rounded-full transition-colors ${
        index < currentStep ? "bg-primary" : "bg-muted"
      }`}
    />
  ))}
  <span className="text-xs text-muted-foreground ml-2">
    {currentStep}/{totalSteps}
  </span>
</div>
```

### Botões de Navegação

#### Validação por Etapa

```typescript
const validateStep = (step: number) => {
  const newErrors: Record<string, string> = {};

  switch (step) {
    case 1:
      if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
      if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
      break;
    case 2:
      if (formData.selectedTemplates.length === 0) {
        newErrors.templates = 'Selecione pelo menos um template';
      }
      // Verificar identificadores duplicados
      break;
    case 3:
      // Verificar variáveis duplicadas
      break;
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

#### Controles de Navegação

```typescript
<div className="flex items-center justify-between pt-3 border-t">
  <Button variant="outline" onClick={onCancel}>
    Cancelar
  </Button>

  <div className="flex items-center gap-2">
    {currentStep > 1 && (
      <Button variant="outline" onClick={handlePrevious}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        Anterior
      </Button>
    )}

    {currentStep < totalSteps ? (
      <Button onClick={handleNext}>
        Próximo
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    ) : (
      <Button onClick={handleSubmit}>
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Criar Blueprint
      </Button>
    )}
  </div>
</div>
```

---

## Finalização e Criação

### Processo de Salvamento

```typescript
const handleSubmit = () => {
  if (validateStep(currentStep)) {
    // Criar objeto blueprint final
    const newBlueprint = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      instancesCount: 0,
      status: 'active',
      templatesCount: formData.selectedTemplates.length,
    };

    onSave(newBlueprint);
  }
};
```

### Estrutura Final do Blueprint

```typescript
interface Blueprint {
  id: number;
  name: string;
  description: string;
  selectedTemplates: Array<{
    id: number;
    name: string;
    identifier: string;
    category: string;
    repository: string;
    path: string;
  }>;
  blueprintVariables: Array<{
    name: string;
    value: string;
    description?: string;
    type: 'simple' | 'advanced';
  }>;
  createdAt: string;
  instancesCount: number;
  status: 'active' | 'inactive';
  templatesCount: number;
}
```

---

## Benefícios do Fluxo

1. **Validação Progressiva**: Cada etapa é validada antes de avançar
2. **Feedback Visual**: Indicadores claros de progresso e status
3. **Flexibilidade**: Possibilidade de voltar e editar etapas anteriores
4. **Prevenção de Erros**: Validações em tempo real e verificações finais
5. **Experiência Guiada**: Interface intuitiva que conduz o usuário
6. **Reutilização**: Blueprints criados podem ser usados para múltiplas instâncias

Este fluxo garante que os blueprints sejam criados de forma consistente e completa, com todas as informações necessárias para gerar instâncias funcionais de aplicações.
