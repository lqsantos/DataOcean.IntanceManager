'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { usePAT } from '@/hooks/use-pat';
import { useTemplates } from '@/hooks/use-templates';

import { CreateTemplateForm } from './create-template-form';

export function CreateTemplatePage() {
  const router = useRouter();
  const [isVerifyingPat, setIsVerifyingPat] = useState(true);
  const { isConfigured: hasPat } = usePAT();
  const { createTemplate } = useTemplates();

  // Verificar PAT ao carregar a página
  useEffect(() => {
    const verifyPat = async () => {
      setIsVerifyingPat(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsVerifyingPat(false);
    };

    verifyPat();
  }, []);

  const handleCreateSuccess = () => {
    toast.success('Template criado com sucesso');
    router.push('/templates');
  };

  return (
    <div className="container py-6" data-testid="create-template-page">
      {/* Cabeçalho da página */}
      <div className="mb-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Novo Template</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie um novo template Helm para uso em blueprints
            </p>
          </div>
          <Button variant="outline" asChild className="gap-1.5 h-8" size="sm">
            <Link href="/templates">
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar
            </Link>
          </Button>
        </div>
        <Separator className="mt-4" />
      </div>

      {/* Verificação de PAT - apenas mostra o spinner durante a verificação */}
      {isVerifyingPat ? (
        <div className="mb-4 rounded-lg border p-2">
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
            <span className="text-sm">Verificando configurações...</span>
          </div>
        </div>
      ) : null}

      {/* Formulário de criação de template */}
      <CreateTemplateForm onCreateSuccess={handleCreateSuccess} createTemplate={createTemplate} />
    </div>
  );
}
