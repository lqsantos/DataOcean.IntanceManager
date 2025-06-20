/**
 * NumberEditor Component
 * Editor for numeric values
 */
import { useState } from 'react';

import { Input } from '@/components/ui/input';

interface NumberEditorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberEditor: React.FC<NumberEditorProps> = ({
  value,
  onChange,
  disabled = false,
  min,
  max,
  step = 1,
}) => {
  const [inputValue, setInputValue] = useState<string>(value.toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    setInputValue(val);

    // Only update if it's a valid number
    if (!isNaN(Number(val))) {
      onChange(Number(val));
    }
  };

  // Format on blur
  const handleBlur = () => {
    const numValue = Number(inputValue);

    if (isNaN(numValue)) {
      // Reset to original value if invalid
      setInputValue(value.toString());
    } else {
      // Format the number and set it
      setInputValue(numValue.toString());
    }
  };

  return (
    <Input
      type="number"
      min={min}
      max={max}
      step={step}
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      className="min-w-32 max-w-48 h-8 w-auto"
      data-testid="number-editor-input"
    />
  );
};
