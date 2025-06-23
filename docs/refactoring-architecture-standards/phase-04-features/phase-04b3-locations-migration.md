# Phase 04B-3: Locations Migration

**Objetivo**: Migrar domínio Locations para arquitetura de features seguindo padrões estabelecidos.

**Prioridade**: Alta - Foundation Domain

## Context & Architecture

> **📋 Contexto do Projeto**: Consulte sempre [project-architecture-context.md](../project-architecture-context.md) para entender a estrutura target e convenções do DataOcean Instance Manager.

### **Domain: Locations**

- **Complexidade**: Baixa (Foundation Domain)
- **Pattern**: Standard CRUD operations (similar a Applications/Environments)
- **Workflow**: Simple table + modal form
- **Dependencies**: Nenhuma dependência específica

### **Template Base**: Seguir padrão estabelecido em Applications/Environments

## Implementação Resumida

### Aplicar Template Padrão (Copilot Agent)

**COMANDO**: Seguir exatamente o mesmo processo das migrações anteriores:

1. **Mapeamento**: `file_search("**/locations/**")`, `file_search("**/location*")`
2. **Estrutura**: Criar `src/features/locations/` seguindo template
3. **Migração**: Components, hooks, services, types (Location\*)
4. **Public API**: Exports limpos via `features/locations/index.ts`
5. **Imports**: Atualizar para `@/features/locations`
6. **Validação**: Build + tests + cleanup

```bash
src/features/locations/
├── components/
│   ├── LocationTable.tsx
│   ├── LocationForm.tsx
│   ├── LocationModal.tsx
│   └── index.ts
├── hooks/
├── services/
├── types/
├── constants/
└── index.ts
```

**APÓS validação**, fazer commit:

```bash
git add .
git commit -m "feat: migrate Locations domain to features architecture"
```

## Próximo Passo

→ **Phase 04B-4: Clusters Migration**
