describe('Sandbox', () => {
  let sandbox;
  let getStoredMessages;
  beforeEach(async (done) => {
    jest.resetModules();
    ({ default: sandbox, getStoredMessages } = await import('src/sandbox'));
    done();
  });

  afterEach(() => {
    jest.unmock('vm');
  });

  test('stores messages', async () => {
    const messages = await global.getFixture('dummy-component/messages.js');
    sandbox(messages);
    expect(getStoredMessages()).toEqual(['bar']);
  });

  test('returns newly stored messages', async () => {
    const messages = await global.getFixture('dummy-component/messages.js');
    expect(sandbox(messages)).toEqual({
      Foo: {
        id: 'bar',
        defaultMessage: 'Baziiingaaa',
      },
    });
  });

  test('handles exceptions that may happen within sandbox', async () => {
    jest.resetModules();
    jest.mock('vm');
    const vm = await import('vm');
    const { default: localSandbox } = await import('src/sandbox');
    const messages = await global.getFixture('dummy-component/messages.js');
    vm.runInContext.mockImplementation(() => {
      throw new Error();
    });
    expect(() => localSandbox(messages)).not.toThrow();
    expect(vm.runInContext.mock.calls.length).toEqual(1)
  });

  test('resolves imports', async () => {
    const messages = await global.getFixture('import-messages.js');
     expect(sandbox(messages)).toEqual({
       '[consts.TEST]': {
          id: 'yolo',
       },
       Foo: {
         id: 'abc',
       },
       Baz: {
         '[Foo]': {
           id: 'foo_message'
         },
       },
     });
  });
});
