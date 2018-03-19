import parseJSX from './parse-jsx';
import { isValidNameMember, getMessages } from './ast-utils';
import types from './ast-types';
import { DISABLING_TOKENS } from './consts';

export default (code) => {
  const disabledLines = [];
  const forbiddenDecls = [];
  const foundMessages = [];
  const ast = parseJSX(code, {
    onComment(block, text, start, end, loc) {
      if (!block) {
        const value = text.trim();
        if (value in DISABLING_TOKENS) {
          disabledLines.push(loc.line + DISABLING_TOKENS[value]);
        }
      }
    },
  });

  types.visit(ast, {
    visitVariableDeclaration(path) {
      const found = path.value.declarations.filter(({ id }) => isValidNameMember(id.name));
      if (found.length) {
        forbiddenDecls.push(
          ...found.map(decl => decl.id.name),
        );
        return false;
      }

      this.traverse(path);
      return true;
    },

    visitMemberExpression(path) {
      if (disabledLines.length && disabledLines.includes(path.value.loc.start.line)) {
        return false;
      }

      const messages = getMessages(path.value, forbiddenDecls);
      if (messages.length) {
        foundMessages.push(...messages);
        return false;
      }

      this.traverse(path);
      return true;
    },
  });

  return foundMessages;
};
