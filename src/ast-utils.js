import parseJSX from './parse-jsx';

const MESSAGES_IMPORT_PATH = /\.*\/[a-z-]*messages(?:\.js)?$/i;
const MESSAGE_IMPORT_NAME = /[az]*messages$/i;

export const isValidNameMember = name => MESSAGE_IMPORT_NAME.test(name);

export const isMessageImportSpecifier = (node) => {
  if (node.type !== 'ImportDeclaration' || !MESSAGES_IMPORT_PATH.test(node.source.value)) {
    return false;
  }

  return node.specifiers.some(specifier => isValidNameMember(specifier.local.name));
};

export const isDefineMessagesImport = node => node.type === 'ImportDeclaration'
  && node.source.value === 'react-intl'
  && node.specifiers.length === 1
  && node.specifiers[0].imported !== undefined
  && node.specifiers[0].imported.name === 'defineMessages';

export const isMessagesShape = (node) => {
  if (!node || node.type !== 'ObjectExpression') {
    return false;
  }
  return node.properties
    .some((prop) => {
      switch (prop.type) {
        case 'ObjectExpression':
          return isMessagesShape(prop);
        case 'Property':
          if (prop.value.type === 'ObjectExpression') return isMessagesShape(prop.value);
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
  if (isMessagesShape(node)) {
    if ('properties' in node) {
      node.properties
        .forEach((child) => {
          if (child.computed) {
            child.computed = false;
            child.key = parseJSX(`({ '[${computedToString(child.key)}]': 0 })`)
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

export const getMessagesExport = (node) => {
  if (Array.isArray(node)) {
    for (const child of node) {
      const messages = getMessagesExport(child);
      if (messages !== null) return messages;
    }
  }

  switch (node.type) {
    case 'ObjectExpression':
      if (isMessagesShape(node)) {
        return node;
      }

      return null;

    case 'CallExpression':
      return getMessagesExport(node.arguments);

    case 'VariableDeclaration':
      return getMessagesExport(
        node.declarations
          .filter(decl => decl.init !== null)
          .map(decl => decl.init),
      );

    case 'ExportNamedDeclaration':
      return getMessagesExport(node.declaration);

    case 'ExportDefaultDeclaration':
      return getMessagesExport(node.declaration);

    case 'Program':
      return getMessagesExport(node.body);

    default:
      return null;
  }
};

export const getMessageImportPaths = (code) => {
  const ast = parseJSX(code);
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

export const getMessages = (node, forbidden = []) => {
  if (typeof node !== 'object' || node === null) {
    return [];
  }

  switch (node.type) {
    case 'MemberExpression':
      if (isValidNameMember(node.object.name) && !forbidden.includes(node.object.name)) {
        switch (node.property.type) {
          case 'Identifier':
            return [{
              name: node.computed
                ? `${node.object.name}[${node.property.name}]`
                : `${node.object.name}.${node.property.name}`,
              safe: !node.computed || node.property.type === 'Literal',
              location: node.object.loc,
            }];
          case 'Literal':
            return [{
              name: [node.object.name, node.property.value].join('.'),
              safe: true,
              location: node.object.loc,
            }];
          case 'ConditionalExpression':
            return [
              {
                name: [node.object.name, node.property.consequent.value].join('.'),
                safe: node.property.consequent.type === 'Literal',
                location: node.property.consequent.loc,
              },
              {
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
    default:
      return [];
  }
};
