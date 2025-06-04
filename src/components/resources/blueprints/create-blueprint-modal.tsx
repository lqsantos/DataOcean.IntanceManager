'use client';

import { ArrowLeft } from 'lucide-react';

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
  const handleSave = async (_formData: Record<string, unknown>): Promise<void> => {
    try {
      // Criar o blueprint usando apenas o contexto
      // A função do contexto já usa blueprintService para salvar no backend
      const blueprint = await createBlueprint();

      if (blueprint) {
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
      console.error('Erro ao criar blueprint:', error);
    }
  };

  // Render step title and description
  const renderStepHeader = () => {
    let title = '';
    let description = '';

    switch (currentStep) {
      case 1:
        title = 'Informações Gerais';
        description = 'Defina as informações básicas do blueprint.';
        break;
      case 2:
        title = 'Associação de Templates';
        description = 'Selecione e configure os templates que farão parte do blueprint.';
        break;
      case 3:
        title = 'Blueprint Variables';
        description = 'Defina variáveis reutilizáveis para seu blueprint.';
        break;
      case 4:
        title = 'Resumo e Confirmação';
        description = 'Confirme as informações antes de criar o blueprint.';
        break;
    }

    return { title, description };
  };

  const { title, description } = renderStepHeader();

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="flex h-[800px] max-h-[90vh] flex-col sm:max-w-[1000px]">
        <div className="flex h-full flex-col">
          <div className="flex-shrink-0 space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    className="mr-2 rounded-full p-1 hover:bg-muted"
                    aria-label="Voltar para etapa anterior"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                Criar Novo Blueprint - {title}
              </DialogTitle>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
