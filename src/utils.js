const isObject = obj => typeof obj === 'object' && obj !== null;

export const isMessagesShape = (messages) => {
  if (!isObject(messages)) return false;
  const values = Object.values(messages);
  return values.length > 0 && values
    .every((val) => {
      if (isObject(val)) {
        if ('id' in val) {
          return true;
        }

        return isMessagesShape(val);
      }

      return false;
    });
};
