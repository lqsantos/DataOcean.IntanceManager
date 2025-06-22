# Prompt: Análise de Framework de Testes (OPCIONAL)

## Objetivo

Avaliar a configuração atual do Vitest e determinar se a migração para Jest + @next/jest realmente traz benefícios significativos.

## ⚠️ IMPORTANTE

Esta análise deve primeiro **justificar se a migração é necessária**. Se o Vitest está funcionando bem, pode ser melhor manter.

## Tarefas de Análise

### 1. Avaliar Configuração Atual do Vitest

```bash
# Verificar configuração atual
cat vitest.config.ts
cat package.json | grep -A5 -B5 "vitest"

# Verificar testes existentes
npm run test
npm run test:coverage

# Verificar performance dos testes
time npm run test
```

### 2. Listar Prós e Contras

#### Prós da Migração para Jest + @next/jest

- [ ] Integração oficial com Next.js
- [ ] Melhor suporte para Next.js features
- [ ] Ecossistema maior de plugins
- [ ] Documentação oficial Next.js

#### Contras da Migração

- [ ] Vitest é mais rápido
- [ ] Configuração já funcional
- [ ] Tempo de migração vs benefício
- [ ] Possíveis quebras nos testes existentes

### 3. Verificar Problemas Atuais

```bash
# Problemas com a configuração atual?
npm run test 2>&1 | grep -i "error\|warn"

# Cobertura funciona?
npm run test:coverage

# Performance issues?
# Verificar se testes são lentos
```

### 4. Pesquisar Best Practices

- Verificar recomendações oficiais Next.js
- Comparar performance Vitest vs Jest
- Avaliar complexidade da migração

## Resultado Esperado

Documente em `results.md`:

### 1. Recomendação Final

- [ ] **MANTER Vitest** - Justificativa: **\*\***\_**\*\***
- [ ] **MIGRAR para Jest** - Justificativa: **\*\***\_**\*\***

### 2. Se MANTER Vitest:

- Possíveis otimizações na configuração atual
- Verificações de que segue best practices
- Conclusão da fase em 30 minutos

### 3. Se MIGRAR para Jest:

- Plano detalhado de migração
- Lista de dependências a alterar
- Estimativa de tempo realista
- Riscos identificados

## Decisão Rápida

Se não há problemas evidentes com Vitest e os testes estão funcionando bem, **RECOMENDAÇÃO: MANTER Vitest** e focar esforços nas outras fases mais impactantes.

## Próximo Passo

- Se MANTER: Marcar fase como ✅ **Mantido/Otimizado**
- Se MIGRAR: Execute `../implementation/prompt.md`

---

**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`

## Informações do Projeto

### Estrutura Atual do Projeto

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
│   ├── applications/    # Application-related components
│   ├── environments/    # Environment-related components
│   ├── locations/       # Location-related components
│   ├── layout/          # Layout components (Sidebar, Header)
│   └── ui/              # Generic UI components
├── services/            # API services
│   ├── application-service.ts
│   ├── environment-service.ts
│   └── location-service.ts
├── hooks/               # Custom React hooks
│   ├── use-applications.ts
│   ├── use-environments.ts
│   └── use-locations.ts
├── types/               # TypeScript type definitions
│   ├── application.ts
│   ├── environment.ts
│   └── location.ts
├── mocks/               # MSW mocks for testing/development
├── lib/                 # Utility libraries and configurations
└── locales/             # i18n translation files
```

### Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Mocking**: MSW (Mock Service Worker)
- **State**: React hooks + Context
- **i18n**: Custom i18n implementation

### Domínios Principais

1. **Applications** - Gerenciamento de aplicações
2. **Environments** - Gerenciamento de ambientes (prod, staging, dev)
3. **Locations** - Gerenciamento de localizações/datacenters
