import vm from 'vm';
import escodegen from 'escodegen';
import parse from '../parser';
import defineMessages from './define-messages';
import {
  getMessagesDefinitions,
  isDefineMessagesImport,
  rewriteComputedMessages,
} from '../ast/utils';

const context = {
  allMessages: new Set(),
  require() {
    return {};
  },
};

vm.createContext(context);

const seenSources = {};
export default (code, source) => {
  if (source in seenSources) return seenSources[source];
  const ast = parse(code, {
    sourceType: 'module',
    ecmaVersion: 9,
  });
  const hasMessages = ast.body.some(getMessagesDefinitions);
  if (!hasMessages) return null;

  const importIndex = ast.body.findIndex(isDefineMessagesImport);

  if (importIndex !== -1) {
    ast.body[importIndex] = defineMessages;
  } else {
    ast.body.unshift(defineMessages);
  }

  ast.body.forEach((node, i) => {
    const messages = getMessagesDefinitions(node);
    if (messages !== null) {
      const [wrapped] = parse('defineMessages(null, false)').body;
      rewriteComputedMessages(messages);
      wrapped.expression.arguments[0] = messages;
      ast.body[i] = wrapped;
    } else if (node.type === 'ImportDeclaration') {
      ast.body[i] = parse('require()');
    }
  });

  try {
    const result = vm.runInContext(escodegen.generate(ast), context);
    seenSources[source] = result;
    return result;
  } catch (ex) {
    return ex;
  }
};

export const getStoredMessages = () => Array.from(context.allMessages);
