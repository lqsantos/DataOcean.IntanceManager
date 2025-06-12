/**
 * Tests for the Enhanced YAML validator
 */
import { describe, expect, it } from 'vitest';

import type { DefaultValueField } from '../types';
import { ValueSourceType } from '../types';

import {
  formatYaml,
  validateYamlAgainstSchema,
  validateYamlSyntax,
} from './enhanced-yaml-validator';

describe('Enhanced YAML Validator', () => {
  describe('validateYamlSyntax', () => {
    it('should return valid result for valid YAML', () => {
      const yaml = 'key: value\narray:\n  - item1\n  - item2';
      const result = validateYamlSyntax(yaml);

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.document).toBeDefined();
    });

    it('should return invalid result for invalid YAML', () => {
      const yaml = 'key: value\n  - broken indentation\n';
      const result = validateYamlSyntax(yaml);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.document).toBeUndefined();
    });
  });

  describe('validateYamlAgainstSchema', () => {
    const sampleFields: DefaultValueField[] = [
      {
        key: 'required-field',
        value: 'default',
        source: ValueSourceType.TEMPLATE,
        exposed: true,
        overridable: true,
        type: 'string',
        required: true,
        path: ['required-field'],
      },
      {
        key: 'optional-field',
        value: 123,
        source: ValueSourceType.TEMPLATE,
        exposed: true,
        overridable: true,
        type: 'number',
        required: false,
        path: ['optional-field'],
      },
      {
        key: 'nested',
        value: {},
        source: ValueSourceType.TEMPLATE,
        exposed: true,
        overridable: true,
        type: 'object',
        required: false,
        path: ['nested'],
        children: [
          {
            key: 'child',
            value: true,
            source: ValueSourceType.TEMPLATE,
            exposed: true,
            overridable: true,
            type: 'boolean',
            required: true,
            path: ['nested', 'child'],
          },
        ],
      },
    ];

    it('should validate required fields are present', () => {
      const yaml = 'optional-field: 456\nnested:\n  child: true';
      const result = validateYamlAgainstSchema(yaml, sampleFields);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].message).toContain('required-field');
    });

    it('should validate field types', () => {
      const yaml = 'required-field: 123\noptional-field: "string"';
      const result = validateYamlAgainstSchema(yaml, sampleFields);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(2);
    });

    it('should warn about unknown fields', () => {
      const yaml = 'required-field: value\nunknown-field: surprise';
      const result = validateYamlAgainstSchema(yaml, sampleFields);

      expect(result.isValid).toBe(true); // Unknown fields don't make it invalid
      expect(result.warnings?.length).toBe(1);
      expect(result.warnings?.[0].message).toContain('unknown-field');
    });

    it('should validate variable usage', () => {
      const yaml = 'required-field: ${known-var}\noptional-field: ${unknown-var}';
      const blueprintVariables = [{ name: 'known-var', value: 'test' }];

      const result = validateYamlAgainstSchema(yaml, sampleFields, blueprintVariables);

      expect(result.variableWarnings?.length).toBe(1);
      expect(result.variableWarnings?.[0].message).toContain('unknown-var');
    });
  });

  describe('formatYaml', () => {
    it('should format YAML with consistent indentation', () => {
      const unformatted = 'key1:value1\nkey2:  \n  value2\n  key3:   value3';
      const formatted = formatYaml(unformatted);

      expect(formatted).toContain('key1: value1');
      expect(formatted).toContain('key2:');
      expect(formatted).toContain('  value2');
    });

    it('should handle invalid YAML gracefully', () => {
      const invalid = 'key: "unclosed string';
      const result = formatYaml(invalid);

      expect(result).toBe(invalid); // Returns original if can't parse
    });
  });
});
