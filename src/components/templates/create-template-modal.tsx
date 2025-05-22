'use client';

import { FileSymlink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateTemplateModal } from '@/contexts/create-template-modal-context';
import { useTemplates } from '@/hooks/use-templates';
import { cn } from '@/lib/utils';
import type { CreateTemplateDto } from '@/types/template';

import { CreateTemplateForm } from './create-template-form';

export function CreateTemplateModal() {
  const { isOpen, closeModal } = useCreateTemplateModal();
  const router = useRouter();
  const { createTemplate } = useTemplates();

  const handleCreateSuccess = () => {
    toast.success('Template criado com sucesso');
    closeModal();
    router.refresh();
  };

  const handleCreateTemplateSubmit = async (values: CreateTemplateDto) => {
    await createTemplate(values);
    // Garantindo que retorna void para corresponder à assinatura esperada
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        className={cn(
          'w-[90vw] max-w-2xl',
          'overflow-visible p-0',
          'rounded-md border border-border'
        )}
      >
        {/* Cabeçalho */}
        <div className="border-b border-border p-6">
          <DialogHeader className="flex flex-row items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <FileSymlink className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-medium">Novo Template</DialogTitle>
          </DialogHeader>
        </div>

        {/* Conteúdo do formulário */}
        <div className="p-6">
          <CreateTemplateForm
            onCreateSuccess={handleCreateSuccess}
            createTemplate={handleCreateTemplateSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
