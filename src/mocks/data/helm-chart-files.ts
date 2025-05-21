/**
 * Mock data for Helm chart files
 * This represents the content of Chart.yaml, values.schema.json, and values.yaml files
 */
export const helmChartFiles = [
  // Repository 1 - web-app Chart.yaml
  {
    gitRepositoryId: '1',
    branch: 'main',
    path: '/charts/web-app/Chart.yaml',
    content: `apiVersion: v2
name: web-app
description: A Helm chart for web applications
type: application
version: 1.0.0
appVersion: "1.0.0"
maintainers:
  - name: DevOps Team
    email: devops@example.com
`,
  },

  // Repository 1 - web-app values.schema.json
  {
    gitRepositoryId: '1',
    branch: 'main',
    path: '/charts/web-app/values.schema.json',
    content: `{
  "$schema": "http://json-schema.org/schema#",
  "type": "object",
  "required": ["replicaCount", "image"],
  "properties": {
    "replicaCount": {
      "type": "integer",
      "minimum": 1,
      "default": 1
    },
    "image": {
      "type": "object",
      "required": ["repository", "tag"],
      "properties": {
        "repository": {
          "type": "string"
        },
        "tag": {
          "type": "string"
        },
        "pullPolicy": {
          "type": "string",
          "enum": ["Always", "IfNotPresent", "Never"],
          "default": "IfNotPresent"
        }
      }
    },
    "service": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["ClusterIP", "NodePort", "LoadBalancer"],
          "default": "ClusterIP"
        },
        "port": {
          "type": "integer",
          "default": 80
        }
      }
    }
  }
}`,
  },

  // Repository 1 - web-app values.yaml
  {
    gitRepositoryId: '1',
    branch: 'main',
    path: '/charts/web-app/values.yaml',
    content: `# Default values for web-app
replicaCount: 1

image:
  repository: nginx
  tag: stable
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: false
  annotations: {}
  hosts:
    - host: chart-example.local
      paths: ["/"]
  tls: []

resources:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 128Mi
`,
  },

  // Repository 1 - static-site Chart.yaml
  {
    gitRepositoryId: '1',
    branch: 'main',
    path: '/charts/static-site/Chart.yaml',
    content: `apiVersion: v2
name: static-site
description: A Helm chart for static sites
type: application
version: 1.1.0
appVersion: "1.0.0"
maintainers:
  - name: DevOps Team
    email: devops@example.com
`,
  },

  // Repository 1 - static-site values.schema.json
  {
    gitRepositoryId: '1',
    branch: 'main',
    path: '/charts/static-site/values.schema.json',
    content: `{
  "$schema": "http://json-schema.org/schema#",
  "type": "object",
  "required": ["image"],
  "properties": {
    "image": {
      "type": "object",
      "required": ["repository", "tag"],
      "properties": {
        "repository": {
          "type": "string"
        },
        "tag": {
          "type": "string"
        }
      }
    }
  }
}`,
  },

  // Repository 2 - api-service Chart.yaml
  {
    gitRepositoryId: '2',
    branch: 'main',
    path: '/charts/api-service/Chart.yaml',
    content: `apiVersion: v2
name: api-service
description: A Helm chart for API microservices
type: application
version: 2.1.0
appVersion: "2.0.0"
maintainers:
  - name: API Team
    email: api@example.com
`,
  },

  // Repository 2 - api-service values.schema.json
  {
    gitRepositoryId: '2',
    branch: 'main',
    path: '/charts/api-service/values.schema.json',
    content: `{
  "$schema": "http://json-schema.org/schema#",
  "type": "object",
  "required": ["replicaCount", "image", "database"],
  "properties": {
    "replicaCount": {
      "type": "integer",
      "minimum": 1
    },
    "image": {
      "type": "object",
      "required": ["repository", "tag"],
      "properties": {
        "repository": {
          "type": "string"
        },
        "tag": {
          "type": "string"
        }
      }
    },
    "database": {
      "type": "object",
      "required": ["url", "username", "password"],
      "properties": {
        "url": {
          "type": "string"
        },
        "username": {
          "type": "string"
        },
        "password": {
          "type": "string"
        }
      }
    }
  }
}`,
  },

  // Repository 1 - database Chart.yaml (in develop branch)
  {
    gitRepositoryId: '1',
    branch: 'develop',
    path: '/charts/database/Chart.yaml',
    content: `apiVersion: v2
name: database
description: A Helm chart for database deployments
type: application
version: 1.2.0
appVersion: "1.0.0"
maintainers:
  - name: Database Team
    email: db@example.com
`,
  },

  // Repository 1 - database values.schema.json (in develop branch)
  {
    gitRepositoryId: '1',
    branch: 'develop',
    path: '/charts/database/values.schema.json',
    content: `{
  "$schema": "http://json-schema.org/schema#",
  "type": "object",
  "required": ["storage"],
  "properties": {
    "storage": {
      "type": "object",
      "required": ["size"],
      "properties": {
        "size": {
          "type": "string",
          "pattern": "^[0-9]+(Gi|Mi)$"
        },
        "storageClass": {
          "type": "string"
        }
      }
    }
  }
}`,
  },

  // Repository 1 - database values.yaml (in develop branch)
  {
    gitRepositoryId: '1',
    branch: 'develop',
    path: '/charts/database/values.yaml',
    content: `# Default values for database
storage:
  size: 10Gi
  storageClass: standard

credentials:
  rootPassword: changeme
  username: user
  password: changeme

backup:
  enabled: true
  schedule: "0 0 * * *"
  retention: 7
`,
  },
];
