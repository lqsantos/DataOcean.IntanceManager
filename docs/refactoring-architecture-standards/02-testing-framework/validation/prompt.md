# Prompt: Validação Testing Framework

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Fase**: Phase 02 - Testing Framework (Validation)  
**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`
**Base**: Implementação concluída conforme `../implementation/prompt.md`

## Objetivo da Validação

Verificar que o framework de testes foi implementado corretamente, funciona conforme esperado e está pronto para uso em desenvolvimento e CI/CD.

## Pré-requisitos

- [ ] Implementation phase concluída
- [ ] Todas as dependências de teste instaladas
- [ ] Configurações de teste criadas
- [ ] Scripts de teste definidos no package.json

## Validação Técnica

### 1. Dependency Verification

```bash
# Verificar se todas as dependências estão instaladas
echo "🔍 Verificando dependências de teste..."

# Core testing dependencies
npm list vitest @vitest/ui @vitest/coverage-c8 || echo "❌ Vitest dependencies missing"
npm list @testing-library/react @testing-library/jest-dom @testing-library/user-event || echo "❌ Testing Library missing"
npm list @playwright/test || echo "❌ Playwright missing"
npm list msw @faker-js/faker || echo "❌ MSW/Faker missing"

# Storybook dependencies
npm list @storybook/react-vite @storybook/addon-essentials || echo "❌ Storybook missing"

echo "✅ Dependency check completed"
```

### 2. Configuration Validation

```bash
# Verificar se arquivos de configuração existem
echo "🔍 Verificando configurações..."

config_files=(
  "vitest.config.ts"
  "playwright.config.ts"
  ".storybook/main.ts"
  ".storybook/preview.ts"
  "src/tests/setup.ts"
)

for config in "${config_files[@]}"; do
  if [ -f "$config" ]; then
    echo "✅ $config exists"
  else
    echo "❌ $config missing"
  fi
done
```

### 3. Unit Tests Validation

```bash
# Executar unit tests
echo "🔍 Validando unit tests..."

# Run tests in headless mode
npm run test:run

if [ $? -eq 0 ]; then
  echo "✅ Unit tests passing"
else
  echo "❌ Unit tests failing"
  npm run test:run 2>&1 | tail -20
fi

# Check coverage thresholds
npm run test:coverage

if [ $? -eq 0 ]; then
  echo "✅ Coverage thresholds met"
else
  echo "⚠️ Coverage below threshold"
fi
```

### 4. E2E Tests Validation

```bash
# Install Playwright browsers if not already installed
npx playwright install

# Run E2E tests
echo "🔍 Validando E2E tests..."

# Start dev server in background for E2E tests
npm run dev &
DEV_PID=$!

# Wait for server to start
sleep 15

# Check if dev server is running
if curl -s http://localhost:3000 > /dev/null; then
  echo "✅ Dev server running"

  # Run E2E tests
  npm run test:e2e

  if [ $? -eq 0 ]; then
    echo "✅ E2E tests passing"
  else
    echo "❌ E2E tests failing"
  fi
else
  echo "❌ Dev server failed to start"
fi

# Cleanup
kill $DEV_PID 2>/dev/null
```

### 5. Storybook Validation

```bash
# Verify Storybook can build
echo "🔍 Validando Storybook..."

# Build Storybook
npm run build-storybook

if [ $? -eq 0 ]; then
  echo "✅ Storybook builds successfully"
else
  echo "❌ Storybook build failed"
fi

# Start Storybook in background
npm run storybook &
STORYBOOK_PID=$!

# Wait for Storybook to start
sleep 15

# Check if Storybook is accessible
if curl -s http://localhost:6006 > /dev/null; then
  echo "✅ Storybook accessible at http://localhost:6006"
else
  echo "❌ Storybook failed to start"
fi

# Cleanup
kill $STORYBOOK_PID 2>/dev/null
```

### 6. MSW Mocking Validation

```bash
# Test MSW handlers
echo "🔍 Validando MSW mocking..."

# Create a simple test to verify MSW is working
cat > temp_msw_test.js << 'EOF'
import { beforeAll, afterEach, afterAll, test, expect } from 'vitest';
import { server } from './src/tests/mocks/server.js';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('MSW intercepts API calls', async () => {
  const response = await fetch('/api/applications');
  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data.success).toBe(true);
  expect(Array.isArray(data.data)).toBe(true);
});
EOF

# Run MSW test
npx vitest run temp_msw_test.js

if [ $? -eq 0 ]; then
  echo "✅ MSW mocking working"
else
  echo "❌ MSW mocking issues"
fi

# Cleanup
rm temp_msw_test.js
```

## Validação de Test Coverage

### 7. Coverage Analysis

```bash
# Generate detailed coverage report
echo "🔍 Analisando coverage..."

npm run test:coverage

# Check if coverage files were generated
if [ -d "coverage" ]; then
  echo "✅ Coverage report generated"

  # Display coverage summary
  if [ -f "coverage/coverage-summary.json" ]; then
    echo "Coverage Summary:"
    cat coverage/coverage-summary.json | grep -E '"lines"|"functions"|"branches"|"statements"' | head -4
  fi

  # Check individual coverage metrics
  echo "Coverage by category:"
  ls coverage/ | head -10
else
  echo "❌ Coverage report not generated"
fi
```

### 8. Test Performance Analysis

```bash
# Measure test execution time
echo "🔍 Analisando performance dos testes..."

# Time unit tests
echo "Unit test performance:"
time npm run test:run

# Time E2E tests (if server is available)
if curl -s http://localhost:3000 > /dev/null; then
  echo "E2E test performance:"
  time npm run test:e2e
fi

# Check test file patterns
echo "Test file distribution:"
find src/ -name "*.test.*" -o -name "*.spec.*" | wc -l
echo "Story file distribution:"
find src/ -name "*.stories.*" | wc -l
```

## Validação de Integração

### 9. CI/CD Pipeline Simulation

```bash
# Simulate CI/CD pipeline locally
echo "🔍 Simulando pipeline CI/CD..."

# Build project
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
  exit 1
fi

# Run all tests in CI mode
CI=true npm run test:run
CI=true npm run test:coverage

# Lint checking
npm run lint

if [ $? -eq 0 ]; then
  echo "✅ Lint checks passed"
else
  echo "⚠️ Lint issues found"
fi

# Type checking
npm run type-check

if [ $? -eq 0 ]; then
  echo "✅ Type checking passed"
else
  echo "❌ Type errors found"
fi
```

### 10. Cross-browser Validation (E2E)

```bash
# Run E2E tests across different browsers
echo "🔍 Validando cross-browser E2E..."

# Start dev server if not running
if ! curl -s http://localhost:3000 > /dev/null; then
  npm run dev &
  DEV_PID=$!
  sleep 15
fi

# Run tests on specific browsers
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

echo "✅ Cross-browser E2E validation completed"

# Cleanup if we started the server
if [ ! -z "$DEV_PID" ]; then
  kill $DEV_PID 2>/dev/null
fi
```

## Validação Manual

### 11. Interactive Testing

```markdown
# Manual Testing Checklist

## Vitest UI

- [ ] Start `npm run test:ui`
- [ ] Navigate to http://localhost:51204
- [ ] Verify test results are displayed
- [ ] Check coverage visualization
- [ ] Confirm watch mode works

## Storybook UI

- [ ] Start `npm run storybook`
- [ ] Navigate to http://localhost:6006
- [ ] Verify stories load correctly
- [ ] Test component interactions
- [ ] Check responsive design
- [ ] Verify accessibility panel

## Playwright UI

- [ ] Run `npm run test:e2e:ui`
- [ ] Verify test steps visualization
- [ ] Check screenshot/video capture
- [ ] Test debugging capabilities
- [ ] Confirm test reporting

## Development Workflow

- [ ] Write new test - verify hot reload
- [ ] Modify component - verify tests update
- [ ] Add new story - verify Storybook updates
- [ ] Break test - verify error reporting
```

## Critérios de Aceitação

### ✅ Critérios Obrigatórios (MUST PASS)

- [ ] Todas as dependências de teste instaladas
- [ ] Vitest executa testes com sucesso
- [ ] Playwright executa E2E tests sem erros
- [ ] Storybook constrói e executa corretamente
- [ ] MSW intercepta chamadas de API
- [ ] Coverage mínimo de 80% atingido
- [ ] Build passa após setup de testes

### ✅ Critérios Desejáveis (SHOULD PASS)

- [ ] Testes executam em menos de 30s (unit)
- [ ] E2E tests executam em menos de 5min
- [ ] Coverage report gerado corretamente
- [ ] Cross-browser E2E funciona
- [ ] CI/CD simulation passa
- [ ] Hot reload funciona em testes

### ✅ Critérios Opcionais (NICE TO HAVE)

- [ ] Visual regression testing configurado
- [ ] Performance benchmarks estabelecidos
- [ ] Accessibility testing integrado
- [ ] Test documentation completa

## Ações Corretivas

### Se Validação Falhar:

#### Unit Tests Issues:

```bash
# Debug failing unit tests
npm run test:ui
# → Open browser, investigate failing tests
# → Check test setup, mocks, assertions

# Common issues:
# - Missing test setup files
# - Incorrect mock configurations
# - Environment variable issues
```

#### E2E Tests Issues:

```bash
# Debug E2E tests
npm run test:e2e:debug
# → Opens Playwright in debug mode

# Common issues:
# - Server not starting properly
# - Element selectors changed
# - Timing issues (add proper waits)
# - Browser compatibility issues
```

#### Storybook Issues:

```bash
# Debug Storybook build
npm run storybook -- --verbose

# Common issues:
# - Missing story files
# - Import path issues
# - CSS/styling conflicts
# - TypeScript configuration issues
```

#### Coverage Issues:

```bash
# Identify uncovered code
npm run test:coverage -- --reporter=html
# → Open coverage/index.html to see detailed report

# Add tests for uncovered:
# - Components
# - Utils
# - Hooks
# - Services
```

#### Performance Issues:

```bash
# Profile test performance
npm run test:run -- --reporter=verbose

# Optimize slow tests:
# - Reduce test data size
# - Mock expensive operations
# - Parallelize test execution
# - Use focused testing (test.only)
```

## Documentação de Resultados

### Criar Validation Summary:

```markdown
# Testing Framework Validation Results

## ✅ Status: [PASSED/FAILED/PARTIALLY_PASSED]

## Technical Validation

- Dependencies: [✅/❌]
- Unit Tests: [✅/❌] ([X] tests, [Y] passing)
- E2E Tests: [✅/❌] ([X] scenarios, [Y] passing)
- Storybook: [✅/❌] ([X] stories)
- Coverage: [✅/❌] ([X]% achieved, 80% required)
- MSW Mocking: [✅/❌]

## Performance Metrics

- Unit test execution: [X]s
- E2E test execution: [X]min
- Storybook build time: [X]s
- Coverage generation: [X]s

## Browser Coverage (E2E)

- Chrome: [✅/❌]
- Firefox: [✅/❌]
- Safari/WebKit: [✅/❌]
- Mobile Chrome: [✅/❌]

## Coverage Analysis

- Lines: [X]% (80% threshold)
- Functions: [X]% (80% threshold)
- Branches: [X]% (80% threshold)
- Statements: [X]% (80% threshold)

## Issues Found & Resolved

[List any issues discovered during validation and how they were fixed]

## Test Categories Implemented

- [ ] Component unit tests
- [ ] Hook tests
- [ ] Service/API tests
- [ ] Integration tests
- [ ] E2E workflow tests
- [ ] Visual regression tests

## Recommendation

[✅ PROCEED to Phase 03 / ⚠️ ADDRESS ISSUES / ❌ NEEDS REWORK]

## Next Steps

- [ ] Address any remaining issues
- [ ] Create comprehensive test suite for existing components
- [ ] Train team on testing best practices
- [ ] Begin Phase 03 - API Architecture
```

## Finalização da Phase 02

### Se Validação for Successful:

```bash
# Commit final da phase
git add .
git commit -m "Phase 02 complete: Testing framework validated

- Vitest configured with 80% coverage threshold
- Playwright E2E testing across browsers
- Storybook for component documentation
- MSW for API mocking
- CI/CD pipeline integration
- Ready for Phase 03 - API Architecture"

# Tag da milestone
git tag -a phase-02-complete -m "Testing framework implementation completed successfully"
```

### Preparar Phase 03:

```bash
# Verificar que estamos prontos para próxima fase
echo "✅ Phase 02 - Testing Framework: COMPLETE"
echo "→  Ready for Phase 03 - API Architecture"
echo ""
echo "Next command:"
echo "cd docs/refactoring-architecture-standards/03-api-architecture/analysis/"
echo "# Use prompt.md to analyze current API architecture"
```

O framework de testes está agora completo e robusto, fornecendo uma base sólida para desenvolvimento orientado por testes e garantia de qualidade contínua.
