import { Editor } from '@monaco-editor/react';

interface MonacoExpressionEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  availableVariables?: string[];
  readOnly?: boolean;
  height?: string;
}

/**
 * Registra suporte para linguagem Go Template
 */
function registerGoTemplateLanguage(monaco: any) {
  // Verificar se já foi registrado
  if ((window as any).goTemplateRegistered) {
    return;
  }

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

export function MonacoExpressionEditor({
  value,
  onChange,
  availableVariables = [],
  readOnly = false,
  height = '200px',
}: MonacoExpressionEditorProps) {
  // Configurar editor quando montado
  function handleEditorDidMount(editor: any, monaco: any) {
    // Registrar linguagem Go Template
    registerGoTemplateLanguage(monaco);

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
}
