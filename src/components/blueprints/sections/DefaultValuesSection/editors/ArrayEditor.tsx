/**
 * ArrayEditor Component
 * Simple placeholder for array type values
 */
import { useTranslation } from 'react-i18next';

interface ArrayEditorProps {
  disabled?: boolean;
}

export const ArrayEditor: React.FC<ArrayEditorProps> = ({ disabled = false }) => {
  const { t } = useTranslation(['blueprints']);

  return (
    <div className="text-sm text-muted-foreground" data-testid="array-editor">
      {disabled ? t('arrayEditor.fromTemplate') : t('arrayEditor.editInYaml')}
    </div>
  );
};
