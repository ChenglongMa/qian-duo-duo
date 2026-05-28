import { Injectable } from '@nestjs/common';
import {
  categoryYamlDocumentSchema,
  type CategoryYamlDocument,
  type CategoryYamlIssue,
  type CategoryYamlNode
} from '@qdd/shared';
import { parseDocument, stringify } from 'yaml';

const MAX_CATEGORY_DEPTH = 8;

@Injectable()
export class CategoryYamlService {
  validate(yamlText: string): { document: CategoryYamlDocument | null; errors: CategoryYamlIssue[] } {
    const errors: CategoryYamlIssue[] = [];
    const document = parseDocument(yamlText, { uniqueKeys: true });

    for (const error of document.errors) {
      errors.push({
        code: 'YAML_PARSE_ERROR',
        message: error.message,
        path: []
      });
    }

    if (errors.length > 0) {
      return { document: null, errors };
    }

    const parsed = categoryYamlDocumentSchema.safeParse(document.toJSON());
    if (!parsed.success) {
      return {
        document: null,
        errors: parsed.error.issues.map((issue) => ({
          code: 'YAML_SCHEMA_ERROR',
          message: issue.message,
          path: issue.path.filter((part): part is string | number => typeof part === 'string' || typeof part === 'number')
        }))
      };
    }

    errors.push(...this.validateTree(parsed.data.categories));

    return {
      document: errors.length === 0 ? parsed.data : null,
      errors
    };
  }

  stringify(document: CategoryYamlDocument): string {
    return stringify(document, {
      lineWidth: 100
    });
  }

  private validateTree(nodes: CategoryYamlNode[]): CategoryYamlIssue[] {
    const errors: CategoryYamlIssue[] = [];
    const seen = new Set<string>();

    const visit = (items: CategoryYamlNode[], path: Array<string | number>, depth: number): void => {
      if (depth > MAX_CATEGORY_DEPTH) {
        errors.push({
          code: 'CATEGORY_NESTING_TOO_DEEP',
          message: `Category nesting may not exceed ${MAX_CATEGORY_DEPTH} levels.`,
          path
        });
      }

      for (const [index, item] of items.entries()) {
        const itemPath = [...path, index];
        if (seen.has(item.key)) {
          errors.push({
            code: 'CATEGORY_DUPLICATE_KEY',
            message: `Category key "${item.key}" is duplicated.`,
            path: [...itemPath, 'key']
          });
        }
        seen.add(item.key);

        if (item.children) {
          visit(item.children, [...itemPath, 'children'], depth + 1);
        }
      }
    };

    visit(nodes, ['categories'], 1);
    return errors;
  }
}
