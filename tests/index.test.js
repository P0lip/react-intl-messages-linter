describe('react-intl-messages-linter', () => {
  beforeAll(() => {
    jest.mock('src/cli');
  });

  beforeEach(() => {
    jest.unmock('src/validator');
  });

  afterAll(() => {
    jest.unmock('src/cli');
  });

  test('runs validator', async () => {
    jest.mock('src/validator');
    const { default: validator } = await import('src/validator');
    await import('src/index');
    expect(validator).toHaveBeenCalled();
  });

  test('handles any error', async (done) => {
    jest.mock('src/validator', () => ({
      default() {
        throw new Error();
      },
    }));
    jest.resetModules();
    jest.mock('src/console');
    const { default: debug } = await import('src/console');
    expect(debug.error).not.toHaveBeenCalled();
    await import('src/index');
    setTimeout(() => {
      expect(debug.error).toHaveBeenCalled();
      done();
    }, 4);
  });
});
