/**
 * ArrayEditor Component
 * Simple placeholder for array type values
 */

interface ArrayEditorProps {
  disabled?: boolean;
}

export const ArrayEditor: React.FC<ArrayEditorProps> = ({ disabled = false }) => {
  return (
    <div className="text-sm text-muted-foreground" data-testid="array-editor">
      {disabled ? 'Array (from template)' : 'Array (edit in YAML view)'}
    </div>
  );
};
