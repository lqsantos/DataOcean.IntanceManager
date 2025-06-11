import { http, HttpResponse } from 'msw';

import { server } from '@/mocks/server';

import type { ValueSourceType } from '../components/blueprints/sections/DefaultValuesSection/types';

import { fetchTemplateSchemaForDefaultValues } from './template-schema-service';

describe('template-schema-service', () => {
  describe('fetchTemplateSchemaForDefaultValues', () => {
    it('should fetch template schema successfully', async () => {
      // Override the handler just for this test
      server.use(
        http.get('/api/templates/:id/schema', ({ params }) => {
          const { id } = params;

          if (id === 'test-template') {
            return HttpResponse.json({
              fields: [
                {
                  key: 'test',
                  displayName: 'Test Configuration',
                  description: 'Test configuration',
                  value: null,
                  source: 'template' as ValueSourceType,
                  exposed: true,
                  overridable: true,
                  type: 'object',
                  required: true,
                  path: ['test'],
                  children: [
                    {
                      key: 'value',
                      displayName: 'Test Value',
                      description: 'Test value field',
                      value: 'test-value',
                      source: 'template' as ValueSourceType,
                      exposed: true,
                      overridable: true,
                      type: 'string',
                      required: true,
                      path: ['test', 'value'],
                    },
                  ],
                },
              ],
              rawYaml: 'test:\n  value: test-value',
            });
          }

          return HttpResponse.error();
        })
      );

      const result = await fetchTemplateSchemaForDefaultValues('test-template');

      expect(result).toHaveProperty('fields');
      expect(result).toHaveProperty('rawYaml');
      expect(result.fields).toHaveLength(1);
      expect(result.fields[0].key).toBe('test');
      expect(result.rawYaml).toBe('test:\n  value: test-value');
    });

    it('should throw an error when the API returns an error response', async () => {
      // Override the handler just for this test
      server.use(
        http.get('/api/templates/:id/schema', ({ params }) => {
          const { id } = params;

          if (id === 'error-template') {
            return new HttpResponse(null, { status: 404 });
          }

          return HttpResponse.error();
        })
      );

      await expect(fetchTemplateSchemaForDefaultValues('error-template')).rejects.toThrow(
        'Failed to load schema for template error-template'
      );
    });

    it('should handle empty responses', async () => {
      // Override the handler just for this test
      server.use(
        http.get('/api/templates/:id/schema', ({ params }) => {
          const { id } = params;

          if (id === 'empty-template') {
            return HttpResponse.json({
              fields: [],
              rawYaml: '',
            });
          }

          return HttpResponse.error();
        })
      );

      const result = await fetchTemplateSchemaForDefaultValues('empty-template');

      expect(result).toHaveProperty('fields');
      expect(result).toHaveProperty('rawYaml');
      expect(result.fields).toHaveLength(0);
      expect(result.rawYaml).toBe('');
    });
  });
});
