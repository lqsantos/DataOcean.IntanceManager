# Prompt: Validação do Framework de Testes

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Decisão**: Baseada nos resultados de `../analysis/results.md`  
**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`

## Objetivo da Validação

Validar que a decisão sobre o framework de testes foi implementada corretamente, seja mantendo Vitest ou migrando para Jest.

## Cenários de Validação

### SE MANTEVE VITEST:

#### 1. Verificar Funcionamento Atual

```bash
# Testar configuração atual
npm run test
npm run test:coverage

# Verificar se não há problemas
npm run test -- --reporter=verbose
```

#### 2. Verificar Otimizações (se aplicadas)

- [ ] Configuração Vitest otimizada
- [ ] Performance de testes adequada
- [ ] Coverage funcionando corretamente

#### 3. Critérios de Aceitação

- [ ] ✅ Todos os testes passam
- [ ] ✅ Coverage funciona
- [ ] ✅ Performance adequada (< 30s para suite completa)
- [ ] ✅ Configuração estável

### SE MIGROU PARA JEST:

#### 1. Verificação Técnica Completa

```bash
# Verificar se Jest está configurado
ls -la jest.config.js jest.setup.js

# Verificar se dependências corretas estão instaladas
npm list jest @next/jest @types/jest

# Verificar se Vitest foi removido
npm list vitest || echo "Vitest removido corretamente"

# Testar nova configuração
npm run test
npm run test:coverage
```

#### 2. Verificar Migração de Testes

```bash
# Verificar se testes funcionam com Jest
npm run test -- --verbose

# Verificar se não há imports específicos do Vitest
grep -r "from 'vitest'" src/ --include="*.test.ts" --include="*.test.tsx" || echo "Nenhum import Vitest encontrado"
```

#### 3. Verificar Configuração Next.js

```bash
# Verificar se @next/jest está funcionando
npm run test -- --passWithNoTests

# Verificar se alias @/ funciona nos testes
grep -r "from '@/" src/ --include="*.test.ts" --include="*.test.tsx" | head -3
```

#### 4. Critérios de Aceitação para Migração

- [ ] ✅ Jest configurado com @next/jest
- [ ] ✅ Todos os testes migrados e funcionando
- [ ] ✅ Coverage funciona corretamente
- [ ] ✅ Performance mantida ou melhorada
- [ ] ✅ Configuração Vitest removida
- [ ] ✅ Dependencies Vitest removidas do package.json

## Validação Funcional

### Teste Manual da Suite de Testes

```bash
# Executar diferentes tipos de teste
npm run test -- --testPathPattern="components"
npm run test -- --testPathPattern="services"
npm run test -- --testPathPattern="hooks"

# Verificar se mocks MSW funcionam nos testes
npm run test -- --testPathPattern=".*\.test\.(ts|tsx)"
```

### Verificar Integração com CI/CD

- [ ] Scripts npm atualizados corretamente
- [ ] Comandos de teste funcionam em diferentes ambientes
- [ ] Coverage reports são gerados adequadamente

## Problemas Comuns e Soluções

### Se Testes Falharem Após Migração

1. Verificar se imports foram atualizados
2. Verificar se mocks foram migrados corretamente
3. Verificar configuração de jsdom
4. Verificar setup files (jest.setup.js)

### Se Performance Degradar

1. Verificar configuração de cache do Jest
2. Verificar se transform patterns estão otimizados
3. Considerar configurações de workers paralelos

### Se Coverage Não Funcionar

1. Verificar collectCoverageFrom no jest.config.js
2. Verificar se arquivos estão sendo incluídos/excluídos corretamente
3. Verificar reporteres de coverage

## Relatório de Validação

### Decisão Tomada

- [ ] **MANTIDO Vitest** - Justificativa: ********\_********
- [ ] **MIGRADO para Jest** - Justificativa: ********\_********

### Resultados dos Testes

- **Testes Unit**: ✅ Passou / ❌ Falhou (_X testes_)
- **Coverage**: ✅ Passou / ❌ Falhou (_%_ cobertura)
- **Performance**: ✅ Adequada / ❌ Lenta (_Xs tempo total_)

### Problemas Encontrados

_Documentar qualquer problema encontrado_

### Status Final

- [ ] ✅ **Fase 04 Concluída** - Framework de testes validado e funcional
- [ ] ❌ **Necessita Correção** - Problemas identificados precisam ser resolvidos

## Próximo Passo

Se validação passou:

- Marcar Fase 04 como ✅ **Concluída** no README principal
- Proceder para **Fase 05 - MSW Consolidation** (opcional)

Se manteve Vitest sem migração:

- Marcar como ✅ **Mantido/Otimizado**
- Proceder para próximas fases opcionais
