import { useCallback, useState } from 'react';

import { TemplateService } from '@/services/template-service';
import type { TemplateChartInfo, TemplatePreview } from '@/types/template';

export function useTemplateValidation() {
  const [chartInfo, setChartInfo] = useState<TemplateChartInfo | null>(null);
  const [preview, setPreview] = useState<TemplatePreview | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Validate chart
  const validateChart = useCallback(
    async (gitRepositoryId: string, branch: string, path: string) => {
      try {
        setIsValidating(true);
        setValidationError(null);
        const data = await TemplateService.validate(gitRepositoryId, branch, path);

        setChartInfo(data);

        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao validar chart';

        console.error('Failed to validate chart:', err);
        setValidationError(errorMessage);

        return null;
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  // Get file previews
  const getPreview = useCallback(async (gitRepositoryId: string, branch: string, path: string) => {
    try {
      setIsLoadingPreview(true);
      setPreviewError(null);
      const data = await TemplateService.previewFiles(gitRepositoryId, branch, path);

      setPreview(data);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar previews';

      console.error('Failed to load preview files:', err);
      setPreviewError(errorMessage);

      return null;
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  // Reset validation state
  const resetValidation = useCallback(() => {
    setChartInfo(null);
    setPreview(null);
    setValidationError(null);
    setPreviewError(null);
  }, []);

  return {
    chartInfo,
    preview,
    isValidating,
    isLoadingPreview,
    validationError,
    previewError,
    validateChart,
    getPreview,
    resetValidation,
  };
}
