'use client';

import type { LucideIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { StyledModal } from '@/components/ui/styled-modal';

interface GenericEntityModalProps {
  /**
   * Controla se o modal está aberto
   */
  isOpen: boolean;

  /**
   * Callback quando o modal é fechado
   */
  onClose: () => void;

  /**
   * Callback quando a entidade é criada com sucesso
   */
  onCreateSuccess?: (entity: any) => void;

  /**
   * Função para criar uma nova entidade
   */
  onCreate: (data: any) => Promise<any>;

  /**
   * Função para atualizar uma entidade existente
   */
  onUpdate?: (id: string, data: any) => Promise<any>;

  /**
   * Entidade a ser editada (se modo de edição)
   */
  entityToEdit?: any | null;

  /**
   * Componente do formulário para criar/editar a entidade
   */
  EntityForm: React.ComponentType<{
    entity?: any;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
    [key: string]: any;
  }>;

  /**
   * Informações sobre o nome da entidade
   */
  entityName: {
    singular: string;
    createTitle?: string;
    editTitle?: string;
    createDescription?: string;
    editDescription?: string;
  };

  /**
   * Ícone para o modo de criação
   */
  createIcon: LucideIcon;

  /**
   * Ícone para o modo de edição
   */
  editIcon?: LucideIcon;

  /**
   * ID para testes
   */
  testId?: string;

  /**
   * Propriedades adicionais para passar ao formulário
   */
  formProps?: Record<string, any>;

  /**
   * Largura máxima do modal
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
}

/**
 * Componente genérico para modais de criação/edição de entidades
 * Reutiliza lógica comum entre diferentes modais de entidades (Aplicações, Ambientes, Localidades, etc.)
 */
export function GenericEntityModal({
  isOpen,
  onClose,
  onCreateSuccess,
  onCreate,
  onUpdate,
  entityToEdit,
  EntityForm,
  entityName,
  createIcon: CreateIcon,
  editIcon: EditIcon,
  testId = 'entity-modal',
  formProps = {},
  maxWidth = 'xl',
}: GenericEntityModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!entityToEdit;

  // Usar o ícone de edição fornecido ou recair para o ícone de criação
  const DisplayIcon = isEditMode && EditIcon ? EditIcon : CreateIcon;

  // Título do modal
  const title = isEditMode
    ? entityName.editTitle || `Editar ${entityName.singular}`
    : entityName.createTitle || `Novo ${entityName.singular}`;

  // Descrição do modal
  const description = isEditMode
    ? entityName.editDescription ||
      `Modifique as configurações do ${entityName.singular.toLowerCase()}`
    : entityName.createDescription || `Configure um novo ${entityName.singular.toLowerCase()}`;

  // Handler para submissão do formulário
  const handleSubmit = useCallback(
    async (data: any) => {
      setIsSubmitting(true);

      try {
        if (isEditMode && entityToEdit && onUpdate) {
          const updated = await onUpdate(entityToEdit.id, data);

          toast.success(`${entityName.singular} atualizado com sucesso`);

          if (onCreateSuccess) {
            onCreateSuccess(updated);
          }
        } else {
          const created = await onCreate(data);

          toast.success(`${entityName.singular} criado com sucesso`);

          if (onCreateSuccess) {
            onCreateSuccess(created);
          }
        }
        onClose();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : isEditMode
              ? `Erro ao atualizar ${entityName.singular.toLowerCase()}`
              : `Erro ao criar ${entityName.singular.toLowerCase()}`;

        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isEditMode, entityToEdit, onUpdate, onCreate, onCreateSuccess, onClose, entityName.singular]
  );

  return (
    <StyledModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={title}
      description={description}
      icon={DisplayIcon}
      backgroundIcon={CreateIcon}
      testId={testId}
      maxWidth={maxWidth}
      isEditMode={isEditMode}
      preventClose={isSubmitting}
    >
      <div
        onClick={(e) => {
          // Prevenir propagação de cliques no conteúdo do modal
          e.stopPropagation();
        }}
      >
        <EntityForm
          entity={entityToEdit || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            // Não fechar o modal se estiver submetendo
            if (!isSubmitting) {
              onClose();
            }
          }}
          isSubmitting={isSubmitting}
          {...formProps}
        />
      </div>
    </StyledModal>
  );
}
