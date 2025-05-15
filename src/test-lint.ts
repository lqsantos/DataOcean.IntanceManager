// This file has intentional linting errors to test ESLint

function testEslint() {
  const unusedVariable = 'This should trigger a warning';

  console.log('This should trigger a console warning');

  return 'no-semi'; // Missing semicolon
}

export default testEslint;
