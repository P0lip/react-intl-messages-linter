import { isObject } from '../utils';

export const pickName = ({ name }) => name;
export const pickBase = ({ base }) => base;

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
