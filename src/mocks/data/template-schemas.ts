import type {
  DefaultValueField,
  ValueSourceType,
} from '@/components/blueprints/sections/DefaultValuesSection/types';

// Helper function for generating chart description
export function generateChartDescription(): string | undefined {
  return Math.random() > 0.3 ? 'Um chart exemplo para demonstração da validação' : undefined;
}

// Mock data for template schemas
export const generateMockSchemaForTemplate = (templateId: string) => {
  // Generate different schemas based on template ID
  let templateType = 'generic';

  if (templateId.includes('database')) {
    templateType = 'database';
  } else if (templateId.includes('application')) {
    templateType = 'application';
  } else if (templateId.includes('network')) {
    templateType = 'network';
  }

  let fields: DefaultValueField[] = [];
  let rawYaml = '';

  switch (templateType) {
    case 'database':
      fields = getDatabaseTemplateFields();
      rawYaml = `database:
  name: my-database
  engine: postgres
  version: "14.3"
  resources:
    cpu: "1"
    memory: "2Gi"
persistence:
  enabled: true
  size: "10Gi"`;
      break;

    case 'application':
      fields = getApplicationTemplateFields();
      rawYaml = `application:
  replicas: 2
  image:
    repository: nginx
    tag: latest
ingress:
  enabled: true
  hostname: example.com`;
      break;

    case 'network':
      fields = getNetworkTemplateFields();
      rawYaml = `network:
  type: internal
  createIngress: true
  ports:
    - name: http
      port: 80
      targetPort: 8080
      protocol: TCP`;
      break;

    default:
      fields = getGenericTemplateFields();
      rawYaml = `generic:
  param1: value1
  param2: value2`;
  }

  return {
    fields,
    rawYaml,
  };
};

// Mock fields for database templates
export function getDatabaseTemplateFields(): DefaultValueField[] {
  return [
    {
      key: 'database',
      displayName: 'Database Configuration',
      description: 'Database instance configuration',
      value: null,
      source: 'template' as ValueSourceType,
      exposed: true,
      overridable: true,
      type: 'object',
      required: true,
      path: ['database'],
      children: [
        {
          key: 'name',
          displayName: 'Database Name',
          description: 'Name of the database to create',
          value: 'my-database',
          source: 'template' as ValueSourceType,
          exposed: true,
          overridable: true,
          type: 'string',
          required: true,
          path: ['database', 'name'],
        },
        {
          key: 'engine',
          displayName: 'Database Engine',
          description: 'Type of database to use',
          value: 'postgres',
          source: 'template' as ValueSourceType,
          exposed: true,
          overridable: false,
          type: 'string',
          required: true,
          path: ['database', 'engine'],
        },
        {
          key: 'version',
          displayName: 'Engine Version',
          description: 'Version of the database engine',
          value: '14.3',
          source: 'template' as ValueSourceType,
          exposed: true,
          overridable: true,
          type: 'string',
          required: true,
          path: ['database', 'version'],
        },
        {
          key: 'resources',
          displayName: 'Resources',
          description: 'Database resource requirements',
          value: null,
          source: 'template' as ValueSourceType,
          exposed: true,
          overridable: true,
          type: 'object',
          required: true,
          path: ['database', 'resources'],
          children: [
            {
              key: 'cpu',
              displayName: 'CPU',
              description: 'CPU cores allocated to the database',
              value: '1',
              source: 'template' as ValueSourceType,
              exposed: true,
              overridable: true,
              type: 'string',
              required: true,
              path: ['database', 'resources', 'cpu'],
            },
            {
              key: 'memory',
              displayName: 'Memory',
              description: 'Memory allocated to the database',
              value: '2Gi',
              source: 'template' as ValueSourceType,
              exposed: true,
              overridable: true,
              type: 'string',
              required: true,
              path: ['database', 'resources', 'memory'],
            },
          ],
        },
      ],
    },
    {
      key: 'persistence',
      displayName: 'Persistence Configuration',
      description: 'Database persistence settings',
      value: null,
      source: 'template' as ValueSourceType,
      exposed: true,
      overridable: true,
      type: 'object',
      required: false,
      path: ['persistence'],
      children: [
        {
          key: 'enabled',
          displayName: 'Enable Persistence',
          description: 'Whether to enable persistent storage',
          value: true,
          source: 'template' as ValueSourceType,
          exposed: true,
          overridable: true,
          type: 'boolean',
          required: false,
          path: ['persistence', 'enabled'],
        },
        {
          key: 'size',
          displayName: 'Storage Size',
          description: 'Size of the persistent volume',
          value: '10Gi',
          source: 'template' as ValueSourceType,
          exposed: true,
          overridable: true,
          type: 'string',
          required: false,
          path: ['persistence', 'size'],
        },
      ],
    },
  ];
}

// Mock fields for application templates
export function getApplicationTemplateFields(): DefaultValueField[] {
  return [
    {
      key: 'application',
      displayName: 'Application Configuration',
      description: 'Application deployment configuration',
      value: null,
      source: 'template' as ValueSourceType,
      exposed: true,
      overridable: true,
      type: 'object',
      required: true,
      path: ['application'],
      children: [
        {
          key: 'replicas',
          displayName: 'Replicas',
          description: 'Number of application replicas',
          value: 2,
          source: 'template' as ValueSourceType,
          exposed: true,
          overridable: true,
          type: 'number',
          required: true,
          path: ['application', 'replicas'],
        },
        {
          key: 'image',
          displayName: 'Container Image',
          description: 'Container image configuration',
          value: null,
          source: 'template' as ValueSourceType,
          exposed: true,
          overridable: true,
          type: 'object',
          required: true,
          path: ['application', 'image'],
          children: [
            {
              key: 'repository',
              displayName: 'Image Repository',
              description: 'Docker image repository',
              value: 'nginx',
              source: 'template' as ValueSourceType,
              exposed: true,
              overridable: true,
              type: 'string',
              required: true,
              path: ['application', 'image', 'repository'],
            },
            {
              key: 'tag',
              displayName: 'Image Tag',
              description: 'Docker image tag',
              value: 'latest',
              source: 'template' as ValueSourceType,
              exposed: true,
              overridable: true,
              type: 'string',
              required: true,
              path: ['application', 'image', 'tag'],
            },
          ],
        },
      ],
    },
    {
      key: 'ingress',
      displayName: 'Ingress Configuration',
      description: 'Application ingress settings',
      value: null,
      source: 'template' as ValueSourceType,
      exposed: true,
      overridable: true,
      type: 'object',
      required: false,
      path: ['ingress'],
      children: [
        {
          key: 'enabled',
          displayName: 'Enable Ingress',
          description: 'Whether to create an ingress resource',
          value: true,
          source: 'template' as ValueSourceType,
          exposed: true,
          overridable: true,
          type: 'boolean',
          required: false,
          path: ['ingress', 'enabled'],
        },
        {
          key: 'hostname',
          displayName: 'Hostname',
          description: 'Hostname for the ingress',
          value: 'example.com',
          source: 'template' as ValueSourceType,
          exposed: true,
          overridable: true,
          type: 'string',
          required: false,
          path: ['ingress', 'hostname'],
        },
      ],
    },
  ];
}

// Mock fields for network templates
export function getNetworkTemplateFields(): DefaultValueField[] {
  return [
    {
      key: 'network',
      displayName: 'Network Configuration',
      description: 'Network service configuration',
      value: null,
      source: 'template' as ValueSourceType,
      exposed: true,
      overridable: true,
      type: 'object',
      required: true,
      path: ['network'],
      children: [
        {
          key: 'type',
          displayName: 'Network Type',
          description: 'Type of network service',
          value: 'internal',
          source: 'template' as ValueSourceType,
          exposed: true,
          overridable: true,
          type: 'string',
          required: true,
          path: ['network', 'type'],
        },
        {
          key: 'createIngress',
          displayName: 'Create Ingress',
          description: 'Whether to create an ingress for the service',
          value: true,
          source: 'template' as ValueSourceType,
          exposed: true,
          overridable: true,
          type: 'boolean',
          required: true,
          path: ['network', 'createIngress'],
        },
        {
          key: 'ports',
          displayName: 'Service Ports',
          description: 'Network ports configuration',
          value: null,
          source: 'template' as ValueSourceType,
          exposed: true,
          overridable: true,
          type: 'array',
          required: true,
          path: ['network', 'ports'],
          children: [
            {
              key: 'name',
              displayName: 'Port Name',
              description: 'Name of the port',
              value: 'http',
              source: 'template' as ValueSourceType,
              exposed: true,
              overridable: true,
              type: 'string',
              required: true,
              path: ['network', 'ports', '*', 'name'],
            },
            {
              key: 'port',
              displayName: 'Port Number',
              description: 'External port number',
              value: 80,
              source: 'template' as ValueSourceType,
              exposed: true,
              overridable: true,
              type: 'number',
              required: true,
              path: ['network', 'ports', '*', 'port'],
            },
            {
              key: 'targetPort',
              displayName: 'Target Port',
              description: 'Container port number',
              value: 8080,
              source: 'template' as ValueSourceType,
              exposed: true,
              overridable: true,
              type: 'number',
              required: true,
              path: ['network', 'ports', '*', 'targetPort'],
            },
            {
              key: 'protocol',
              displayName: 'Protocol',
              description: 'Network protocol',
              value: 'TCP',
              source: 'template' as ValueSourceType,
              exposed: true,
              overridable: false,
              type: 'string',
              required: true,
              path: ['network', 'ports', '*', 'protocol'],
            },
          ],
        },
      ],
    },
  ];
}

// Mock fields for generic templates
export function getGenericTemplateFields(): DefaultValueField[] {
  return [
    {
      key: 'generic',
      displayName: 'Generic Configuration',
      description: 'Generic template configuration',
      value: null,
      source: 'template' as ValueSourceType,
      exposed: true,
      overridable: true,
      type: 'object',
      required: true,
      path: ['generic'],
      children: [
        {
          key: 'param1',
          displayName: 'Parameter 1',
          description: 'First generic parameter',
          value: 'value1',
          source: 'template' as ValueSourceType,
          exposed: true,
          overridable: true,
          type: 'string',
          required: true,
          path: ['generic', 'param1'],
        },
        {
          key: 'param2',
          displayName: 'Parameter 2',
          description: 'Second generic parameter',
          value: 'value2',
          source: 'template' as ValueSourceType,
          exposed: true,
          overridable: true,
          type: 'string',
          required: false,
          path: ['generic', 'param2'],
        },
      ],
    },
  ];
}
