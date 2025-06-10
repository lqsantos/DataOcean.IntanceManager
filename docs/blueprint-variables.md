# Blueprint Variables: Guia de Implementação

## Visão Geral

As Blueprint Variables são elementos fundamentais na criação de blueprints dinâmicos no DataOcean.InstanceManager. Esta documentação detalha a abordagem de refatoração para melhorar a usabilidade, performance e manutenção da seção de variáveis na nova interface baseada em seções do fluxo de criação de blueprints.

Cada variável é definida como uma expressão Go Template, que pode ser tanto um valor simples (como uma string constante) quanto uma expressão complexa com lógica condicional, loops ou referências a outras variáveis. Esta abordagem unificada simplifica o modelo de dados e a interface do usuário, mantendo toda a flexibilidade necessária.

## Objetivos da Refatoração

- Migrar de interface em wizard para uma seção dedicada em página
- Melhorar a experiência de edição de variáveis com um editor moderno
- Simplificar e tornar mais intuitiva a gestão de variáveis
- Implementar validação em tempo real e f // No componente VariablesList
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
  const variable = variables[index];
  return (
  <div style={style} className="variable-row">
  <span>{variable.name}</span>
  <span>{variable.description}</span>
  <button onClick={() => onEdit(variable)}>Edit</button>
  </div>
  );
  };antâneo
- Fornecer recursos avançados para expressões Go Template

## Estrutura da Interface

A interface de variáveis será composta por dois componentes principais:

1. **Lista de Variáveis** - Visão tabular de todas as variáveis definidas
2. **Editor Modal** - Interface para criação e edição de variáveis individuais

### Lista de Variáveis

```
┌─ Variables Section ─────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─ Controls ─────────────────────────────────────────────────────────┐ │
│  │ [+ Add Variable]  [Search...]  [Sort By: Name ▼]                   │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌─ Variable List ──────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  ┌─ Variable Row ────────────────────────────────────────────┐   │   │
│  │  │ app_name        │ Defines application name              │ ⋮ │   │
│  │  └────────────────────────────────────────────────────────────┘   │   │
│  │                                                                  │   │
│  │  ┌─ Variable Row ────────────────────────────────────────────┐   │   │
│  │  │ namespace       │ Kubernetes namespace                   │ ⋮ │   │
│  │  └────────────────────────────────────────────────────────────┘   │   │
│  │                                                                  │   │
│  │  ┌─ Variable Row ────────────────────────────────────────────┐   │   │
│  │  │ db_host         │ Database hostname                     │ ⋮ │   │
│  │  └────────────────────────────────────────────────────────────┘   │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Editor Modal

```
┌─ Variable Editor Modal ───────────────────────────────────────────────┐
│                                                                       │
│  Edit Variable                                                [X]     │
│  ────────────────────────────────────────────────────────────────     │
│                                                                       │
│  Name:                                                                │
│  [variable_name_______________________________]                       │
│                                                                       │
│  Expression:                                                          │
│                                                                       │
│                                                                       │
│  Value:                                                               │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │ {{- if eq .Values.env "prod" -}}                            │     │
│  │ app-production                                               │     │
│  │ {{- else -}}                                                │     │
│  │ app-${ environment }                                        │     │
│  │ {{- end -}}                                                 │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                 [Show syntax help]                    │
│                                                                       │
│  Description:                                                         │
│  [Application name with environment suffix________________]           │
│                                                                       │
│  [Delete Variable]                     [Cancel] [Save Variable]       │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## Definição de Componentes

### 1. VariablesSection

Componente principal que gerencia a seção de variáveis e coordena os subcomponentes.

**Responsabilidades:**

- Gerenciar o estado de todas as variáveis
- Controlar a exibição do modal de edição
- Implementar funções de pesquisa e ordenação
- Sincronizar dados com o contexto global do blueprint

**Estado:**

- Lista de variáveis
- Estado do modal (aberto/fechado)
- Variável em edição atual
- Critérios de filtragem e ordenação

### 2. VariableList

Componente de exibição para a lista de variáveis disponíveis.

**Responsabilidades:**

- Renderizar a lista de variáveis de forma eficiente
- Implementar virtualização para performance com muitas variáveis
- Exibir indicadores visuais para variáveis com sintaxe complexa
- Fornecer ações contextuais para cada variável

**Props:**

- `variables`: Array de objetos de variável
- `onEdit`: Callback para edição de variável
- `onDelete`: Callback para exclusão de variável
- `onDuplicate`: Callback para duplicação de variável
- `sortBy`: Critério de ordenação
- `filterText`: Texto para filtragem

### 3. VariableEditor

Modal para edição detalhada de uma variável individual.

**Responsabilidades:**

- Fornecer interface para edição de propriedades da variável
- Implementar validação de nomes de variáveis
- Gerenciar o editor Monaco para expressões
- Validar sintaxe de expressões em tempo real

**Props:**

- `variable`: Objeto da variável sendo editada
- `existingVariables`: Lista de variáveis existentes para validação
- `onSave`: Callback para salvar alterações
- `onCancel`: Callback para cancelar edição
- `onDelete`: Callback para excluir variável

### 4. MonacoExpressionEditor

Componente especializado para edição de expressões Go Template usando Monaco Editor.

**Responsabilidades:**

- Configurar o Monaco Editor para Go Template
- Implementar syntax highlighting personalizado
- Fornecer autocompletar para variáveis e funções
- Validar expressões sintaticamente em tempo real

**Props:**

- `value`: Expressão atual
- `onChange`: Callback para alterações
- `availableVariables`: Lista de variáveis existentes para autocompletar
- `height`: Altura do editor
- `readOnly`: Modo somente leitura

## Modelos de Dados

### Variable

```typescript
interface BlueprintVariable {
  id: string; // Identificador único
  name: string; // Nome da variável (ex: "app_name")
  value: string; // Expressão Go Template (pode ser um valor simples ou complexo)
  description?: string; // Descrição opcional
  isValid: boolean; // Estado de validação
  validationError?: string; // Mensagem de erro se inválida
}
```

## Implementação do Monaco Editor

### Configuração da Sintaxe Go Template

O Monaco Editor será configurado com suporte personalizado para sintaxe Go Template, incluindo highlighting, validação e autocompletion.

```typescript
// Registra suporte para linguagem Go Template
export function registerGoTemplateLanguage() {
  // Verificar se já foi registrado
  if ((window as any).goTemplateRegistered) return;

  const monaco = (window as any).monaco;
  if (!monaco) return; // Esperar Monaco carregar

  // Registrar a linguagem
  monaco.languages.register({ id: 'go-template' });

  // Definir cores e tokens
  monaco.languages.setMonarchTokensProvider('go-template', {
    tokenizer: {
      root: [
        // Delimitadores Go Template
        [/{{-?/, 'delimiter.go-template'],
        [/-?}}/, 'delimiter.go-template'],

        // Variáveis de interpolação
        [/\$\{/, { token: 'delimiter.interpolation', next: 'interpolation' }],

        // Palavras-chave
        [/\b(if|else|end|range|template|define|block|with)\b/, 'keyword'],

        // Funções
        [/\b(eq|ne|lt|gt|le|ge|and|or|not)\b/, 'keyword.function'],

        // Operadores
        [/[=!<>]=?/, 'operator'],

        // Identificadores
        [/\.[a-zA-Z_][\w.]*/, 'variable'],
        [/[a-zA-Z_][\w]*/, 'identifier'],

        // Números e strings
        [/\d+/, 'number'],
        [/"[^"]*"/, 'string'],
        [/'[^']*'/, 'string'],
      ],

      interpolation: [
        [/}/, { token: 'delimiter.interpolation', next: '@pop' }],
        [/[a-zA-Z_][\w.]*/, 'variable'],
        [/\./, 'delimiter'],
      ],
    },
  });

  // Configuração de brackets
  monaco.languages.setLanguageConfiguration('go-template', {
    brackets: [
      ['{', '}'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
  });

  (window as any).goTemplateRegistered = true;
}
```

### Componente MonacoExpressionEditor

```tsx
import React, { useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { registerGoTemplateLanguage } from './monaco-go-template';

interface MonacoExpressionEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  availableVariables?: string[];
  readOnly?: boolean;
  height?: string;
}

export const MonacoExpressionEditor: React.FC<MonacoExpressionEditorProps> = ({
  value,
  onChange,
  availableVariables = [],
  readOnly = false,
  height = '200px',
}) => {
  // Registrar linguagem Go Template
  useEffect(() => {
    registerGoTemplateLanguage();
  }, []);

  // Configurar editor quando montado
  function handleEditorDidMount(editor: any, monaco: any) {
    // Adicionar sugestões para variáveis existentes
    monaco.languages.registerCompletionItemProvider('go-template', {
      provideCompletionItems: () => {
        return {
          suggestions: availableVariables.map((variable) => ({
            label: variable,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: variable,
            detail: `Variable: ${variable}`,
          })),
        };
      },
    });

    // Adicionar snippets comuns
    monaco.languages.registerCompletionItemProvider('go-template', {
      provideCompletionItems: () => {
        return {
          suggestions: [
            {
              label: 'if-else',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: [
                '{{- if ${1:condition} -}}',
                '${2:value_if_true}',
                '{{- else -}}',
                '${3:value_if_false}',
                '{{- end -}}',
              ].join('\n'),
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: 'If-else condition',
            },
            {
              label: 'range',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: ['{{- range ${1:items} -}}', '${2:value}', '{{- end -}}'].join('\n'),
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: 'Range loop',
            },
            // Adicionar mais snippets conforme necessário
          ],
        };
      },
    });

    // Validação básica de sintaxe
    editor.onDidChangeModelContent(() => {
      const content = editor.getValue();
      // Implementar validação de sintaxe Go Template
      // Esta é uma validação básica de parênteses
      const openingBraces = (content.match(/{{-?/g) || []).length;
      const closingBraces = (content.match(/-?}}/g) || []).length;

      const markers = [];
      if (openingBraces !== closingBraces) {
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          message: 'Unbalanced template delimiters',
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: editor.getModel().getLineCount(),
          endColumn: 1,
        });
      }

      monaco.editor.setModelMarkers(editor.getModel(), 'go-template-validation', markers);
    });
  }

  return (
    <Editor
      height={height}
      language="go-template"
      value={value}
      options={{
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        readOnly,
        automaticLayout: true,
        suggestOnTriggerCharacters: true,
      }}
      onChange={onChange}
      onMount={handleEditorDidMount}
    />
  );
};
```

## Fluxo de Validação

### Validação de Nomes de Variáveis

- Unicidade: Não permitir nomes duplicados
- Formato: Seguir o padrão permitido de nomes (alfanuméricos e \_)

### Validação de Expressões

- Sintaxe Go Template: Verificar delimitadores balanceados e sintaxe básica
- Referências circulares: Detectar se variáveis formam ciclos de dependência
- Referência a variáveis inexistentes: Alertar quando uma expressão referencia variáveis não definidas

> **Nota:** A validação nesta fase é puramente sintática, sem avaliar o resultado da expressão. A avaliação completa das expressões com os valores reais (.Values) só ocorrerá na seção de Preview, quando todos os elementos necessários estiverem disponíveis.

## Integração com Contexto Global

A seção de variáveis irá se integrar ao contexto global do blueprint através do `BlueprintFormContext`:

```typescript
// Atualização do contexto para suportar a nova interface de variáveis
interface BlueprintFormContextType {
  // ...outros campos existentes

  variables: BlueprintVariable[];
  addVariable: (variable: Omit<BlueprintVariable, 'id'>) => void;
  updateVariable: (id: string, data: Partial<BlueprintVariable>) => void;
  deleteVariable: (id: string) => void;
  validateVariables: () => boolean;
  getVariableByName: (name: string) => BlueprintVariable | undefined;
}
```

## Hooks Personalizados

### useBlueprintVariables

Hook personalizado para gerenciar as operações de variáveis de blueprint:

```typescript
import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BlueprintVariable } from '../types/blueprint';

export function useBlueprintVariables(initialVariables: BlueprintVariable[] = []) {
  const [variables, setVariables] = useState<BlueprintVariable[]>(initialVariables);

  // Adicionar nova variável
  const addVariable = useCallback((variable: Omit<BlueprintVariable, 'id'>) => {
    const newVariable = {
      ...variable,
      id: uuidv4(),
      isValid: true,
    };

    setVariables(prev => [...prev, newVariable]);
    return newVariable.id;
  }, []);

  // Atualizar variável existente
  const updateVariable = useCallback((id: string, data: Partial<BlueprintVariable>) => {
    setVariables(prev =>
      prev.map(variable =>
        variable.id === id ? { ...variable, ...data } : variable
      )
    );
  }, []);

  // Excluir variável
  const deleteVariable = useCallback((id: string) => {
    setVariables(prev => prev.filter(variable => variable.id !== id));
  }, []);

  // Validar todas as variáveis
  const validateVariables = useCallback(() => {
    let allValid = true;

    // Verificar nomes duplicados
    const names = new Set<string>();

    const updatedVariables = variables.map(variable => {
      const validationResults = validateVariable(variable, variables);

      if (!validationResults.isValid) {
        allValid = false;
      }

      if (names.has(variable.name)) {
        validationResults.isValid = false;
        validationResults.validationError = 'Duplicate variable name';
        allValid = false;
      } else {
        names.add(variable.name);
      }

      return {
        ...variable,
        isValid: validationResults.isValid,
        validationError: validationResults.validationError
      };
    });

    setVariables(updatedVariables);
    return allValid;
  }, [variables]);

  // Funções auxiliares
  const getVariableByName = useCallback(
    (name: string) => variables.find(v => v.name === name || v.fullName === name),
    [variables]
  );

  return {
    variables,
    addVariable,
    updateVariable,
    deleteVariable,
    validateVariables,
    getVariableByName,
  };
}

// Função auxiliar para validação de variável individual
function validateVariable(
  variable: BlueprintVariable,
  allVariables: BlueprintVariable[]
): { isValid: boolean; validationError?: string } {
  // Validar nome
  if (!variable.name || variable.name.trim() === '') {
    return { isValid: false, validationError: 'Name is required' };
  }

  // Validar formato do nome
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(variable.name)) {
    return {
      isValid: false,
      validationError: 'Name must start with letter and contain only letters, numbers and underscores'
    };
  }

  // Validar valor
  if (!variable.value || variable.value.trim() === '') {
    return { isValid: false, validationError: 'Value is required' };
  }

  // Validação de sintaxe Go Template (para expressões complexas)
  // Verificar delimitadores balanceados (simplificado)
  const openingBraces = (variable.value.match(/{{-?/g) || []).length;
  const closingBraces = (variable.value.match(/-?}}/g) || []).length;

  if (openingBraces !== closingBraces) {
    return { isValid: false, validationError: 'Unbalanced template delimiters' };
  }

  // Detectar referências circulares (implementação simplificada)
  // Uma implementação mais robusta usaria um algoritmo de detecção de ciclos em grafos
  if (variable.value.includes(`${ ${variable.name} }`)) {
    return { isValid: false, validationError: 'Self-referential variable' };
  }

  return { isValid: true };
}
```

## Exemplo de Uso

```tsx
import React, { useState } from 'react';
import { VariablesList } from './VariablesList';
import { VariableEditor } from './VariableEditor';
import { useBlueprintVariables } from '../../hooks/use-blueprint-variables';
import { BlueprintVariable } from '../../types/blueprint';

export const VariablesSection: React.FC = () => {
  const { variables, addVariable, updateVariable, deleteVariable, validateVariables } =
    useBlueprintVariables();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVariable, setCurrentVariable] = useState<BlueprintVariable | null>(null);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'type'>('name');

  // Abrir modal para edição
  const handleEditVariable = (variable: BlueprintVariable) => {
    setCurrentVariable(variable);
    setIsModalOpen(true);
  };

  // Abrir modal para nova variável
  const handleAddVariable = () => {
    setCurrentVariable(null);
    setIsModalOpen(true);
  };

  // Salvar alterações de variável
  const handleSaveVariable = (variable: BlueprintVariable) => {
    if (currentVariable?.id) {
      updateVariable(currentVariable.id, variable);
    } else {
      addVariable(variable);
    }
    setIsModalOpen(false);
  };

  // Filtrar e ordenar variáveis
  const filteredVariables = variables
    .filter(
      (v) =>
        searchText === '' ||
        v.name.toLowerCase().includes(searchText.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return a.type.localeCompare(b.type);
      }
    });

  return (
    <div className="variables-section">
      <div className="controls">
        <button onClick={handleAddVariable}>+ Add Variable</button>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'type')}>
          <option value="name">Sort by Name</option>
          <option value="type">Sort by Type</option>
        </select>
      </div>

      <VariablesList
        variables={filteredVariables}
        onEdit={handleEditVariable}
        onDelete={deleteVariable}
      />

      {isModalOpen && (
        <VariableEditor
          variable={currentVariable}
          existingVariables={variables}
          onSave={handleSaveVariable}
          onCancel={() => setIsModalOpen(false)}
          onDelete={currentVariable ? () => deleteVariable(currentVariable.id) : undefined}
        />
      )}
    </div>
  );
};
```

## Considerações de Implementação

### Instalação de Dependências

Adicionar ao package.json:

```json
{
  "dependencies": {
    "@monaco-editor/react": "^4.4.6"
  }
}
```

### Otimizações de Performance

1. **Virtualização da Lista**: Utilizar `react-window` para renderização eficiente de listas longas

```tsx
import { FixedSizeList } from 'react-window';

// Dentro do componente VariablesList
const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
  const variable = variables[index];
  return (
    <div style={style} className="variable-row">
      <span>{variable.fullName}</span>
      <span>{variable.type}</span>
      <span>{variable.description}</span>
      <button onClick={() => onEdit(variable)}>Edit</button>
    </div>
  );
};

return (
  <FixedSizeList height={400} width="100%" itemCount={variables.length} itemSize={50}>
    {Row}
  </FixedSizeList>
);
```

2. **Carregamento Lazy do Monaco Editor**: Carregar apenas quando necessário

```tsx
import { lazy, Suspense } from 'react';

const MonacoExpressionEditor = lazy(() =>
  import('./MonacoExpressionEditor').then((module) => ({
    default: module.MonacoExpressionEditor,
  }))
);

// No componente VariableEditor
{
  variable.type === 'advanced' && (
    <Suspense fallback={<div>Loading editor...</div>}>
      <MonacoExpressionEditor
        value={variable.value}
        onChange={handleValueChange}
        availableVariables={existingVariables.map((v) => v.fullName)}
      />
    </Suspense>
  );
}
```

### Testes

Exemplos de testes para os componentes principais:

```tsx
// VariablesList.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VariablesList } from './VariablesList';

describe('VariablesList', () => {
  const mockVariables = [
    {
      id: '1',
      name: 'app_name',
      value: 'my-app',
      description: 'Application name',
      isValid: true,
    },
    {
      id: '2',
      name: 'namespace',
      value: '{{- if eq .Values.env "prod" -}}prod-namespace{{- else -}}dev-namespace{{- end -}}',
      description: 'Kubernetes namespace',
      isValid: true,
    },
  ];

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  it('renders all variables correctly', () => {
    render(<VariablesList variables={mockVariables} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText('app_name')).toBeInTheDocument();
    expect(screen.getByText('namespace')).toBeInTheDocument();
    expect(screen.getByText('Application name')).toBeInTheDocument();
    expect(screen.getByText('Kubernetes namespace')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    render(<VariablesList variables={mockVariables} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await userEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockVariables[0]);
  });
});
```

## Plano de Implementação

### Fase 1: Infraestrutura Básica

1. Configurar Monaco Editor com suporte a Go Template
2. Implementar os componentes VariablesList e o modal VariableEditor
3. Criar o hook useBlueprintVariables para gerenciamento de estado

### Fase 2: Validação e Suporte Avançado

1. Implementar validação de variáveis em tempo real
2. Adicionar suporte a autocompletar e snippets no editor
3. Integrar com o contexto global do blueprint

### Fase 3: Refinamentos e Otimizações

1. Adicionar suporte a pesquisa e ordenação
2. Implementar virtualização para performance
3. Melhorar feedback visual e tratamento de erros

## Conclusão

Esta implementação da seção de variáveis proporcionará:

1. **Melhor usabilidade** através de uma interface intuitiva
2. **Editor avançado** com recursos como syntax highlighting e autocompletar
3. **Validação em tempo real** reduzindo erros e aumentando produtividade
4. **Maior escalabilidade** para lidar com blueprints complexos
5. **Integração perfeita** com o fluxo baseado em seções

A abordagem baseada no Monaco Editor permite uma experiência de edição robusta para expressões Go Template, facilitando a criação de blueprints dinâmicos e configuráveis.
