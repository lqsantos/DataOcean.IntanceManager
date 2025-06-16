/**
 * Custom hook for managing typed value configuration
 */

import { useEffect, useMemo, useState } from 'react';

import type { ValueConfiguration } from '@/types/blueprint';

import type { DefaultValueField } from '../types';
import { legacyFieldsToValueConfiguration } from '../ValueConfigurationConverter';

export function useTypedValueConfiguration(
  fields: DefaultValueField[],
  useTypedConfig: boolean,
  onValueConfigChange?: (valueConfig: ValueConfiguration, isFilteredConfig?: boolean) => void
) {
  // State to store the typed configuration when useTypedValueConfiguration=true
  const [valueConfig, setValueConfig] = useState<ValueConfiguration | null>(
    useTypedConfig ? legacyFieldsToValueConfiguration(fields) : null
  );

  // Compute typed config only when fields change
  const computedValueConfig = useMemo(() => {
    if (useTypedConfig) {
      return legacyFieldsToValueConfiguration(fields);
    }

    return null;
  }, [useTypedConfig, fields]);

  // Update local state only when computed config changes
  useEffect(() => {
    if (useTypedConfig && computedValueConfig) {
      // Compare with current state to avoid unnecessary updates
      if (!valueConfig || JSON.stringify(computedValueConfig) !== JSON.stringify(valueConfig)) {
        setValueConfig(computedValueConfig);
      }
    }
  }, [useTypedConfig, computedValueConfig, valueConfig]);

  // Notify parent only when local state changes and we have a handler
  useEffect(() => {
    // Check if we need to notify the parent
    const shouldNotify =
      useTypedConfig && valueConfig && computedValueConfig && onValueConfigChange;

    if (shouldNotify) {
      // Deep comparison to avoid unnecessary updates
      const currentStr = JSON.stringify(valueConfig);
      const computedStr = JSON.stringify(computedValueConfig);

      // Only notify parent if the actual content has changed
      if (currentStr !== computedStr) {
        // Pass false for isFilteredConfig to indicate this is the full config
        onValueConfigChange(valueConfig, false);
      }
    }
  }, [useTypedConfig, valueConfig, onValueConfigChange, computedValueConfig]);

  return {
    valueConfig,
    setValueConfig,
    computedValueConfig,
  };
}
