import {
  MESSAGES_IMPORT_NAME,
  SAFE_LOGICAL_EXPRESSIONS,
} from '../consts';
import TOKENS, { VALID_FUNCTION_NAMES, VALID_JSX_ELEMENTS } from './consts';
import { isObject } from '../utils';

export const isValidNode = node => isObject(node) && 'type' in node;

export const isValidMemberName = name => MESSAGES_IMPORT_NAME.test(name);

const isValidCallee = (node) => {
  if (!isValidNode(node)) return false;
  switch (node.type) {
    case TOKENS.MEMBER_EXPRESSION:
      return isValidCallee(node.property);
    case TOKENS.IDENTIFIER:
      return VALID_FUNCTION_NAMES.includes(node.name);
    default:
      return false;
  }
};

export const isValidCallExpression = node => isValidNode(node) &&
  node.type === 'CallExpression' &&
  isValidCallee(node.callee) &&
  node.arguments.length >= 1;

export const isValidMemberExpression = node => isValidNode(node) &&
  node.type === TOKENS.MEMBER_EXPRESSION &&
  isValidMemberName(node.object.name) &&
  node.property.type === TOKENS.IDENTIFIER;

export const isValidLogicalExpression = node => isValidNode(node) &&
  node.type === 'LogicalExpression' &&
  SAFE_LOGICAL_EXPRESSIONS.includes(node.operator) &&
  isValidMemberExpression(node.left);

export const isValidJSXElement = node => isValidNode(node) &&
  node.type === 'JSXElement' &&
  VALID_JSX_ELEMENTS.includes(node.openingElement.name.name);

export const isValidVariableDeclarator = node => isValidNode(node) &&
  node.type === TOKENS.VARIABLE_DECLARATOR &&
  isValidMemberName(node.id.name);
