# Prompt: Validação da Padronização de Imports

## Objetivo

Validar que a padronização de imports foi implementada corretamente, mantendo funcionalidade e seguindo padrões consistentes.

## Pré-requisitos

- [ ] Implementação completa executada
- [ ] Barrel exports criados
- [ ] Imports convertidos para @/

## Tarefas de Validação

### 1. Verificação Técnica

#### Build e Linting

```bash
npm run build
npm run lint
npm run type-check
```

#### Testes

```bash
npm run test
# Verificar se todos os testes passam
```

### 2. Verificação de Consistência

#### Verificar Remoção de Imports Relativos

```bash
# Deve retornar ZERO resultados
grep -r "from '\.\." src/ --include="*.ts" --include="*.tsx" | wc -l
grep -r "from \"\.\." src/ --include="*.ts" --include="*.tsx" | wc -l

# Se encontrar resultados, listar:
grep -r "from '\.\." src/ --include="*.ts" --include="*.tsx"
```

#### Verificar Uso de @/ Absolutos

```bash
# Deve mostrar uso consistente de @/
grep -r "from '@/" src/ --include="*.ts" --include="*.tsx" | head -10
```

#### Verificar Barrel Exports

```bash
# Confirmar que barrel exports foram criados
ls -la src/components/index.ts
ls -la src/services/index.ts
ls -la src/hooks/index.ts
ls -la src/types/index.ts
```

### 3. Verificação Funcional

#### Teste Manual da Interface

- [ ] Navegação entre páginas funciona
- [ ] Componentes carregam corretamente
- [ ] Services funcionam como esperado
- [ ] Hooks customizados funcionais
- [ ] Formulários e interações mantidas

### 4. Verificação de Performance

#### Bundle Size

```bash
# Verificar se barrel exports não aumentaram bundle
npm run build
# Comparar tamanho do build com baseline
```

#### Tree Shaking

- [ ] Verificar se barrel exports permitem tree shaking adequado
- [ ] Evitar re-exports desnecessários

## Critérios de Aceitação Final

- [ ] ✅ Zero imports relativos no projeto
- [ ] ✅ Barrel exports funcionando nos diretórios principais
- [ ] ✅ Build e testes passando
- [ ] ✅ Funcionalidade mantida (teste manual)
- [ ] ✅ Performance não degradada
- [ ] ✅ Estrutura de imports consistente

## Problemas Comuns e Soluções

### Se Build Falhar

1. Verificar circular dependencies criadas por barrel exports
2. Verificar imports quebrados após conversão
3. Revisar paths no tsconfig.json

### Se Testes Falharem

1. Atualizar imports em arquivos de teste
2. Verificar mocks que podem ter imports relativos
3. Atualizar setup de testes se necessário

### Se Performance Degradar

1. Revisar barrel exports muito grandes
2. Usar exports específicos para bibliotecas grandes
3. Verificar tree shaking em components pesados

## Melhorias Adicionais (Opcional)

### ESLint Rule para Manter Consistência

```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": ["../.*", "./.**/.*"],
        "message": "Use absolute imports with @/ instead of relative imports"
      }
    ]
  }
}
```

## Próximo Passo

Se validação passou, marcar Fase 02 como ✅ **Concluída** no README principal e proceder para **Fase 03 - Props Interfaces Unification**.
