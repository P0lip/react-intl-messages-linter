import consts from '../consts';

export default {
  [consts.TEST]: {
    id: 'yolo',
  },
  Foo: {
    id: 'abc',
  },
  Baz: {
    [Foo]: {
      id: 'foo_message',
    },
  },
};
