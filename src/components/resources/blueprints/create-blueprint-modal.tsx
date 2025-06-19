'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateBlueprint } from '@/contexts/create-blueprint-context';
import type { Blueprint } from '@/types/blueprint';

import { BlueprintForm } from './blueprint-form';

interface CreateBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (data: Blueprint) => void;
}

export function CreateBlueprintModal({ isOpen, onClose, onCreate }: CreateBlueprintModalProps) {
  const { t } = useTranslation(['blueprints']);
  const {
    isOpen: isContextOpen,
    // Omitimos isLoading pois não é usado neste componente
    currentStep,
    totalSteps,
    closeModal,
    nextStep,
    prevStep,
    goToStep,
    createBlueprint,
  } = useCreateBlueprint();

  /* Não precisamos importar funções do useBlueprintStore aqui
     O contexto já faz a chamada da API e o componente pai que usa 
     o store será atualizado na próxima chamada */

  // Combine props open state with context
  const isModalOpen = isOpen || isContextOpen;

  // Handle modal close
  const handleClose = () => {
    closeModal();

    if (onClose) {
      onClose();
    }
  };

  // Função para criar o blueprint
  const handleSave = async (formData: Record<string, unknown>): Promise<void> => {
    try {
      // Log para verificar se os dados do formulário estão chegando corretamente
      console.warn(`${t('createBlueprint.title')} - form data:`, formData);

      // Criar o blueprint usando apenas o contexto
      // A função do contexto já usa blueprintService para salvar no backend
      const blueprint = await createBlueprint();

      if (blueprint) {
        console.warn(`${t('toast.created.description', { name: blueprint.name })}:`, blueprint);

        // Notificar o componente pai através da prop onCreate
        if (onCreate) {
          // Passamos o blueprint criado para o componente pai
          // que será responsável por atualizar a lista
          onCreate(blueprint);
        }

        // Fechar explicitamente o modal após a criação bem-sucedida
        handleClose();
      }
    } catch (error) {
      console.error(`${t('toast.error.title')}: ${t('toast.error.description')}`, error);
    }
  };

  // Render step title and description
  const renderStepHeader = () => {
    let title = '';
    let description = '';

    switch (currentStep) {
      case 1:
        title = t('createBlueprint.steps.info');
        description = t('createBlueprint.fields.description.description');
        break;
      case 2:
        title = t('createBlueprint.steps.template');
        description = t('createBlueprint.fields.templateId.description');
        break;
      case 3:
        title = t('createBlueprint.steps.variables');
        description = t('createBlueprint.fields.variables.description');
        break;
      case 4:
        title = t('createBlueprint.steps.review');
        description = t('createBlueprint.description');
        break;
    }

    return { title, description };
  };

  const { title, description } = renderStepHeader();

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent
        className="flex h-[800px] max-h-[90vh] flex-col sm:max-w-[1000px]"
        data-testid="create-blueprint-modal"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center">
            {/* Mostrar ícone de voltar nos passos 2 ou posterior */}
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="mr-2 flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted"
                data-testid="blueprint-go-back-button"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">{t('createBlueprint.buttons.back', 'Voltar')}</span>
              </button>
            )}
            <DialogTitle className="text-xl">
              {t('createBlueprint.title')} - {title}
            </DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Barra de Progresso */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCurrentStep = index + 1 === currentStep;
            const isPreviousStep = index + 1 < currentStep;
            let stepClass = 'bg-muted';

            if (isCurrentStep) {
              stepClass = 'bg-primary';
            } else if (isPreviousStep) {
              stepClass = 'bg-primary/70';
            }

            return (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-colors ${stepClass}`}
                onClick={() => isPreviousStep && goToStep(index + 1)}
                style={{ cursor: isPreviousStep ? 'pointer' : 'default' }}
              />
            );
          })}
        </div>

        {/* Área de conteúdo com altura fixa e scroll */}
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-6 px-1">
            <BlueprintForm
              onSave={handleSave}
              onCancel={handleClose}
              mode="create"
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNextStep={nextStep}
              onPrevStep={prevStep}
              onGoToStep={goToStep}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
