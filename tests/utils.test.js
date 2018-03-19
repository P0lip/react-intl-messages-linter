import {
  isMessagesShape,
} from 'src/utils';

const messages = {
  Foo: {
    id: 'baz',
    defaultMessage: '',
  },
  Bar: {
    id: 'nvm',
  },
};

const nestedMessages = {
  Foo: {
    id: 'foo',
    defaultMessage: '',
  },
  Bar: {
    Baz: {
      id: 'baz',
    },
    Hello: {
      Test: {
        id: 'hello',
        defaultMessage: '',
      },
    },
  },
};

describe('Utils', () => {
  describe('isMessagesShape', () => {
    test('validates shallow messages correctly', () => {
      expect(isMessagesShape(messages)).toBe(true);
    });

    test('validates nested messages correctly', () => {
      expect(isMessagesShape(nestedMessages)).toBe(true);
    });

    test('validates invalid messages correctly', () => {
      expect(isMessagesShape({ foo: {} })).toBe(false);
      expect(isMessagesShape({ foo: { c: { foo: 'bar' } } })).toBe(false);
    });

    test('handles non-object values', () => {
      expect(isMessagesShape()).toBe(false);
      expect(isMessagesShape(null)).toBe(false);
      expect(isMessagesShape(false)).toBe(false);
    });
  });
});
