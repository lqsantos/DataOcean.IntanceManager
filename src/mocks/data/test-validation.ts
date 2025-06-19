// Helper function to simplify validation response handling in tests
export function createValidationResponse(
  isValid: boolean,
  branch: string,
  options: {
    message?: string;
    errors?: string[];
    warnings?: string[];
  } = {}
) {
  if (isValid) {
    return {
      isValid: true,
      branch,
      status: 'success',
      message: options.message || `Template validado com sucesso na branch "${branch}".`,
      warnings: options.warnings || [],
      chartInfo: {
        name: 'test-chart',
        version: '1.0.0',
        apiVersion: 'v2',
        description: 'Chart de teste para validação',
      },
      files: {
        chartYaml: true,
        valuesYaml: true,
        valuesSchemaJson: branch === 'with-schema',
      },
    };
  } else {
    return {
      isValid: false,
      branch,
      status: 'error',
      message: options.message || 'Arquivo Chart.yaml não encontrado no caminho informado.',
      errors: options.errors || ['Arquivo Chart.yaml não encontrado no caminho informado.'],
      files: {
        chartYaml: false,
        valuesYaml: true,
        valuesSchemaJson: false,
      },
    };
  }
}
