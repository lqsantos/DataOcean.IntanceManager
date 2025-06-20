/**
 * Constants for Unified Value Column
 * Configuration constants for the new unified value column implementation.
 */

/**
 * Updated column widths for the unified table layout
 * Redistributes space from the removed "defaultValue" column to "value" column
 *
 * Previous layout:
 * - field: 33%, type: 8%, defaultValue: 17%, value: 25%, exposed: 8.5%, overridable: 8.5%
 *
 * New layout:
 * - field: 33%, type: 8%, value: 42% (25% + 17%), exposed: 8.5%, overridable: 8.5%
 */
export const UNIFIED_COLUMN_WIDTHS = {
  field: '33%',
  type: '8%',
  value: '42%', // Expanded to include space from removed defaultValue column
  exposed: '8.5%',
  overridable: '8.5%',
} as const;

/**
 * Visual state configuration for value display
 * Defines icons, colors, and styling for different value states
 */
export const VALUE_STATE_CONFIG = {
  template: {
    icon: '⚪',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-700',
    description: 'Template default value',
  },
  customized: {
    icon: '🔵',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    description: 'Customized blueprint value',
  },
  editing: {
    icon: '🟡',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-900',
    description: 'Currently editing',
  },
  object: {
    icon: '🔷',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    description: 'Complex object',
  },
} as const;

/**
 * Button styling configurations
 * Consistent styling for action buttons across different states
 */
export const BUTTON_STYLES = {
  customize: 'h-5 px-1.5 text-[10px] text-blue-600 hover:bg-blue-50 hover:text-blue-700',
  edit: 'h-5 px-1.5 text-[10px] text-green-600 hover:bg-green-50 hover:text-green-700',
  reset: 'h-5 px-1.5 text-[10px] text-orange-600 hover:bg-orange-50 hover:text-orange-700',
  apply: 'h-5 px-1.5 text-[10px] text-green-600 hover:bg-green-50 hover:text-green-700',
  cancel: 'h-5 px-1.5 text-[10px] text-gray-600 hover:bg-gray-50 hover:text-gray-700',
  resetAll: 'h-5 px-1.5 text-[10px] text-red-600 hover:bg-red-50 hover:text-red-700',
} as const;

/**
 * Validation styling configurations
 * Styling for validation states and feedback
 */
export const VALIDATION_STYLES = {
  valid: {
    borderColor: 'border-green-300',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    icon: '✓',
  },
  error: {
    borderColor: 'border-red-300',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: '✗',
  },
  warning: {
    borderColor: 'border-amber-300',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: '⚠',
  },
  validating: {
    borderColor: 'border-blue-300',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: '⏳',
  },
} as const;

/**
 * Animation and transition configurations
 * Consistent animations for state changes
 */
export const ANIMATION_CONFIG = {
  transition: 'transition-all duration-200 ease-in-out',
  fadeIn: 'animate-in fade-in-0 duration-200',
  fadeOut: 'animate-out fade-out-0 duration-200',
  slideIn: 'animate-in slide-in-from-right-2 duration-200',
  slideOut: 'animate-out slide-out-to-right-2 duration-200',
} as const;

/**
 * Z-index values for layering
 * Ensures proper stacking of UI elements
 */
export const Z_INDEX = {
  tooltip: 50,
  dropdown: 40,
  modal: 30,
  overlay: 20,
  button: 10,
} as const;

/**
 * Debounce and timing configurations
 * Timing constants for user interactions
 */
export const TIMING_CONFIG = {
  validationDebounce: 300, // ms to wait before validating during typing
  tooltipDelay: 500, // ms to wait before showing tooltip
  autoSaveDelay: 1000, // ms to wait before auto-saving (if implemented)
  animationDuration: 200, // ms for UI animations
} as const;

/**
 * Size and spacing configurations
 * Consistent sizing across the unified column
 */
export const SIZE_CONFIG = {
  buttonHeight: 'h-5',
  buttonPadding: 'px-1.5',
  fontSize: 'text-[10px]',
  iconSize: 'h-4 w-4',
  spacing: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  },
} as const;

/**
 * Field input dimensions
 * Consistent sizing for all field editors
 */
export const FIELD_INPUT_CONFIG = {
  width: 'w-full max-w-[280px] min-w-[120px]', // Flexible width with limits to prevent layout distortion
  height: 'h-6',
  fontSize: 'text-xs',
} as const;
