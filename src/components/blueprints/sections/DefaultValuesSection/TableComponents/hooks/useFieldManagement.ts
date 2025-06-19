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
  /**
   * Função auxiliar para encontrar um campo pelo caminho
   */
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

  /**
   * Função utilitária para aplicar mudanças de forma unificada
   */
  const applyChanges = useCallback(
    (config: ValueConfiguration | DefaultValueField[], isTyped: boolean) => {
      if (isTyped && onValueConfigurationChange && valueConfiguration) {
        // Notifica sobre mudanças na estrutura tipada
        onValueConfigurationChange(config as ValueConfiguration);

        // Converte para formato antigo para compatibilidade
        const updatedFields = valueConfigurationToLegacyFields(config as ValueConfiguration);

        onChange({
          ...templateValues,
          fields: updatedFields,
        });
      } else {
        // Usa a lógica tradicional
        onChange({
          ...templateValues,
          fields: config as DefaultValueField[],
        });
      }
    },
    [templateValues, onChange, onValueConfigurationChange, valueConfiguration]
  );

  /**
   * Manipula a alteração de origem do valor (template vs blueprint)
   */
  const handleSourceChange = useCallback(
    (field: DefaultValueField, source: ValueSourceType) => {
      if (useTypedValueConfiguration && valueConfiguration) {
        const isCustomized = source === ValueSourceType.BLUEPRINT;
        const path = field.path.join('.');

        // Atualiza o campo na estrutura tipada
        let updatedConfig = ValueConfigFieldService.updateFieldCustomized(
          valueConfiguration,
          path,
          isCustomized
        );

        // Se o campo não está customizado, restaura para o valor padrão
        if (!isCustomized) {
          updatedConfig = ValueConfigFieldService.resetFieldToDefault(updatedConfig, path);
        }

        applyChanges(updatedConfig, true);
      } else {
        // Usa a lógica tradicional
        const updatedFields = FieldService.updateFieldSource(templateValues.fields, field, source);

        applyChanges(updatedFields, false);
      }
    },
    [templateValues, applyChanges, useTypedValueConfiguration, valueConfiguration]
  );

  /**
   * Manipula a alteração de valor
   */
  const handleValueChange = useCallback(
    (field: DefaultValueField, newValue: unknown) => {
      if (useTypedValueConfiguration && valueConfiguration) {
        const path = field.path.join('.');
        const updatedValueConfig = ValueConfigFieldService.updateFieldValue(
          valueConfiguration,
          path,
          newValue
        );

        applyChanges(updatedValueConfig, true);
      } else {
        const updatedFields = FieldService.updateFieldValue(templateValues.fields, field, newValue);

        applyChanges(updatedFields, false);
      }
    },
    [templateValues, applyChanges, useTypedValueConfiguration, valueConfiguration]
  );

  /**
   * Manipula a alteração do estado exposed com propagação para filhos e ancestrais
   */
  const handleExposeChange = useCallback(
    (field: DefaultValueField, exposed: boolean) => {
      const path = field.path.join('.');

      // Obtém caminhos dos filhos para propagação
      const propagationData =
        field.children?.length && onTogglePropagation
          ? onTogglePropagation(field, 'expose', exposed)
          : undefined;

      // Processa com a configuração tipada se disponível
      if (useTypedValueConfiguration && valueConfiguration) {
        // Atualiza o campo principal
        let updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
          valueConfiguration,
          path,
          exposed
        );

        // Propaga para filhos se necessário
        if (propagationData?.childPaths.length) {
          propagationData.childPaths.forEach((childPath) => {
            // Propaga o mesmo estado de exposed para os filhos
            updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
              updatedValueConfig,
              childPath,
              exposed
            );

            // Se exposed = false, desabilita overridable também
            if (!exposed) {
              updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
                updatedValueConfig,
                childPath,
                false
              );
            }
          });
        }

        // Propagação bottom-up conforme o cenário
        if (exposed) {
          // Se habilitando: garante que ancestrais estão habilitados
          updatedValueConfig = propagateExposedToAncestors(updatedValueConfig, path);
        } else {
          // Se desabilitando: verifica se isso afeta os ancestrais
          updatedValueConfig = propagateChildrenStatesToParents(updatedValueConfig);
        }

        applyChanges(updatedValueConfig, true);
      } else {
        // Usa a lógica tradicional
        let updatedFields = FieldService.updateFieldExposed(templateValues.fields, field, exposed);

        // Propaga para filhos se necessário
        if (propagationData?.childPaths.length) {
          propagationData.childPaths.forEach((childPath) => {
            const fieldToUpdate = findFieldByPath(updatedFields, childPath.split('.'));

            if (fieldToUpdate) {
              // Propaga o mesmo estado de exposed para os filhos
              updatedFields = FieldService.updateFieldExposed(
                updatedFields,
                fieldToUpdate,
                exposed
              );

              // Se exposed = false, desabilita overridable também
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

        // Propagação bottom-up conforme o cenário
        if (exposed) {
          // Se habilitando: garante que ancestrais estão habilitados
          updatedFields = propagateExposedToAncestorsTraditional(
            updatedFields,
            path,
            findFieldByPath
          );
        } else {
          // Se desabilitando: verifica se isso afeta os ancestrais
          updatedFields = propagateChildrenStatesToParentsTraditional(
            updatedFields,
            findFieldByPath
          );
        }

        applyChanges(updatedFields, false);
      }
    },
    [
      templateValues,
      applyChanges,
      useTypedValueConfiguration,
      valueConfiguration,
      onTogglePropagation,
      findFieldByPath,
    ]
  );

  /**
   * Manipula a alteração do estado overridable com propagação para filhos e ancestrais
   */
  const handleOverrideChange = useCallback(
    (field: DefaultValueField, overridable: boolean) => {
      const path = field.path.join('.');

      // Obtém caminhos dos filhos para propagação
      const propagationData =
        field.children?.length && onTogglePropagation
          ? onTogglePropagation(field, 'override', overridable)
          : undefined;

      // Processa com a configuração tipada se disponível
      if (useTypedValueConfiguration && valueConfiguration) {
        // Atualiza o campo principal
        let updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
          valueConfiguration,
          path,
          overridable
        );

        // Se tornando um campo overridable, também deve ser exposed
        if (overridable && !field.exposed) {
          updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
            updatedValueConfig,
            path,
            true
          );
        }

        // Propaga para filhos se necessário
        if (propagationData?.childPaths.length) {
          propagationData.childPaths.forEach((childPath) => {
            // Propaga o mesmo estado de overridable para os filhos
            updatedValueConfig = ValueConfigFieldService.updateFieldOverridable(
              updatedValueConfig,
              childPath,
              overridable
            );

            // Se overridable = true, o campo deve ser exposed
            if (overridable) {
              updatedValueConfig = ValueConfigFieldService.updateFieldExposed(
                updatedValueConfig,
                childPath,
                true
              );
            }
          });
        }

        // Propagação bottom-up conforme o cenário
        if (overridable) {
          // Se habilitando: garante que ancestrais estão habilitados
          updatedValueConfig = propagateOverrideToAncestors(updatedValueConfig, path);
        } else {
          // Se desabilitando: verifica se isso afeta os ancestrais
          updatedValueConfig = propagateChildrenStatesToParents(updatedValueConfig);
        }

        applyChanges(updatedValueConfig, true);
      } else {
        // Usa a lógica tradicional
        let updatedFields = FieldService.updateFieldOverridable(
          templateValues.fields,
          field,
          overridable
        );

        // Se tornando um campo overridable, também deve ser exposed
        if (overridable && !field.exposed) {
          updatedFields = FieldService.updateFieldExposed(updatedFields, field, true);
        }

        // Propaga para filhos se necessário
        if (propagationData?.childPaths.length) {
          propagationData.childPaths.forEach((childPath) => {
            const fieldToUpdate = findFieldByPath(updatedFields, childPath.split('.'));

            if (fieldToUpdate) {
              // Atualiza o estado de override
              updatedFields = FieldService.updateFieldOverridable(
                updatedFields,
                fieldToUpdate,
                overridable
              );

              // Se overridable = true, o campo deve ser exposed
              if (overridable && !fieldToUpdate.exposed) {
                updatedFields = FieldService.updateFieldExposed(updatedFields, fieldToUpdate, true);
              }
            }
          });
        }

        // Propagação bottom-up conforme o cenário
        if (overridable) {
          // Se habilitando: garante que ancestrais estão habilitados
          updatedFields = propagateOverrideToAncestorsTraditional(
            updatedFields,
            path,
            findFieldByPath
          );
        } else {
          // Se desabilitando: verifica se isso afeta os ancestrais
          updatedFields = propagateChildrenStatesToParentsTraditional(
            updatedFields,
            findFieldByPath
          );
        }

        applyChanges(updatedFields, false);
      }
    },
    [
      templateValues,
      applyChanges,
      useTypedValueConfiguration,
      valueConfiguration,
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
