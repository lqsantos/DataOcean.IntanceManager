import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { glob } from 'glob';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_LOCALE = 'pt'; // Reference locale
const LOCALES_DIR = path.join(__dirname, '../src/locales');
const NAMESPACES: string[] = []; // Will be filled automatically

// Console colors
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Interface for translation object
interface TranslationObject {
  [key: string]: string | TranslationObject;
}

// Function to extract all keys from an object (including nested ones)
function extractKeys(obj: TranslationObject, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]: [string, any]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      return extractKeys(value as TranslationObject, newKey);
    }

    return [newKey];
  });
}

// Function to check if a key exists in an object
function keyExists(obj: TranslationObject, keyPath: string): boolean {
  const parts = keyPath.split('.');
  let current: any = obj;

  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return false;
    }
    current = current[part];
  }

  return current !== undefined;
}

// Main function
async function checkTranslations(): Promise<boolean> {
  console.log(`${COLORS.blue}Checking translation consistency...${COLORS.reset}`);

  // Discover available namespaces
  const namespaceFiles = await glob(`${LOCALES_DIR}/${BASE_LOCALE}/*.json`);

  namespaceFiles.forEach((file: string) => {
    const namespaceName = path.basename(file, '.json');

    NAMESPACES.push(namespaceName);
  });

  console.log(`${COLORS.cyan}Found namespaces: ${NAMESPACES.join(', ')}${COLORS.reset}`);

  // Discover all available locales
  const localeFolders = fs
    .readdirSync(LOCALES_DIR)
    .filter((folder: string) => fs.statSync(path.join(LOCALES_DIR, folder)).isDirectory());

  console.log(`${COLORS.cyan}Found locales: ${localeFolders.join(', ')}${COLORS.reset}`);

  // For each namespace, compare keys between all locales
  let errorCount = 0;

  for (const namespace of NAMESPACES) {
    console.log(`\n${COLORS.magenta}Checking namespace: ${namespace}${COLORS.reset}`);

    // Load the base file
    const baseFilePath = path.join(LOCALES_DIR, BASE_LOCALE, `${namespace}.json`);

    if (!fs.existsSync(baseFilePath)) {
      console.log(
        `${COLORS.yellow}Warning: Base file ${baseFilePath} doesn't exist${COLORS.reset}`
      );
      continue;
    }

    const baseContent = JSON.parse(fs.readFileSync(baseFilePath, 'utf8')) as TranslationObject;
    const baseKeys = extractKeys(baseContent);

    // For each locale different from the base, check keys
    for (const locale of localeFolders.filter((l: string) => l !== BASE_LOCALE)) {
      const localeFilePath = path.join(LOCALES_DIR, locale, `${namespace}.json`);

      if (!fs.existsSync(localeFilePath)) {
        console.log(`${COLORS.red}Error: Missing file: ${localeFilePath}${COLORS.reset}`);
        errorCount++;
        continue;
      }

      const localeContent = JSON.parse(
        fs.readFileSync(localeFilePath, 'utf8')
      ) as TranslationObject;
      const localeKeys = extractKeys(localeContent);

      // Check base locale keys missing in current locale
      const missingKeys = baseKeys.filter((key: string) => !keyExists(localeContent, key));

      // Check extra keys present in current locale but not in base
      const extraKeys = localeKeys.filter((key: string) => !keyExists(baseContent, key));

      // Report results
      if (missingKeys.length > 0) {
        console.log(
          `${COLORS.red}Error: ${locale} is missing ${missingKeys.length} keys in namespace ${namespace}:${COLORS.reset}`
        );
        missingKeys.forEach((key: string) => console.log(`  - ${key}`));
        errorCount += missingKeys.length;
      }

      if (extraKeys.length > 0) {
        console.log(
          `${COLORS.yellow}Warning: ${locale} has ${extraKeys.length} extra keys in namespace ${namespace}:${COLORS.reset}`
        );
        extraKeys.forEach((key: string) => console.log(`  + ${key}`));
      }

      if (missingKeys.length === 0 && extraKeys.length === 0) {
        console.log(
          `${COLORS.green}✓ ${locale}/${namespace} is consistent with the base${COLORS.reset}`
        );
      }
    }
  }

  // Final summary
  console.log(`\n${COLORS.blue}====== Check Summary ======${COLORS.reset}`);

  if (errorCount === 0) {
    console.log(`${COLORS.green}✓ All translations are consistent!${COLORS.reset}`);

    return true;
  } else {
    console.log(
      `${COLORS.red}✗ Found ${errorCount} inconsistencies that need to be fixed.${COLORS.reset}`
    );

    return false;
  }
}

// Run the check
checkTranslations()
  .then((success) => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error(`${COLORS.red}Error checking translations:${COLORS.reset}`, error);
    process.exit(1);
  });
