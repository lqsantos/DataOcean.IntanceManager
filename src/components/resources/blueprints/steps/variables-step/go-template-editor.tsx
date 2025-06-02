'use client';

import { javascript } from '@codemirror/lang-javascript';
import { StreamLanguage } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import CodeMirror from '@uiw/react-codemirror';

interface GoTemplateEditorProps {
  /** Initial value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * CodeMirror editor configured for Go Template syntax
 */
export function GoTemplateEditor({
  value,
  onChange,
  disabled = false,
  placeholder,
}: GoTemplateEditorProps) {
  return (
    <div className="relative rounded-md border">
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={oneDark}
        placeholder={placeholder}
        readOnly={disabled}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          autocompletion: true,
          bracketMatching: true,
          closeBrackets: true,
          highlightActiveLine: true,
        }}
        extensions={[
          javascript(),
          // Custom Go Template syntax highlighting
          StreamLanguage.define({
            name: 'goTemplate',
            token(stream) {
              // Inside {{ ... }} expressions, use JavaScript-like syntax
              if (stream.match('{{')) {
                let depth = 1;

                stream.eatSpace();

                while (!stream.eol()) {
                  // Handle nested braces
                  if (stream.match('{{')) {
                    depth++;
                    continue;
                  }

                  if (stream.match('}}')) {
                    depth--;

                    if (depth === 0) {
                      return 'bracket';
                    }
                    continue;
                  }

                  // Match operators
                  if (stream.match(/[.|]/)) {
                    return 'operator';
                  }

                  // Match variables and functions
                  if (stream.match(/\$?[a-zA-Z_][a-zA-Z0-9_]*/)) {
                    return 'variable';
                  }

                  // Match literals
                  if (stream.match(/"([^"\\]|\\.)*"/)) {
                    return 'string';
                  }

                  if (stream.match(/\d+/)) {
                    return 'number';
                  }

                  stream.next();
                }

                return 'bracket';
              }

              // Outside {{ ... }}, just consume characters
              stream.next();

              return null;
            },
          }),
        ]}
        className="min-h-[200px]"
      />
    </div>
  );
}
