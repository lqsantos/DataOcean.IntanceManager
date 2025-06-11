/**
 * TemplateValueEditor component
 * Editor for YAML values with syntax highlighting and validation
 */

import Editor from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { TemplateValueEditorProps } from './types';
import { updateFieldsFromYaml, validateYamlAgainstSchema } from './utils/yaml-validator';
import { ValidationFeedback } from './ValidationFeedback';

export const TemplateValueEditor: React.FC<TemplateValueEditorProps> = ({
  templateValues,
  blueprintVariables = [],
  onChange,
}) => {
  // Mock translation for now
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'defaultValues.editor.title': 'Default Values Editor',
      'defaultValues.editor.availableVariables': 'Available Variables',
      'defaultValues.editor.resetButton': 'Reset',
      'defaultValues.editor.applyButton': 'Apply Changes',
    };

    return translations[key] || key;
  };
  const [editorContent, setEditorContent] = useState(templateValues.rawYaml);
  const [debouncedContent] = useDebounce(editorContent, 500);
  const [validation, setValidation] = useState({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Function to handle editor content changes
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
    }
  }, []);

  // Validate YAML when debounced content changes
  useEffect(() => {
    if (!debouncedContent) {
      return;
    }

    const validationResult = validateYamlAgainstSchema(debouncedContent, templateValues.fields);

    setValidation({
      isValid: validationResult.isValid,
      errors: validationResult.errors || [],
      warnings: validationResult.warnings || [],
    });

    // If valid, update the template values with new values from YAML
    if (validationResult.isValid && validationResult.document) {
      const updatedFields = updateFieldsFromYaml(templateValues.fields, validationResult.document);

      onChange({
        ...templateValues,
        fields: updatedFields,
        rawYaml: debouncedContent,
      });
    }
  }, [debouncedContent, templateValues, onChange]);

  // Setup completion items for variables
  const handleEditorMount = useCallback(() => {
    setIsEditorReady(true);
  }, []);

  // Reset editor content when template changes
  useEffect(() => {
    setEditorContent(templateValues.rawYaml);
  }, [templateValues.templateId, templateValues.rawYaml]);

  return (
    <Card className="mt-4" data-testid="template-value-editor">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{t('defaultValues.editor.title')}</CardTitle>
          <div>
            <Badge variant="outline" className="mr-2">
              {templateValues.templateName}
            </Badge>
            <Badge variant="secondary">{templateValues.templateVersion}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[400px] rounded-md border" data-testid="monaco-editor-container">
          {!isEditorReady && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <Editor
            height="400px"
            language="yaml"
            value={editorContent}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              folding: true,
              lineNumbers: 'on',
              wordWrap: 'on',
              tabSize: 2,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              suggestOnTriggerCharacters: true,
            }}
          />
        </div>

        {/* Variable Help */}
        {blueprintVariables.length > 0 && (
          <div className="mt-4 text-sm">
            <p className="mb-2 font-medium">{t('defaultValues.editor.availableVariables')}</p>
            <div className="flex flex-wrap gap-2">
              {blueprintVariables.map((variable) => (
                <Badge
                  key={variable.name}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    // Insert variable placeholder at cursor position
                    // This is a simplified version, as actual cursor handling would require editor APIs
                    const placeholder = `{{ .Values.${variable.name} }}`;

                    setEditorContent((prev) => `${prev || ''}\n${placeholder}`);
                  }}
                >
                  {variable.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Validation Feedback */}
        <div className="mt-4">
          <ValidationFeedback errors={validation.errors} warnings={validation.warnings} />
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setEditorContent(templateValues.rawYaml)}
            data-testid="reset-editor-button"
          >
            {t('defaultValues.editor.resetButton')}
          </Button>
          <Button
            disabled={!validation.isValid}
            onClick={() => {
              if (validation.isValid) {
                // Apply changes if valid
                onChange({
                  ...templateValues,
                  rawYaml: editorContent,
                });
              }
            }}
            data-testid="apply-changes-button"
          >
            {t('defaultValues.editor.applyButton')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
