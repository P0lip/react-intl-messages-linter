import * as acorn from 'acorn';

/* istanbul ignore next */
/* global allMessages */
function defineMessages(messages, validateDefaultMessage = true) {
  Object.values(messages).forEach((obj) => {
    const entries = Object.entries(obj);
    if (entries.length >= 1 && typeof entries[0][1] === 'object') {
      defineMessages(obj, validateDefaultMessage);
    } else {
      const {
        id,
        defaultMessage,
      } = obj;
      if (typeof id !== 'string') {
        throw new Error('Invalid message');
      }

      if (validateDefaultMessage && typeof defaultMessage !== 'string') {
        throw new Error('Missing defaultMessage');
      }

      if (validateDefaultMessage && allMessages.has(id)) {
        throw new Error(`${id} is duplicated`);
      }

      allMessages.add(id);
    }
  });

  return messages;
}

export default acorn.parse(Reflect.apply(Function.toString, defineMessages, [])).body[0];
