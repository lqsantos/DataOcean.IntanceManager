/**
 * Hook para gerenciamento das funcionalidades de campo
 * Encapsula toda a lógica de manipulação de campos (exposed, override, propagação, etc.)
 */

import { useCallback } from 'react';

import type { ValueConfiguration } from '@/types/blueprint';

import type { DefaultValueField, TemplateDefaultValues } from '../../types';
import { ValueSourceType } from '../../types';
import { valueConfigurationToLegacyFields } from '../../ValueConfigurationConverter';
import * as FieldService from '../fieldUpdateService';
import {
  propagateChildrenStatesToParents,
  propagateChildrenStatesToParentsTraditional,
  propagateExposedToAncestors,
  propagateExposedToAncestorsTraditional,
  propagateOverrideToAncestors,
  propagateOverrideToAncestorsTraditional,
} from '../utils/propagationUtils';
import * as ValueConfigFieldService from '../valueConfigFieldUpdateService';

interface UseFieldManagementProps {
  templateValues: TemplateDefaultValues;
  valueConfiguration: ValueConfiguration | null;
  useTypedValueConfiguration: boolean;
  onValueConfigurationChange?: (updatedConfig: ValueConfiguration) => void;
  onChange: (updatedTemplateValues: TemplateDefaultValues) => void;
  onTogglePropagation?: (
    field: DefaultValueField,
    action: 'expose' | 'override',
    value: boolean
  ) => { fieldPath: string; childPaths: string[] } | undefined;
}

export function useFieldManagement({
  templateValues,
  valueConfiguration,
  useTypedValueConfiguration,
  onValueConfigurationChange,
  onChange,
  onTogglePropagation,
}: UseFieldManagementProps) {
  // Função auxiliar para encontrar um campo pelo caminho
  const findFieldByPath = useCallback(
    (fieldsToSearch: DefaultValueField[], pathSegments: string[]): DefaultValueField | null => {
      for (const field of fieldsToSearch) {
        if (
          field.path.length === pathSegments.length &&
          field.path.every((segment, i) => segment === pathSegments[i])
        ) {
          return field;
        }

        if (field.children && field.children.length > 0) {
          const found = findFieldByPath(field.children, pathSegments);

          if (found) {
            return found;
          }
        }
      }

      return null;
    },
    []
  );

  // Handle value source change (template vs blueprint)
  const handleSourceChange = useCallback(
    (field: DefaultValueField, source: ValueSourceType) => {
      if (useTypedValueConfiguration && valueConfiguration) {
        // Atualiza o campo na estrutura tipada
        const isCustomized = source === ValueSourceType.BLUEPRINT;
        const path = field.path.join('.');

        const updatedValueConfig = ValueConfigFieldService.updateFieldCustomized(
          valueConfiguration,
          path,
          isCustomized
        );

        // Se o campo não está customizado, restaura para o valor padrão
        const updatedConfig = isCustomized
          ? updatedValueConfig
          : ValueConfigFieldService.resetFieldToDefault(updatedValueConfig, path);

        // Notifica sobre a mudança na estrutura tipada
        if (onValueConfigurationChange) {
          onValueConfigurationChange(updatedConfig);
        }

        // Converte para o formato antigo para compatibilidade
        const updatedFields = valueConfigurationToLegacyFields(updatedConfig);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      } else {
        // Usa a lógica tradicional
        const updatedFields = FieldService.updateFieldSource(templateValues.fields, field, source);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      }
    },
    [
      templateValues,
      onChange,
      useTypedValueConfiguration,
      valueConfiguration,
      onValueConfigurationChange,
    ]
  );

  // Handle value change
  const handleValueChange = useCallback(
    (field: DefaultValueField, newValue: unknown) => {
      if (useTypedValueConfiguration && valueConfiguration) {
        // Atualiza o campo na estrutura tipada
        const path = field.path.join('.');

        const updatedValueConfig = ValueConfigFieldService.updateFieldValue(
          valueConfiguration,
          path,
          newValue
        );

        // Notifica sobre a mudança na estrutura tipada
        if (onValueConfigurationChange) {
          onValueConfigurationChange(updatedValueConfig);
        }

        // Converte para o formato antigo para compatibilidade
        const updatedFields = valueConfigurationToLegacyFields(updatedValueConfig);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      } else {
        // Usa a lógica tradicional
        const updatedFields = FieldService.updateFieldValue(templateValues.fields, field, newValue);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      }
    },
    [
      templateValues,
      onChange,
      useTypedValueConfiguration,
      valueConfiguration,
      onValueConfigurationChange,
    ]
  );

  // Handle expose toggle with propagation to children
  const handleExposeChange = useCallback(
    (field: DefaultValueField, exposed: boolean) => {
      const path = field.path.join('.');

      // Get child paths for propagation (both when enabling and disabling exposure)
      // Propaga tanto ao habilitar quanto ao desabilitar a exposição
      const propagationData =
        field.children && field.children.length > 0 && onTogglePropagation
          ? onTogglePropagation(field, 'expose', exposed)
          : undefined;

      // Process with ValueConfiguration if available
      if (useTypedValueConfiguration && valueConfiguration) {
        // Update the main field
        let updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
          valueConfiguration,
          path,
          exposed
        );

        // Propagate to children if needed
        if (propagationData && propagationData.childPaths.length > 0) {
          // Update each child
          propagationData.childPaths.forEach((childPath: string) => {
            // Propaga o mesmo estado de exposed para os filhos
            updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
              updatedValueConfig,
              childPath,
              exposed
            );

            // Se exposed = false, precisamos desabilitar overridable também
            if (!exposed) {
              updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
                updatedValueConfig,
                childPath,
                false
              );
            }
          });
        }

        // Bottom-up propagation: If enabling a field, ensure ALL ancestors (including root) are also enabled
        if (exposed) {
          updatedValueConfig = propagateExposedToAncestors(updatedValueConfig, path);
        } 
        // NOVA IMPLEMENTAÇÃO: Propagação bottom-up para desabilitar
        // Se estamos desabilitando um campo, verificar se isso afeta os ancestrais
        else {
          // Propagar os estados dos filhos para os pais (incluindo verificar se todos os filhos estão desabilitados)
          updatedValueConfig = propagateChildrenStatesToParents(updatedValueConfig);
        }

        // Notify about the changes
        if (onValueConfigurationChange) {
          onValueConfigurationChange(updatedValueConfig);
        }

        // Convert to old format for compatibility
        const updatedFields = valueConfigurationToLegacyFields(updatedValueConfig);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      } else {
        // Use traditional logic
        let updatedFields = FieldService.updateFieldExposed(templateValues.fields, field, exposed);

        // Propagate to children if needed
        if (propagationData && propagationData.childPaths.length > 0) {
          // Update each child field
          propagationData.childPaths.forEach((childPath: string) => {
            // Find the field by its path
            const fieldToUpdate = findFieldByPath(updatedFields, childPath.split('.'));

            if (fieldToUpdate) {
              // Propaga o mesmo estado de exposed para os filhos
              updatedFields = FieldService.updateFieldExposed(
                updatedFields,
                fieldToUpdate,
                exposed
              );

              // Se exposed = false, precisamos desabilitar overridable também
              if (!exposed && fieldToUpdate.overridable) {
                updatedFields = FieldService.updateFieldOverridable(
                  updatedFields,
                  fieldToUpdate,
                  false
                );
              }
            }
          });
        }

        // Bottom-up propagation: If enabling a field, ensure ALL ancestors (including root) are also enabled
        if (exposed) {
          updatedFields = propagateExposedToAncestorsTraditional(
            updatedFields,
            path,
            findFieldByPath
          );
        } 
        // NOVA IMPLEMENTAÇÃO: Propagação bottom-up para desabilitar
        // Se estamos desabilitando um campo, verificar se isso afeta os ancestrais
        else {
          // Propagar os estados dos filhos para os pais (incluindo verificar se todos os filhos estão desabilitados)
          updatedFields = propagateChildrenStatesToParentsTraditional(
            updatedFields,
            findFieldByPath
          );
        }

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      }
    },
    [
      templateValues,
      onChange,
      useTypedValueConfiguration,
      valueConfiguration,
      onValueConfigurationChange,
      onTogglePropagation,
      findFieldByPath,
    ]
  );

  // Handle override toggle with propagation to children
  const handleOverrideChange = useCallback(
    (field: DefaultValueField, overridable: boolean) => {
      const path = field.path.join('.');

      // Get child paths for propagation (both when enabling and disabling override)
      // Propaga tanto ao habilitar quanto ao desabilitar o override
      const propagationData =
        field.children && field.children.length > 0 && onTogglePropagation
          ? onTogglePropagation(field, 'override', overridable)
          : undefined;

      if (useTypedValueConfiguration && valueConfiguration) {
        // Update the main field first
        let updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
          valueConfiguration,
          path,
          overridable
        );

        // If we're making a field overridable, it must also be exposed
        if (overridable && !field.exposed) {
          updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
            updatedValueConfig,
            path,
            true
          );
        }

        // Propagate to children if needed (only when making fields overridable)
        if (propagationData && propagationData.childPaths.length > 0) {
          propagationData.childPaths.forEach((childPath: string) => {
            // Propaga o mesmo estado de overridable para os filhos
            updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
              updatedValueConfig,
              childPath,
              overridable
            );

            // Se overridable é true, o campo deve estar exposto
            if (overridable) {
              updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
                updatedValueConfig,
                childPath,
                true
              );
            }
          });
        }

        // Bottom-up propagation: If enabling override, ensure ALL ancestors (including root) are also enabled
        if (overridable) {
          updatedValueConfig = propagateOverrideToAncestors(updatedValueConfig, path);
        } 
        // NOVA IMPLEMENTAÇÃO: Propagação bottom-up para desabilitar
        // Se estamos desabilitando o override, verificar se isso afeta os ancestrais
        else {
          // Propagar os estados dos filhos para os pais (incluindo verificar se todos os filhos estão com override desabilitado)
          updatedValueConfig = propagateChildrenStatesToParents(updatedValueConfig);
        }

        // Notify about the changes
        if (onValueConfigurationChange) {
          onValueConfigurationChange(updatedValueConfig);
        }

        // Convert to old format for compatibility
        const updatedFields = valueConfigurationToLegacyFields(updatedValueConfig);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      } else {
        // Use traditional logic
        let updatedFields = FieldService.updateFieldOverridable(
          templateValues.fields,
          field,
          overridable
        );

        // If we're making a field overridable, it must also be exposed
        if (overridable && !field.exposed) {
          updatedFields = FieldService.updateFieldExposed(updatedFields, field, true);
        }

        // Propagate to children if needed
        if (propagationData && propagationData.childPaths.length > 0) {
          propagationData.childPaths.forEach((childPath: string) => {
            const fieldToUpdate = findFieldByPath(updatedFields, childPath.split('.'));

            if (fieldToUpdate) {
              // Update override state
              updatedFields = FieldService.updateFieldOverridable(
                updatedFields,
                fieldToUpdate,
                overridable
              );

              // If overridable, the field must be exposed
              if (overridable && !fieldToUpdate.exposed) {
                updatedFields = FieldService.updateFieldExposed(updatedFields, fieldToUpdate, true);
              }
            }
          });
        }

        // Bottom-up propagation: If enabling override, ensure ALL ancestors (including root) are also enabled
        if (overridable) {
          updatedFields = propagateOverrideToAncestorsTraditional(
            updatedFields,
            path,
            findFieldByPath
          );
        } 
        // NOVA IMPLEMENTAÇÃO: Propagação bottom-up para desabilitar
        // Se estamos desabilitando override, verificar se isso afeta os ancestrais
        else {
          // Propagar os estados dos filhos para os pais (incluindo verificar se todos os filhos estão com override desabilitado)
          updatedFields = propagateChildrenStatesToParentsTraditional(
            updatedFields,
            findFieldByPath
          );
        }

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      }
    },
    [
      templateValues,
      onChange,
      useTypedValueConfiguration,
      valueConfiguration,
      onValueConfigurationChange,
      onTogglePropagation,
      findFieldByPath,
    ]
  );

  return {
    handleSourceChange,
    handleValueChange,
    handleExposeChange,
    handleOverrideChange,
    findFieldByPath,
  };
}
