'use client';

import { BookTemplate, FileSymlink } from 'lucide-react';
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
          'rounded-lg border border-border',
          'shadow-lg',
          'duration-200 animate-in fade-in-0 zoom-in-95'
        )}
      >
        {/* Cabeçalho com gradiente e decoração */}
        <div className="relative overflow-hidden border-b border-border">
          {/* Decoração de fundo */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"
            aria-hidden="true"
          />
          <div
            className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5"
            aria-hidden="true"
          />

          <div className="relative p-5">
            <DialogHeader className="flex flex-row items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                <FileSymlink className="h-4 w-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-medium">Novo Template</DialogTitle>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Para uso em blueprints de aplicação
                </p>
              </div>
            </DialogHeader>
          </div>
        </div>

        {/* Conteúdo do formulário com elementos decorativos - padding reduzido na parte superior */}
        <div className="relative px-6 py-3">
          {/* Ícone decorativo no canto */}
          <div className="absolute -bottom-2 -right-2 opacity-5">
            <BookTemplate className="h-24 w-24 text-primary" />
          </div>

          <CreateTemplateForm
            onCreateSuccess={handleCreateSuccess}
            createTemplate={handleCreateTemplateSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
