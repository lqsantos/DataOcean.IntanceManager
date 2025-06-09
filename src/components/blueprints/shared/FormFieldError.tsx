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
 * @param testId - ID para testes automatizados
 * @param options - Opções adicionais para a tradução (interpolação)
 */
export function FormFieldError({
  errorKey,
  section = 'metadata',
  testId,
  options = {},
}: {
  errorKey: string;
  section?: keyof BlueprintFormData;
  testId?: string;
  options?: Record<string, unknown>;
}) {
  const { t } = useTranslation(['blueprints']);
  const { state } = useBlueprintForm();

  // Verifica se o erro específico existe na seção
  const hasError = state.errors[section]?.includes(errorKey);

  if (!hasError) {
    return null;
  }

  // A chave completa para o sistema de traduções
  // Assume o formato correto baseado nas convenções do projeto
  // Se errorKey já contém o namespace completo, usa diretamente
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
