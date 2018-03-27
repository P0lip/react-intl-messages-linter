import parse from '../parser';
import { MESSAGES_IMPORT_PATH } from '../consts';
import { isValidMemberName } from './validators';
import { isObject } from '../utils';

export const isMessageImportSpecifier = (node) => {
  if (node.type !== 'ImportDeclaration' || !MESSAGES_IMPORT_PATH.test(node.source.value)) {
    return false;
  }

  return node.specifiers.some(specifier => isValidMemberName(specifier.local.name));
};

export const isDefineMessagesImport = node => node.type === 'ImportDeclaration'
  && node.source.value === 'react-intl'
  && node.specifiers.length === 1
  && node.specifiers[0].imported !== undefined
  && node.specifiers[0].imported.name === 'defineMessages';

export const isValidMessagesShape = (node) => {
  if (!isObject(node) || node.type !== 'ObjectExpression') {
    return false;
  }
  return node.properties
    .some((prop) => {
      switch (prop.type) {
        case 'ObjectExpression':
          return isValidMessagesShape(prop);
        case 'Property':
          if (prop.value.type === 'ObjectExpression') return isValidMessagesShape(prop.value);
          return prop.key.name === 'id'
            && prop.value.type === 'Literal'
            && typeof prop.value.value === 'string';
        default:
          return false;
      }
    });
};

export const computedToString = (node) => {
  switch (node && node.type) {
    case 'MemberExpression':
      return [computedToString(node.object), computedToString(node.property)].join('.');
    case 'Identifier':
      return node.name;
    default:
      return '';
  }
};

export const rewriteComputedMessages = (node) => {
  if (isValidMessagesShape(node)) {
    if ('properties' in node) {
      node.properties
        .forEach((child) => {
          if (child.computed) {
            child.computed = false;
            child.key = parse(`({ '[${computedToString(child.key)}]': 0 })`)
              .body[0]
              .expression
              .properties[0]
              .key;
          }

          if (child.value.type === 'ObjectExpression') {
            rewriteComputedMessages(child.value);
          }
        });
    }
  }
};

export const getMessagesDefinitions = (node) => {
  if (Array.isArray(node)) {
    for (const child of node) {
      const messages = getMessagesDefinitions(child);
      if (messages !== null) return messages;
    }
  }

  switch (node.type) {
    case 'ObjectExpression':
      if (isValidMessagesShape(node)) {
        return node;
      }

      return null;

    case 'CallExpression':
      return getMessagesDefinitions(node.arguments);

    case 'VariableDeclaration':
      return getMessagesDefinitions(
        node.declarations
          .filter(decl => decl.init !== null)
          .map(decl => decl.init),
      );

    case 'ExportNamedDeclaration':
      return getMessagesDefinitions(node.declaration);

    case 'ExportDefaultDeclaration':
      return getMessagesDefinitions(node.declaration);

    case 'Program':
      return getMessagesDefinitions(node.body);

    default:
      return null;
  }
};

export const getMessageImportPaths = (code) => {
  const ast = parse(code);
  if (ast.body !== undefined) {
    return ast.body
      .filter(isMessageImportSpecifier)
      .map(node => ({
        name: node.specifiers[0].local.name,
        source: node.source.value,
      }));
  }

  return [];
};

export const getMessages = (node) => {
  if (!isObject(node)) {
    return [];
  }

  switch (node.type) {
    case 'MemberExpression':
      if (isValidMemberName(node.object.name)) {
        switch (node.property.type) {
          case 'Identifier':
            return [{
              base: node.object.name,
              computed: node.computed,
              name: node.computed
                ? `${node.object.name}[${node.property.name}]`
                : `${node.object.name}.${node.property.name}`,
              safe: !node.computed || node.property.type === 'Literal',
              location: node.object.loc,
            }];
          case 'Literal':
            return [{
              base: node.object.name,
              computed: false,
              name: [node.object.name, node.property.value].join('.'),
              safe: true,
              location: node.object.loc,
            }];
          case 'ConditionalExpression':
            return [
              {
                base: node.object.name,
                computed: false,
                name: [node.object.name, node.property.consequent.value].join('.'),
                safe: node.property.consequent.type === 'Literal',
                location: node.property.consequent.loc,
              },
              {
                base: node.object.name,
                computed: false,
                name: [node.object.name, node.property.alternate.value].join('.'),
                safe: node.property.alternate.type === 'Literal',
                location: node.property.alternate.loc,
              },
            ];
          default:
            return [];
        }
      }

      return [];
    case 'ConditionalExpression':
      return [
        ...getMessages(node.consequent),
        ...getMessages(node.alternate),
      ];
    default:
      return [];
  }
};
