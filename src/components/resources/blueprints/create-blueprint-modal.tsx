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

import { BlueprintForm } from './blueprint-form';

interface CreateBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (data: any) => void;
}

export function CreateBlueprintModal({ isOpen, onClose, onCreate }: CreateBlueprintModalProps) {
  const {
    isOpen: isContextOpen,
    isLoading,
    currentStep,
    totalSteps,
    closeModal,
    nextStep,
    prevStep,
    goToStep,
    createBlueprint,
  } = useCreateBlueprint();

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
  const handleSave = async (data: any) => {
    const blueprint = await createBlueprint();

    if (blueprint && onCreate) {
      onCreate(blueprint);
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
        <div className="flex flex-col h-full">
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
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    index + 1 === currentStep
                      ? 'bg-primary'
                      : index + 1 < currentStep
                        ? 'bg-primary/70'
                        : 'bg-muted'
                  }`}
                  onClick={() => index + 1 < currentStep && goToStep(index + 1)}
                  style={{ cursor: index + 1 < currentStep ? 'pointer' : 'default' }}
                />
              ))}
            </div>
          </div>

          {/* Área de conteúdo com altura fixa e scroll */}
          <div className="flex-1 overflow-y-auto mt-4 min-h-0">
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
