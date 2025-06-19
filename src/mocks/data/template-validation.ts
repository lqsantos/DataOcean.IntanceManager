// Constants to control mock behavior
export const USE_PREDICTABLE_MOCK =
  process.env.USE_PREDICTABLE_MOCK === 'true' || process.env.NODE_ENV === 'test';

// Example of possible validation errors
export const possibleErrors = [
  'Arquivo Chart.yaml não encontrado no caminho informado.',
  'Não foi possível acessar o repositório na branch especificada.',
  'O arquivo values.yaml contém sintaxe YAML inválida.',
  'O chart não segue as convenções de nomenclatura padrão.',
  'Formato do Chart.yaml não está em conformidade com a especificação Helm.',
  'Falha na autenticação com o repositório Git.',
  'Timeout ao acessar o repositório Git. Tente novamente mais tarde.',
];

// Example of warnings/recommendations
export const possibleWarnings = [
  'Adicione um arquivo values.schema.json para habilitar o editor visual de valores.',
  'Considere adicionar mais documentação no README.md.',
  'Versão apiVersion está desatualizada, considere usar v2.',
  'Faltam metadados importantes como maintainers e appVersion no Chart.yaml.',
  'Valores sensíveis como senhas devem ser parametrizados.',
  'Considere adicionar testes automatizados para o chart.',
  'Chart não inclui recursos para monitoramento, considere adicionar.',
];

// Used internally by the generateValidationResponse function
interface _ValidationResultBase {
  isValid: boolean;
  message: string;
  errors?: string[];
  warnings?: string[];
  chartInfo?: {
    name: string;
    version: string;
    apiVersion: string;
    description?: string;
  };
  files?: {
    chartYaml: boolean;
    valuesYaml: boolean;
    valuesSchemaJson: boolean;
  };
}

// Function to generate validation responses
export const generateValidationResponse = (
  branch: string,
  forceResult?: 'success' | 'error' | 'generic-error'
) => {
  // Shared base response object
  const baseResult = {
    status: 'success' as const,
  };

  // If in test environment, use predictable results based on branch or forceResult
  if (USE_PREDICTABLE_MOCK) {
    let resultType = 'success';

    if (forceResult) {
      resultType = forceResult;
    } else if (branch === 'main') {
      resultType = 'success';
    } else if (branch === 'error') {
      resultType = 'error';
    } else if (branch === 'generic-error') {
      resultType = 'generic-error';
    }

    // For successful validations
    if (resultType === 'success') {
      return {
        ...baseResult,
        isValid: true,
        message: `Template validado com sucesso na branch "${branch}".`,
        chartInfo: {
          name: 'example-chart',
          version: '1.0.0',
          apiVersion: 'v2',
          description: 'Chart de teste para validação',
        },
        files: {
          chartYaml: true,
          valuesYaml: true,
          valuesSchemaJson: branch === 'with-schema',
        },
        warnings:
          branch === 'with-warnings'
            ? [
                'Adicione um arquivo values.schema.json para habilitar o editor visual de valores.',
                'Considere adicionar mais documentação no README.md.',
              ]
            : [],
      };
    }
    // For validation errors
    else if (resultType === 'error') {
      return {
        ...baseResult,
        isValid: false,
        message: 'Arquivo Chart.yaml não encontrado no caminho informado.',
        errors: ['Arquivo Chart.yaml não encontrado no caminho informado.'],
        files: {
          chartYaml: false,
          valuesYaml: true,
          valuesSchemaJson: false,
        },
      };
    }
    // For generic errors
    else {
      return {
        ...baseResult,
        isValid: false,
        message: 'Verifique se o repositório e o caminho estão corretos.',
        errors: ['Erro inesperado durante a validação.'],
      };
    }
  }
  // In development/dynamic mode, simulate random validation results
  else {
    const random = Math.random();
    let resultType: 'success' | 'error' | 'generic-error';

    // 60% chance of success, 30% chance of validation error, 10% chance of generic error
    if (random < 0.6) {
      resultType = 'success';
    } else if (random < 0.9) {
      resultType = 'error';
    } else {
      resultType = 'generic-error';
    }

    // For successful validations
    if (resultType === 'success') {
      // Randomize if some files are present
      const hasValuesSchema = Math.random() > 0.5;

      // Add some random recommendations
      const warningCount = Math.floor(Math.random() * 3); // 0 to 2 recommendations

      const warnings =
        warningCount > 0
          ? possibleWarnings.sort(() => 0.5 - Math.random()).slice(0, warningCount)
          : [];

      return {
        ...baseResult,
        isValid: true,
        message: `Template validado com sucesso na branch "${branch}".`,
        chartInfo: {
          name: `example-chart-${Math.floor(Math.random() * 100)}`,
          version: `${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
          apiVersion: Math.random() > 0.3 ? 'v2' : 'v1',
          description:
            Math.random() > 0.3 ? 'Um chart exemplo para demonstração da validação' : undefined,
        },
        files: {
          chartYaml: true, // Always true for success
          valuesYaml: true, // Always true for success
          valuesSchemaJson: hasValuesSchema,
        },
        warnings,
      };
    }
    // For validation errors
    else if (resultType === 'error') {
      const errorIndex = Math.floor(Math.random() * possibleErrors.length);
      const errorMessage = possibleErrors[errorIndex];

      return {
        ...baseResult,
        isValid: false,
        message: errorMessage,
        errors: [errorMessage],
        // Depending on the error, some files might exist
        files: {
          chartYaml: errorIndex !== 0, // If the error is "Chart.yaml not found", then false
          valuesYaml: Math.random() > 0.3, // 70% chance of having values.yaml
          valuesSchemaJson: Math.random() > 0.7, // 30% chance of having values.schema.json
        },
      };
    }
    // For generic/unexpected errors
    else {
      return {
        ...baseResult,
        isValid: false,
        message: 'Verifique se o repositório e o caminho estão corretos.',
        errors: ['Erro inesperado durante a validação.'],
      };
    }
  }
};
