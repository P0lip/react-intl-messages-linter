import parse from '../parser';
import {
  DISABLING_TOKENS,
  REASON_TYPES,
} from '../consts';
import { pickName } from './utils';
import { getMessages } from '../ast/utils';
import types from '../ast/types';
import {
  isValidMemberExpression,
  isValidVariableDeclarator,
  isValidLogicalExpression,
  isValidCallExpression,
  isValidJSXElement,
} from '../ast/validators';

const matchParentPath = (paths, path) => {
  if (!path) {
    return null;
  }

  if (paths.has(path)) {
    return paths.get(path);
  }

  return matchParentPath(paths, path.parentPath);
};

export class PathStorage extends WeakMap {
  set(path, reason, messages) {
    if (super.has(path)) {
      const cur = super.get(path);
      cur.reasons.push(reason);
      cur.messages.push(...messages);
    } else {
      super.set(path, {
        reasons: [reason],
        messages,
      });
    }

    return true;
  }
}

const isDisabledLine = (path, disabledLines) => (
  disabledLines.size > 0 && disabledLines.has(path.value.loc.start.line)
);

export default (code) => {
  const disabledLines = new Set();
  const metPaths = new PathStorage();
  const foundMessages = [];
  const usedNodes = new WeakSet();

  const ast = parse(code, {
    onComment(block, text, start, end, loc) {
      if (!block) {
        const value = text.trim();
        if (value in DISABLING_TOKENS) {
          disabledLines.add(loc.line + DISABLING_TOKENS[value]);
        }
      }
    },
  });

  types.visit(ast, {
    visitConditionalExpression(path) {
      const node = path.value.test;
      if (isValidMemberExpression(node)) {
        const found = getMessages(node);
        if (found.length) {
          metPaths.set(
            path.parentPath,
            REASON_TYPES.SAFE,
            found.map(pickName),
          );
        }
      }

      this.traverse(path);
    },

    visitLogicalExpression(path) {
      if (isValidLogicalExpression(path.value)) {
        const found = getMessages(path.value.left);
        if (found.length) {
          metPaths.set(
            path.parentPath,
            REASON_TYPES.SAFE,
            found.map(pickName),
          );
        }
      }

      this.traverse(path);
    },

    visitVariableDeclaration(path) {
      let found = path.value.declarations.filter(isValidVariableDeclarator);
      if (found.length) {
        metPaths.set(
          path,
          REASON_TYPES.SKIP,
          found.map(({ id }) => id.name),
        );
        return false;
      }

      found = path.value.declarations
        .reduce((arr, { init }) => [...arr, ...(getMessages(init) || [])], []);

      if (found.length) {
        metPaths.set(
          path.parentPath,
          REASON_TYPES.LINK,
          found,
        );
        return false;
      }

      this.traverse(path);
      return true;
    },

    visitJSXElement(path) {
      if (isValidJSXElement(path.value)) {
        // todo: support {id} attr
        const [spread] = path.value.openingElement.attributes
          .filter(attr => attr.type === 'JSXSpreadAttribute');
        if (spread) {
          usedNodes.add(spread.argument);
        }
      }

      this.traverse(path);
    },

    visitCallExpression(path) {
      if (isDisabledLine(path, disabledLines)) {
        return false;
      }
      if (isValidCallExpression(path.value)) {
        if (path.value.arguments[0].type === 'Identifier') {
          const found = matchParentPath(metPaths, path);
          if (found !== null) {
            foundMessages.push(...found.messages);
          }
        } else {
          usedNodes.add(path.value.arguments[0]);
        }
      }

      this.traverse(path);
      return true;
    },

    visitMemberExpression(path) {
      if (!usedNodes.has(path.value)) return false;

      const metParentPath = matchParentPath(metPaths, path);
      const messages = !metParentPath
        ? getMessages(path.value)
        : getMessages(path.value)
          .filter(message => metParentPath.reasons.every((reason) => {
            switch (reason) {
              case REASON_TYPES.SKIP:
                return !metParentPath.messages.includes(message.base);
              case REASON_TYPES.SAFE:
                if (metParentPath.messages.includes(message.name)) {
                  message.safe = true;
                }
                break;
              default:
                // no default... for now :)
            }

            return true;
          }));

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
