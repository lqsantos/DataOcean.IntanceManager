'use client';

import { Database, ServerCog } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { StyledModal } from '@/components/ui/styled-modal';
import type { Cluster, CreateClusterDto, UpdateClusterDto } from '@/types/cluster';

import { ClusterForm } from './cluster-form';

interface CreateClusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess?: (cluster: Cluster) => void;
  createCluster: (data: CreateClusterDto) => Promise<Cluster>;
  updateCluster?: (id: string, data: UpdateClusterDto) => Promise<Cluster>;
  clusterToEdit?: Cluster | null;
}

/**
 * Modal para criação e edição de clusters.
 * Usa o componente StyledModal para manter o padrão visual consistente.
 */
export function CreateClusterModal({
  isOpen,
  onClose,
  onCreateSuccess,
  createCluster,
  updateCluster,
  clusterToEdit,
}: CreateClusterModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!clusterToEdit;

  // Handler para submissão do formulário
  const handleSubmit = useCallback(
    async (values: CreateClusterDto | UpdateClusterDto) => {
      setIsSubmitting(true);

      try {
        if (isEditMode && clusterToEdit && updateCluster) {
          const updated = await updateCluster(clusterToEdit.id, values);

          toast.success('Cluster atualizado com sucesso');

          if (onCreateSuccess) {
            onCreateSuccess(updated);
          }
        } else {
          const created = await createCluster(values as CreateClusterDto);

          toast.success('Cluster criado com sucesso');

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
              ? 'Erro ao atualizar cluster'
              : 'Erro ao criar cluster';

        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isEditMode, clusterToEdit, updateCluster, createCluster, onCreateSuccess, onClose]
  );

  return (
    <StyledModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={isEditMode ? 'Editar Cluster' : 'Novo Cluster'}
      description={
        isEditMode
          ? 'Modifique as configurações do cluster'
          : 'Configure um novo cluster para implantação'
      }
      icon={isEditMode ? ServerCog : Database}
      backgroundIcon={ServerCog}
      testId="create-cluster-modal"
      maxWidth="xl"
      isEditMode={isEditMode}
    >
      <ClusterForm
        cluster={clusterToEdit || undefined}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
      />
    </StyledModal>
  );
}
