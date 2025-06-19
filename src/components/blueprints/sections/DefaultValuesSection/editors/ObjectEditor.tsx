/**
 * ObjectEditor Component
 * Simple placeholder for object type values
 */
import { useTranslation } from 'react-i18next';

interface ObjectEditorProps {
  disabled?: boolean;
}

export const ObjectEditor: React.FC<ObjectEditorProps> = ({ disabled = false }) => {
  const { t } = useTranslation(['blueprints']);

  return (
    <div className="text-sm text-muted-foreground" data-testid="object-editor">
      {disabled ? t('objectEditor.fromTemplate') : t('objectEditor.configureFields')}
    </div>
  );
};
