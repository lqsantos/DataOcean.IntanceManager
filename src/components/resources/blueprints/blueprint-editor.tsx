'use client';

import { useEffect, useMemo } from 'react';

import { EditBlueprintPage } from './blueprint-edit-page';

export function BlueprintEditor({ id }: { id: string }) {
  // Não podemos usar console.log devido às regras de lint,
  // mas adicionamos um useEffect para verificar quando o componente é montado
  useEffect(() => {
    // Se o ID não for passado corretamente, pelo menos vamos saber
    if (!id) {
      console.error('BlueprintEditor: ID não foi fornecido!');
    }
  }, [id]);

  // Memoizando o componente para evitar re-renderizações desnecessárias
  const editorComponent = useMemo(() => {
    return <EditBlueprintPage blueprintId={id} />;
  }, [id]);

  return editorComponent;
}
