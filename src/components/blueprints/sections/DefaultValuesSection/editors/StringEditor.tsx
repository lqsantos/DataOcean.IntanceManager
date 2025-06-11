/**
 * StringEditor Component
 * Editor for string values with variable interpolation support
 */
import { Variable } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface StringEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  variables?: Array<{ name: string; value: string }>;
}

export const StringEditor: React.FC<StringEditorProps> = ({
  value,
  onChange,
  disabled = false,
  variables = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation(['blueprints']);

  const handleInsertVariable = (varName: string) => {
    onChange(`${value}{{ .Values.${varName} }}`);
    setIsOpen(false);
  };

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-8"
        data-testid="string-editor-input"
      />
      {variables.length > 0 && !disabled && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8" data-testid="variable-button">
              <Variable className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" data-testid="variable-popover">
            <div className="p-2 text-sm font-medium">{t('stringEditor.insertVariable')}</div>
            <div className="max-h-48 overflow-auto" data-testid="variable-list">
              {variables.map((variable) => (
                <Button
                  key={variable.name}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => handleInsertVariable(variable.name)}
                  data-testid={`var-${variable.name}`}
                >
                  {variable.name}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
