import listMessages from 'src/list-messages';

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

describe('listMessages', () => {
  const validFixtures = [];
  beforeAll(async (done) => {
    validFixtures.push(...await Promise.all([
      'dummy-component/index.jsx',
      'dynamic-messages/index.jsx',
      'spread-operator.js',
      'shadow-messages.jsx',
    ].map(global.getFixture)));
    done();
  });

  test('parses valid jsx? syntax', () => {
    validFixtures.forEach((fixture) => {
      listMessages(fixture);
      expect(() => listMessages(fixture)).not.toThrow();
    });
  });

  test('excludes VariableDeclarations', () => {
    const messages = listMessages(validFixtures[3]);
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

  xtest('excludes only valid VariableDeclarations', async () => {
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
          name: 'messages.sh',
          safe: true,
          location,
        }),
      ]);
  });
});
