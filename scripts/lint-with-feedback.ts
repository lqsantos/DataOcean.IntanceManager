import { ESLint } from 'eslint';

async function main() {
  // Initialize ESLint with ignorePatterns
  const eslint = new ESLint({
    fix: true,
    // Only target files within src directory
    overrideConfig: {
      ignorePatterns: [
        'next.config.ts',
        'vite.config.ts',
        'scripts/lint-with-feedback.js',
        // Ignore everything outside src directory
        '**/!(src)/**',
      ],
    },
  });

  try {
    console.warn('Running ESLint...');

    // Be more explicit about targeting only src files
    const results = await eslint.lintFiles(['src/**/*.ts', 'src/**/*.tsx']);

    // Format the results
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = await formatter.format(results);

    console.error(resultText);

    // Check if there are any errors and exit with appropriate code
    const hasErrors = results.some((result) => result.errorCount > 0);

    process.exit(hasErrors ? 1 : 0);
  } catch (_) {
    console.error('An error occurred while running ESLint');
    process.exit(1);
  }
}

main();
