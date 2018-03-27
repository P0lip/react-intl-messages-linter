import parse from 'src/parser';

describe('Parser', () => {
  afterEach(() => {
    jest.unmock('src/cli');
  });

  describe('supports syntax', () => {
    test('JSX is supported', () => {

    });

    test('rest spread operator is supported', () => {

    });
  });

  test('supports options', () => {
    expect(parse('test()', { locations: false })).not.toHaveProperty('loc');
  });

  test('custom parser can be used', async () => {
    jest.resetModules();
    jest.mock('src/cli', () => ({
      parser: 'babel-eslint',
    }));
    const { default: customParse } = await import('src/parser');
    const exp = 'test()';
    expect(customParse(exp)).not.toEqual(parse(exp));
    expect(customParse(exp).body[0]).toHaveProperty('_babelType');
  });
});
