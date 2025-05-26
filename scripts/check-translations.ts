const fs = require('fs');
const path = require('path');

const glob = require('glob');

// Configuração
const BASE_LOCALE = 'pt'; // Locale de referência
const LOCALES_DIR = path.join(__dirname, '../src/locales');
const NAMESPACES: string[] = []; // Será preenchido automaticamente

// Cores para o console
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Interface para definir o objeto de traduções
interface TranslationObject {
  [key: string]: string | TranslationObject;
}

// Função para extrair todas as chaves de um objeto (inclusive aninhadas)
function extractKeys(obj: TranslationObject, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]: [string, any]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      return extractKeys(value as TranslationObject, newKey);
    }

    return [newKey];
  });
}

// Função para verificar se uma chave existe em um objeto
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

// Função principal
async function checkTranslations(): Promise<boolean> {
  console.log(`${COLORS.blue}Verificando consistência das traduções...${COLORS.reset}`);

  // Descobrir os namespaces disponíveis
  const namespaceFiles = glob.sync(`${LOCALES_DIR}/${BASE_LOCALE}/*.json`);

  namespaceFiles.forEach((file: string) => {
    const namespaceName = path.basename(file, '.json');

    NAMESPACES.push(namespaceName);
  });

  console.log(`${COLORS.cyan}Namespaces encontrados: ${NAMESPACES.join(', ')}${COLORS.reset}`);

  // Descobrir todos os locales disponíveis
  const localeFolders = fs
    .readdirSync(LOCALES_DIR)
    .filter((folder: string) => fs.statSync(path.join(LOCALES_DIR, folder)).isDirectory());

  console.log(`${COLORS.cyan}Locales encontrados: ${localeFolders.join(', ')}${COLORS.reset}`);

  // Para cada namespace, comparar as chaves entre todos os locales
  let errorCount = 0;

  for (const namespace of NAMESPACES) {
    console.log(`\n${COLORS.magenta}Verificando namespace: ${namespace}${COLORS.reset}`);

    // Carregar o arquivo base
    const baseFilePath = path.join(LOCALES_DIR, BASE_LOCALE, `${namespace}.json`);

    if (!fs.existsSync(baseFilePath)) {
      console.log(
        `${COLORS.yellow}Aviso: O arquivo base ${baseFilePath} não existe${COLORS.reset}`
      );
      continue;
    }

    const baseContent = JSON.parse(fs.readFileSync(baseFilePath, 'utf8')) as TranslationObject;
    const baseKeys = extractKeys(baseContent);

    // Para cada locale diferente do base, verificar as chaves
    for (const locale of localeFolders.filter((l: string) => l !== BASE_LOCALE)) {
      const localeFilePath = path.join(LOCALES_DIR, locale, `${namespace}.json`);

      if (!fs.existsSync(localeFilePath)) {
        console.log(`${COLORS.red}Erro: Arquivo faltando: ${localeFilePath}${COLORS.reset}`);
        errorCount++;
        continue;
      }

      const localeContent = JSON.parse(
        fs.readFileSync(localeFilePath, 'utf8')
      ) as TranslationObject;
      const localeKeys = extractKeys(localeContent);

      // Verificar chaves do locale base faltando no locale atual
      const missingKeys = baseKeys.filter((key: string) => !keyExists(localeContent, key));

      // Verificar chaves extras presentes no locale atual mas não no base
      const extraKeys = localeKeys.filter((key: string) => !keyExists(baseContent, key));

      // Relatar resultados
      if (missingKeys.length > 0) {
        console.log(
          `${COLORS.red}Erro: ${locale} está faltando ${missingKeys.length} chaves no namespace ${namespace}:${COLORS.reset}`
        );
        missingKeys.forEach((key: string) => console.log(`  - ${key}`));
        errorCount += missingKeys.length;
      }

      if (extraKeys.length > 0) {
        console.log(
          `${COLORS.yellow}Aviso: ${locale} tem ${extraKeys.length} chaves extras no namespace ${namespace}:${COLORS.reset}`
        );
        extraKeys.forEach((key: string) => console.log(`  + ${key}`));
      }

      if (missingKeys.length === 0 && extraKeys.length === 0) {
        console.log(
          `${COLORS.green}✓ ${locale}/${namespace} está consistente com a base${COLORS.reset}`
        );
      }
    }
  }

  // Resumo final
  console.log(`\n${COLORS.blue}====== Resumo da verificação ======${COLORS.reset}`);

  if (errorCount === 0) {
    console.log(`${COLORS.green}✓ Todas as traduções estão consistentes!${COLORS.reset}`);

    return true;
  } else {
    console.log(
      `${COLORS.red}✗ Encontradas ${errorCount} inconsistências que precisam ser corrigidas.${COLORS.reset}`
    );

    return false;
  }
}

// Executar a verificação
checkTranslations()
  .then((success) => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error(`${COLORS.red}Erro ao verificar traduções:${COLORS.reset}`, error);
    process.exit(1);
  });
