import vm from 'vm';
import escodegen from 'escodegen';
import parse from './parse-jsx';
import defineMessages from './define-messages';
import {
  getMessagesExport,
  isDefineMessagesImport, rewriteComputedMessages,
} from './ast-utils';

const context = {
  allMessages: new Set(),
  require() {
    return {};
  },
};

vm.createContext(context);

export default (code) => {
  const ast = parse(code, {
    sourceType: 'module',
    ecmaVersion: 9,
  });
  const hasMessages = ast.body.some(getMessagesExport);
  if (!hasMessages) return null;

  const importIndex = ast.body.findIndex(isDefineMessagesImport);

  if (importIndex !== -1) {
    ast.body[importIndex] = defineMessages;
  } else {
    ast.body.unshift(defineMessages);
  }

  ast.body.forEach((node, i) => {
    const messages = getMessagesExport(node);
    if (messages !== null) {
      const [wrapped] = parse('defineMessages(null)').body;
      rewriteComputedMessages(messages);
      wrapped.expression.arguments[0] = messages;
      ast.body[i] = wrapped;
    } else if (node.type === 'ImportDeclaration') {
      ast.body[i] = parse('require()');
    }
  });

  try {
    return vm.runInContext(escodegen.generate(ast), context);
  } catch (ex) {
    return ex;
  }
};

export const getStoredMessages = () => Array.from(context.allMessages);
