import listMessages from 'src/messages/list-usage';

const location = {
  end: {
    column: expect.any(Number),
    line: expect.any(Number),
  },
  start: {
    column: expect.any(Number),
    line: expect.any(Number),
  },
};

describe('messages/list-usage', () => {
  const validFixtures = [];
  beforeAll(async (done) => {
    validFixtures.push(...await Promise.all([
      'dummy-component/index.jsx',
      'dynamic-messages/index.jsx',
      'shadow-messages.jsx',
    ].map(global.getFixture)));
    done();
  });

  test('excludes VariableDeclarations', async () => {
    const messages = listMessages(validFixtures[2]);
    expect(messages).toHaveLength(1);
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: expect.stringMatching(/messages\.(?:Foo)/),
          safe: true,
          location,
        }),
      ]),
    );
  });

  test('excludes only valid VariableDeclarations', async () => {
    const messages = listMessages(await global.getFixture('./ultra-shadow-messages.jsx'));
    expect(messages).toHaveLength(2);
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: expect.stringMatching(/(warning)?[mM]essages\.(?:Foo|test)/),
          safe: true,
          location,
        }),
      ]),
    );
  });

  test('includes all static messages', () => {
    const messages = listMessages(validFixtures[0]);
    expect(messages).toHaveLength(3);
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: expect.stringMatching(/^messages\.(?:foo|bar|baz)/),
          safe: true,
          location,
        }),
      ]),
    );
  });

  test('lists conditionally rendered messages', () => {
    expect(listMessages(validFixtures[1])).toEqual([
      expect.objectContaining({
        name: 'messages.foo',
        safe: true,
        location,
      }),
      expect.objectContaining({
        name: 'messages.baz',
        safe: true,
        location,
      }),
      expect.objectContaining({
        name: 'messages.bar',
        safe: true,
        location,
      }),
      expect.objectContaining({
        name: 'commonMessages.Alert',
        safe: true,
        location,
      }),
      expect.objectContaining({
        name: 'messages[msg]',
        safe: false,
        location,
      }),
      expect.objectContaining({
        name: 'messages.safeAccess',
        safe: true,
        location,
      }),
    ]);
  });

  test('respects disabling comments', async () => {
    expect(listMessages(await global.getFixture('comments-test.jsx')))
      .toEqual([
        expect.objectContaining({
          base: 'messages',
          computed: false,
          name: 'messages.sh',
          safe: true,
          location,
        }),
        expect.objectContaining({
          base: 'messages',
          computed: true,
          name: 'messages[test]',
          safe: true,
          location,
        }),
      ]);
  });

  test('marks duck-typed property access', async () => {
    const messages = listMessages(await global.getFixture('logical-messages.jsx'));
    expect(messages).toHaveLength(5);
    expect(messages).toEqual([
      expect.objectContaining({
        base: 'messages',
        name: 'messages[msg]',
        safe: true,
        location,
      }),
      expect.objectContaining({
        base: 'messages',
        name: 'messages[msg]',
        safe: true,
        location,
      }),
      expect.objectContaining({
        base: 'messages',
        name: 'messages[test]',
        safe: false,
        location,
      }),
      expect.objectContaining({
        base: 'messages',
        name: 'messages.foo',
        safe: true,
        location,
      }),
      expect.objectContaining({
        base: 'messages',
        name: 'messages[test]',
        safe: true,
        location,
      }),
    ]);
  });

  test('tries to resolve message', async () => {
    const messages = listMessages(await global.getFixture('resolvable-messages.jsx'));
    expect(messages).toHaveLength(2);
    expect(messages).toEqual([
      expect.objectContaining({
        base: 'messages',
        name: 'messages.test',
        safe: true,
        location,
      }),
      expect.objectContaining({
        base: 'messages',
        name: 'messages[foo]',
        safe: false,
        location,
      }),
    ]);
  });
});
