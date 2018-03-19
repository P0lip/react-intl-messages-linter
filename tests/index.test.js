describe('check-react-intl-messages', () => {
  const { error } = console;

  beforeAll(() => {
    jest.mock('src/cli');
    console.error = jest.fn();
  });

  beforeEach(() => {
    jest.unmock('src/validator');
    console.error.mockClear();
  });

  afterAll(() => {
    jest.unmock('src/cli');
    console.error = error;
  });

  test('runs validator', async () => {
    jest.mock('src/validator');
    const { default: validator } = await import('src/validator');
    await import('src/index');
    expect(validator).toHaveBeenCalled();
  });

  test('handles any error', async (done) => {
    expect(console.error).not.toHaveBeenCalled();
    jest.mock('src/validator', () => ({
       default() {
         throw new Error();
       },
     }));
    jest.resetModules();
    await import('src/index');
    setTimeout(() => {
      expect(console.error).toHaveBeenCalled();
      done();
    }, 4);
   });
});
