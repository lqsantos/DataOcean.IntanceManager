/**
 * BooleanEditor Component
 * Editor for boolean values with toggle switch
 */

import { useTranslation } from 'react-i18next';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface BooleanEditorProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const BooleanEditor: React.FC<BooleanEditorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation(['blueprints']);

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={value}
        onCheckedChange={onChange}
        disabled={disabled}
        data-testid="boolean-editor-switch"
      />
      <Label className="text-sm">
        {value ? t('booleanEditor.true') : t('booleanEditor.false')}
      </Label>
    </div>
  );
};
