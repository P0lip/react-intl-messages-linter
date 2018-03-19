import * as acorn from 'acorn';

/* istanbul ignore next */
/* global allMessages */
function defineMessages(messages) {
  Object.values(messages).forEach((obj) => {
    const entries = Object.entries(obj);
    if (entries.length >= 1 && typeof entries[0][1] === 'object') {
      defineMessages(obj);
    } else {
      const {
        id,
        // defaultMessage,
      } = obj;
      if (typeof id !== 'string') {
        throw new Error('Invalid message');
      }

      if (allMessages.has(id)) {
        // fixme: file path must be taken into account
        // throw new Error(`${id} is duplicated`);
      }

      allMessages.add(id);
    }
  });

  return messages;
}

export default acorn.parse(Reflect.apply(Function.toString, defineMessages, [])).body[0];
