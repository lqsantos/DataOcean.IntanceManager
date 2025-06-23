# Phase 04B-4: Clusters Migration

**Objetivo**: Migrar domínio Clusters para arquitetura de features seguindo padrões estabelecidos, finalizando Foundation Domains.

**Prioridade**: Alta - Último Foundation Domain

## Context & Architecture

> **📋 Contexto do Projeto**: Consulte sempre [project-architecture-context.md](../project-architecture-context.md) para entender a estrutura target e convenções do DataOcean Instance Manager.

### **Domain: Clusters**

- **Complexidade**: Baixa (Foundation Domain)
- **Pattern**: Standard CRUD operations (similar aos anteriores)
- **Workflow**: Simple table + modal form
- **Dependencies**: Locations, Environments (referências)

### **Template Base**: Seguir padrão consolidado dos Foundation Domains

## Implementação Resumida

### Aplicar Template Padrão (Copilot Agent)

**COMANDO**: Seguir processo estabelecido e consolidado:

1. **Mapeamento**: `file_search("**/clusters/**")`, `file_search("**/cluster*")`
2. **Estrutura**: Criar `src/features/clusters/` seguindo template
3. **Migração**: Components, hooks, services, types (Cluster\*)
4. **Public API**: Exports limpos via `features/clusters/index.ts`
5. **Imports**: Atualizar para `@/features/clusters`
6. **Validação**: Build + tests + cleanup

```bash
src/features/clusters/
├── components/
│   ├── ClusterTable.tsx
│   ├── ClusterForm.tsx
│   ├── ClusterModal.tsx
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
git commit -m "feat: migrate Clusters domain to features architecture - complete Foundation Domains"
```

## ✅ Foundation Domains Completos

Após esta migração, todos os **Foundation Domains** estarão migrados:

- ✅ Applications
- ✅ Environments
- ✅ Locations
- ✅ Clusters

## Próximo Passo

→ **Phase 04C-1: Templates Migration** - Início dos Orchestration Domains (complexidade maior)
