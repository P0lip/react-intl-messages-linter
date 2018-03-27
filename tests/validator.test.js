import path from 'path';
import {
  NO_ERRORS,
  NO_MESSAGES_IMPORT,
  RESOLVING_ERROR,
  UNSAFE_USAGE,
  PARSING_ERROR,
} from 'src/consts';

describe('Resolver', () => {
  let glob;
  let Reporter;
  let validate;

  const formatMessage = jest.fn(require.requireActual('src/reporter').default.formatMessage);

  const fns = {
    file: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
    stats: {},
  };

  beforeAll(async (done) => {
    jest.mock('glob');
    jest.mock('src/cli');
    jest.mock('src/reporter');
    jest.doMock('src/reporter', () => {
      const fn = jest.fn();
      fn.formatMessage = formatMessage;
      fn.mockImplementation(() => fns);
      return fn;
    });
    ({ default: validate } = await import('src/validator'));
    Reporter = await import('src/reporter');
    glob = await import('glob');
    done();
  });

  afterEach(() => {
    Reporter.mockClear();
    Object.values(fns).forEach((fn) => {
      if (typeof fn === 'function') {
        fn.mockClear();
      }
    });
    formatMessage.mockClear();
    glob.shouldFail = false;
    glob.resolveWith = [];
  });

  test('handles IO errors', async () => {
    glob.shouldFail = true;
    await validate();
    expect(fns.error).toHaveBeenCalledWith({
      message: glob.ERROR_MSG,
      reason: RESOLVING_ERROR,
    });
  });

  test('reports success state', async () => {
    await validate();
    expect(fns.success).toHaveBeenCalledWith({
      message: '',
      reason: NO_ERRORS,
    });
  });

  test('reports filename', async () => {
    glob.resolveWith = [
      'missing-imports.jsx',
      'syntax/invalid.js',
    ];

    await validate();
    expect(fns.file).toHaveBeenCalledTimes(2);
    expect(fns.file.mock.calls).toEqual(expect.arrayContaining([
      ...[
        ['missing-imports.jsx'],
        ['syntax/invalid.js'],
      ].map(([name]) => [path.resolve(global.BASE_PATH, name)]),
    ]));
  });

  test('reports parsing error(s)', async () => {
    glob.resolveWith = [
      'syntax/invalid.js',
    ];

    await validate();
    expect(fns.error).toHaveBeenCalledWith({
      reason: PARSING_ERROR,
      message: expect.any(String),
    });
  });

  test('reports missing imports', async () => {
    glob.resolveWith = [
      'missing-imports.jsx',
    ];

    await validate();
    expect(fns.error).toHaveBeenCalledWith({
      reason: NO_MESSAGES_IMPORT,
      message: '',
    });
  });

  test('reports unsafe message usage', async () => {
    glob.resolveWith = [
      'unsafe-usage.jsx',
    ];

    await validate();
    expect(fns.success).toHaveBeenCalledTimes(1);
    expect(fns.success).toHaveBeenCalledWith({
      message: '',
      reason: NO_ERRORS,
    });
    expect(fns.warn).toHaveBeenCalledWith({
      reason: UNSAFE_USAGE,
      message: expect.stringMatching(/messages[[\].A-za-z]+\sat\s\d+:\d+/),
    });
  });
});
