'use client';

import { Code, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarkdownPreview } from '@/components/ui/markdown-preview';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useBlueprintForm } from '@/contexts/blueprint-form-context';
import { useApplications } from '@/hooks/use-applications';

/**
 * MetadataSection - Componente para capturar informações básicas do blueprint
 *
 * Este componente é a primeira seção do fluxo de criação/edição de blueprints,
 * responsável por coletar metadados como nome, versão, descrição e aplicação.
 *
 * @example
 * // Uso básico dentro do BlueprintEditor
 * <MetadataSection />
 */
export function MetadataSection() {
  const { t } = useTranslation(['blueprints']);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const { applications } = useApplications();
  const { state, setSectionData, validateSection, markSectionDirty } = useBlueprintForm();

  // Dados da seção atual
  const metadata = state.formData.metadata;

  // Efeito para validação ao montar ou quando os dados mudam
  useEffect(() => {
    // Validar a seção quando montar para atualizar o estado de completude
    if (metadata) {
      void validateSection('metadata');
    }
  }, [metadata, validateSection]);

  // Handler para atualizar os dados da seção
  const handleChange = <K extends keyof typeof metadata>(field: K, value: (typeof metadata)[K]) => {
    const updatedMetadata = {
      ...metadata,
      [field]: value,
    };

    setSectionData('metadata', updatedMetadata);
    markSectionDirty('metadata');

    // Executar validação com um pequeno delay para evitar muitas validações consecutivas
    const timer = setTimeout(() => {
      void validateSection('metadata');
    }, 300);

    return () => clearTimeout(timer);
  };

  return (
    <div className="space-y-6" data-testid="metadata-section">
      {/* Layout em grid para os campos de nome e versão */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Campo de nome */}
        <div className="space-y-2">
          <Label className="required-field" htmlFor="name">
            {t('createBlueprint.fields.name.label')}
          </Label>
          <Input
            id="name"
            value={metadata.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder={t('createBlueprint.fields.name.placeholder')}
            data-testid="blueprint-name-input"
          />
          {state.errors.metadata?.includes('O nome é obrigatório') && (
            <p className="text-sm text-destructive" data-testid="blueprint-name-error">
              {t('validation.nameRequired', 'O nome é obrigatório')}
            </p>
          )}
          {state.errors.metadata?.includes('O nome deve ter pelo menos 3 caracteres') && (
            <p className="text-sm text-destructive" data-testid="blueprint-name-min-length-error">
              {t('validation.nameMinLength', 'O nome deve ter pelo menos 3 caracteres')}
            </p>
          )}
        </div>

        {/* Campo de versão */}
        <div className="space-y-2">
          <Label className="required-field" htmlFor="version">
            {t('createBlueprint.fields.version.label')}
          </Label>
          <Input
            id="version"
            value={metadata.version}
            onChange={(e) => handleChange('version', e.target.value)}
            placeholder={t('createBlueprint.fields.version.placeholder')}
            data-testid="blueprint-version-input"
          />
          {state.errors.metadata?.includes('A versão é obrigatória') && (
            <p className="text-sm text-destructive" data-testid="blueprint-version-error">
              {t('validation.versionRequired', 'A versão é obrigatória')}
            </p>
          )}
        </div>
      </div>

      {/* Campo de aplicação */}
      <div className="space-y-2">
        <Label className="required-field" htmlFor="applicationId">
          {t('createBlueprint.fields.applicationId.label')}
        </Label>
        <Select
          value={metadata.applicationId}
          onValueChange={(value) => handleChange('applicationId', value)}
        >
          <SelectTrigger data-testid="blueprint-application-select">
            <SelectValue placeholder={t('createBlueprint.fields.applicationId.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {applications?.map((app: { id: string; name: string }) => (
              <SelectItem key={app.id} value={app.id}>
                {app.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {t('createBlueprint.fields.applicationId.description')}
        </p>
        {state.errors.metadata?.includes('A aplicação é obrigatória') && (
          <p className="text-sm text-destructive" data-testid="blueprint-application-error">
            {t('validation.applicationRequired', 'A aplicação é obrigatória')}
          </p>
        )}
      </div>

      {/* Campo de descrição com suporte a markdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="required-field" htmlFor="description">
            {t('createBlueprint.fields.description.label')}
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
            className="h-7 gap-1 text-xs"
            data-testid="blueprint-description-toggle"
          >
            {showMarkdownPreview ? <Code className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
            {showMarkdownPreview
              ? t('basicInfoStep.markdownButtons.edit')
              : t('basicInfoStep.markdownButtons.preview')}
          </Button>
        </div>

        {showMarkdownPreview ? (
          <div className="min-h-[120px] rounded-md border bg-muted/30 p-3">
            <MarkdownPreview content={metadata.description || t('basicInfoStep.noDescription')} />
          </div>
        ) : (
          <Textarea
            id="description"
            value={metadata.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder={t('createBlueprint.fields.description.placeholder')}
            rows={4}
            data-testid="blueprint-description-input"
          />
        )}

        <p className="text-xs text-muted-foreground">{t('basicInfoStep.markdownHelp')}</p>
        {state.errors.metadata?.includes('A descrição não pode estar vazia') && (
          <p className="text-sm text-destructive" data-testid="blueprint-description-error">
            {t('validation.descriptionNotEmpty', 'A descrição não pode estar vazia')}
          </p>
        )}
      </div>

      {/* Campo de tags (novo campo conforme especificação) */}
      <div className="space-y-2">
        <Label htmlFor="tags">{t('createBlueprint.fields.tags.label', 'Tags')}</Label>
        <Input
          id="tags"
          value={metadata.tags.join(', ')}
          onChange={(e) => {
            const tagsString = e.target.value;
            const tagsArray = tagsString
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean);

            handleChange('tags', tagsArray);
          }}
          placeholder={t(
            'createBlueprint.fields.tags.placeholder',
            'Adicione tags separadas por vírgula'
          )}
          data-testid="blueprint-tags-input"
        />
        <p className="text-xs text-muted-foreground">
          {t('createBlueprint.fields.tags.description', 'Tags ajudam a categorizar seu blueprint')}
        </p>
      </div>

      {/* Indicador de status da validação */}
      {state.isDirty.metadata && !state.errors.metadata?.length && (
        <div className="text-sm text-green-600" data-testid="metadata-validation-success">
          {t('validation.sectionValid', 'Informações básicas validadas com sucesso')}
        </div>
      )}
    </div>
  );
}
