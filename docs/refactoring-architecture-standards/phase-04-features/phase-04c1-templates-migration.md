# Phase 04C-1: Templates Migration

**Objetivo**: Migrar domínio Templates para arquitetura de features implementando Template Pattern (modal-based workflow).

**Prioridade**: Alta - Primeiro Orchestration Domain (complexidade média)

## Context & Architecture

> **📋 Contexto do Projeto**: Consulte sempre [project-architecture-context.md](../project-architecture-context.md) para entender a estrutura target e convenções do DataOcean Instance Manager.

### **Domain: Templates**

- **Complexidade**: Média (Orchestration Domain)
- **Pattern**: Template Pattern - Modal-based workflow
- **Workflow**: Simple modal form (não página dedicada)
- **Dependencies**: Applications, Environments (referências)

### **Template Pattern Characteristics**

- **Modal-based**: Workflow via modal, não página dedicada
- **Simple form**: Formulário direto sem steps complexos
- **Quick creation**: Criação rápida e simples
- **Minimal context**: Context local para modal apenas

### **Categorização para Templates**

- **FEATURE-BOUND** (`features/templates/`): Components, hooks, services específicos de Templates
- **GLOBAL** (raiz): Modal components genéricos podem permanecer globais

## Análise da Situação Atual

### 1. O Copilot Agent irá automaticamente:

- Mapear arquivos relacionados a Templates (provavelmente em `src/components/resources/templates/`)
- Identificar padrão modal-based atual
- Analisar hooks, services, types existentes
- Preservar Template Pattern (modal workflow)
- Migrar mantendo simplicidade do workflow

### 2. Arquivos Esperados para Migração

**Components (src/components/)**:

- [ ] `resources/templates/` (diretório)
- [ ] Verificar components de modal/form

**Hooks**:

- [ ] `src/hooks/use-templates.ts` (se existir)

**Services**:

- [ ] `src/services/template-service.ts` (se existir)

**Types**:

- [ ] `src/types/template.ts` (se existir)

## Implementação

### Step 1: Análise de Mapeamento Templates (Copilot Agent)

**COMANDO**: Mapear especificamente o domínio Templates:

```typescript
// Copilot Agent deve usar:
// 1. file_search("**/templates/**") - Mapear components
// 2. file_search("**/template*") - Mapear arquivos relacionados
// 3. grep_search("template", isRegexp=false) - Encontrar referências
// 4. read_file nos principais arquivos para entender o Template Pattern
// 5. Identificar se é modal-based ou page-based
```

### Step 2: Criar Estrutura Templates Feature (Copilot Agent)

**CATEGORIA**: Feature-bound - Domínio Templates

**COMANDO**: Criar estrutura adaptada para Template Pattern:

```bash
src/features/templates/
├── components/
│   ├── TemplateTable.tsx       # Lista de templates
│   ├── TemplateForm.tsx        # Formulário do template
│   ├── TemplateModal.tsx       # Modal wrapper (Template Pattern)
│   ├── CreateTemplateModal.tsx # Modal de criação específico
│   └── index.ts
├── hooks/
│   ├── use-templates.ts        # Hook de dados
│   ├── use-template-form.ts    # Hook de formulário
│   ├── use-template-modal.ts   # Hook para controle do modal
│   └── index.ts
├── services/
│   ├── template-service.ts
│   └── index.ts
├── types/
│   ├── template.ts
│   └── index.ts
├── constants/
│   ├── template.ts
│   └── index.ts
└── index.ts                    # Public API
```

### Step 3: Migrar Components - Template Pattern (Copilot Agent)

**COMANDO**: Migrar preservando modal-based workflow:

```typescript
// features/templates/components/TemplateModal.tsx (FEATURE-BOUND)
// Template Pattern: Modal-based workflow
interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: Template;
  mode: 'create' | 'edit';
}

export const TemplateModal = ({ isOpen, onClose, template, mode }: TemplateModalProps) => {
  const { mutate: saveTemplate, isPending } = useTemplateMutation();

  const handleSubmit = (data: TemplateFormData) => {
    saveTemplate(data, {
      onSuccess: () => {
        onClose();
        // Refresh data
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        {mode === 'create' ? 'Criar Template' : 'Editar Template'}
      </ModalHeader>
      <ModalBody>
        <TemplateForm
          template={template}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={isPending}
        />
      </ModalBody>
    </Modal>
  );
};
```

```typescript
// features/templates/components/TemplateForm.tsx (FEATURE-BOUND)
// Formulário simples para Template Pattern
interface TemplateFormProps {
  template?: Template;
  onSubmit: (data: TemplateFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const TemplateForm = ({ template, onSubmit, onCancel, loading }: TemplateFormProps) => {
  const { form, handleSubmit } = useTemplateForm(template);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Campos simples do template */}
      <Input {...form.register('name')} label="Nome" />
      <Textarea {...form.register('description')} label="Descrição" />
      <Select {...form.register('type')} label="Tipo" options={templateTypes} />

      <div className="flex gap-2 pt-4">
        <Button type="submit" loading={loading}>
          Salvar
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
```

```typescript
// features/templates/components/TemplateTable.tsx (FEATURE-BOUND)
// Lista com ação para abrir modal
interface TemplateTableProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export const TemplateTable = ({ templates, onEdit, onDelete, loading }: TemplateTableProps) => {
  return (
    <DataTable
      data={templates}
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'type', label: 'Tipo' },
        { key: 'description', label: 'Descrição' },
        {
          key: 'actions',
          label: 'Ações',
          render: (template) => (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onEdit(template)}>
                Editar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(template.id)}>
                Excluir
              </Button>
            </div>
          ),
        },
      ]}
      loading={loading}
    />
  );
};
```

### Step 4: Migrar Hooks - Template Pattern (Copilot Agent)

**COMANDO**: Hooks adaptados para modal workflow:

```typescript
// features/templates/hooks/use-template-modal.ts (FEATURE-BOUND)
// Hook específico para controle de modal
export const useTemplateModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | undefined>();

  const openCreateModal = () => {
    setMode('create');
    setSelectedTemplate(undefined);
    setIsOpen(true);
  };

  const openEditModal = (template: Template) => {
    setMode('edit');
    setSelectedTemplate(template);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedTemplate(undefined);
  };

  return {
    isOpen,
    mode,
    selectedTemplate,
    openCreateModal,
    openEditModal,
    closeModal,
  };
};
```

```typescript
// features/templates/hooks/use-templates.ts (FEATURE-BOUND)
// Hook de dados (similar aos Foundation Domains)
export const useTemplates = (filters?: TemplateFilters) => {
  return useQuery({
    queryKey: ['templates', filters],
    queryFn: () => templateService.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TemplateFormData & { id?: string }) => {
      if (data.id) {
        return templateService.update(data.id, data);
      }
      return templateService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};
```

### Step 5-8: Continuar Migração Padrão (Copilot Agent)

**COMANDO**: Seguir padrões estabelecidos para:

- **Step 5**: Services (template-service.ts)
- **Step 6**: Types (Template, TemplateFormData, etc.)
- **Step 7**: Constants (TEMPLATE_TYPES, TEMPLATE_VALIDATION)
- **Step 8**: Public API

### Step 9: Atualizar Imports - Template Pattern (Copilot Agent)

**COMANDO**: Atualizar imports focando no modal usage:

```typescript
// ANTES
import { TemplateModal } from '@/components/resources/templates/template-modal';

// DEPOIS
import { TemplateModal, useTemplateModal } from '@/features/templates';

// Exemplo de uso
const MyPage = () => {
  const { isOpen, mode, selectedTemplate, openCreateModal, openEditModal, closeModal } = useTemplateModal();

  return (
    <>
      <Button onClick={openCreateModal}>Criar Template</Button>
      <TemplateTable onEdit={openEditModal} />
      <TemplateModal
        isOpen={isOpen}
        mode={mode}
        template={selectedTemplate}
        onClose={closeModal}
      />
    </>
  );
};
```

### Step 10-11: Validação e Cleanup (Copilot Agent)

**COMANDO**: Validação focada no Template Pattern + cleanup.

**APÓS validação automática**, fazer commit:

```bash
git add .
git commit -m "feat: migrate Templates domain implementing Template Pattern (modal-based workflow)"
```

## Checklist de Finalização

### ✅ Template Pattern Implementation (Copilot Agent)

- [ ] Modal-based workflow preservado
- [ ] TemplateModal component implementado
- [ ] useTemplateModal hook para controle de estado
- [ ] Formulário simples e direto
- [ ] Integração com lista via modal triggers

### ✅ Migração Completa (Copilot Agent)

- [ ] Estrutura `src/features/templates/` criada
- [ ] Components, hooks, services, types migrados
- [ ] Public API estabelecida
- [ ] Template Pattern funcionando
- [ ] Imports atualizados
- [ ] Validação completa
- [ ] Arquivos antigos removidos

### ✅ Diferenças do Foundation Pattern

- [ ] **Modal-focused**: Workflow via modal, não página
- [ ] **Hook específico**: useTemplateModal para controle
- [ ] **Simplicidade**: Formulário direto sem complexidade
- [ ] **Quick workflow**: Criação/edição rápida

## Próximo Passo

→ **Phase 04C-2: Blueprints Analysis** - Análise das duas implementações Blueprint existentes
