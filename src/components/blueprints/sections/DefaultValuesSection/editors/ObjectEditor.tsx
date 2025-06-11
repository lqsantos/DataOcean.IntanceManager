/**
 * ObjectEditor Component
 * Simple placeholder for object type values
 */

interface ObjectEditorProps {
  disabled?: boolean;
}

export const ObjectEditor: React.FC<ObjectEditorProps> = ({ disabled = false }) => {
  return (
    <div className="text-sm text-muted-foreground" data-testid="object-editor">
      {disabled ? 'Object (from template)' : 'Object (configure individual fields)'}
    </div>
  );
};
