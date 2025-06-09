'use client';

import { useTranslation } from 'react-i18next';

import { type BlueprintFormData, useBlueprintForm } from '@/contexts/blueprint-form-context';

/**
 * FormFieldError - Componente para exibir erros de campo de formulário
 *
 * Este componente verifica se um erro específico existe em uma seção do formulário
 * e exibe a mensagem de erro correspondente usando o sistema de internacionalização.
 *
 * @param errorKey - A chave de erro a ser verificada (deve existir no arquivo de tradução)
 * @param section - A seção do formulário (metadata, templates, etc)
 * @param field - O nome do campo específico (como "name", "version", etc.)
 * @param testId - ID para testes automatizados
 * @param options - Opções adicionais para a tradução (interpolação)
 */
export function FormFieldError({
  errorKey,
  section = 'metadata',
  field,
  testId,
  options = {},
}: {
  errorKey: string;
  section?: keyof BlueprintFormData;
  field?: string;
  testId?: string;
  options?: Record<string, unknown>;
}) {
  const { t } = useTranslation(['blueprints']);
  const { state } = useBlueprintForm();

  // Verifica se o erro específico existe na seção
  const hasError = state.errors[section]?.includes(errorKey);

  // Verifica se a seção está dirty
  const isSectionDirty = state.isDirty[section] || false;

  // Verifica se o campo específico está dirty (se for fornecido)
  const isFieldDirty = field ? state.dirtyFields[section]?.[field] || false : true;

  // Só exibe erro se:
  // 1. Houver erro E
  // 2. A seção estiver "dirty" E
  // 3. O campo específico estiver "dirty" (se fornecido) OU não tiver campo específico
  if (!hasError || !isSectionDirty || !isFieldDirty) {
    return null;
  }

  // A chave completa para o sistema de traduções
  const translationKey = errorKey.includes('.') ? errorKey : `validation.${errorKey}`;

  return (
    <p className="text-sm text-destructive" data-testid={testId}>
      {t(translationKey, {
        ...options,
        // Gera um fallback humanizado se a tradução não for encontrada
        defaultValue: errorKey
          .replace(/^validation\./, '')
          .split(/(?=[A-Z])/)
          .join(' ')
          .toLowerCase(),
      })}
    </p>
  );
}
