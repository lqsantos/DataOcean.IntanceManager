'use client';

import { useTemplateValidation } from '@/contexts/template-validation-context';

import { SelectBranchDialog } from './select-branch-dialog';
import { ValidateTemplateModal } from './validate-template-modal';

export function ValidationDialogs() {
  const {
    isSelectBranchOpen,
    isOpen,
    templateName,
    cancelBranchSelection,
    confirmBranchSelection,
  } = useTemplateValidation();

  console.log('🔍 [ValidationDialogs] renderizando', {
    isSelectBranchOpen,
    isOpen,
    templateName,
  });

  return (
    <>
      {isSelectBranchOpen && (
        <SelectBranchDialog
          isOpen={true}
          templateName={templateName}
          onClose={cancelBranchSelection}
          onConfirm={confirmBranchSelection}
        />
      )}

      {isOpen && <ValidateTemplateModal />}
    </>
  );
}
