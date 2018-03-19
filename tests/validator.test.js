import path from 'path';
import {
  NO_ERRORS,
  NO_MESSAGES_IMPORT,
  RESOLVING_ERROR,
  UNDEFINED_MESSAGE,
  UNSAFE_USAGE,
} from 'src/consts';
import { PARSING_ERROR } from '../src/consts';
import Reporter from '../src/reporter';

describe('Resolver', () => {
  let glob;
  let Reporter;
  let validate;

  beforeAll(async (done) => {
    jest.mock('glob');
    jest.mock('src/cli');
    jest.mock('src/reporter');
    ({ default: validate } = await import('src/validator'));
    ({ default: Reporter } = await import('src/reporter'));
    Reporter.formatMessage = require.requireActual('src/reporter').default.formatMessage;
    glob = await import('glob');
    done();
  });

  beforeEach(() => {
    Reporter.mockClear();
    glob.shouldFail = false;
    glob.resolveWith = [];
  });

  test('handles IO errors', async () => {
    glob.shouldFail = true;
    await validate();
    const ReporterInstance = Reporter.mock.instances[0];
    expect(ReporterInstance.error).toHaveBeenCalledWith({
      message: glob.ERROR_MSG,
      reason: RESOLVING_ERROR,
    });
  });

  test('reports success state', async () => {
    await validate();
    const ReporterInstance = Reporter.mock.instances[0];
    expect(ReporterInstance.success).toHaveBeenCalledWith({
      message: '',
      reason: NO_ERRORS,
    });
  });

  test('reports filename', async () => {
    glob.resolveWith = [
      'missing-imports.jsx',
      'invalid-syntax.js'
    ];

    await validate();
    const ReporterInstance = Reporter.mock.instances[0];
    expect(ReporterInstance.file).toHaveBeenCalledTimes(2);
    expect(ReporterInstance.file.mock.calls).toEqual(expect.arrayContaining([
      ...[
        ['missing-imports.jsx'],
        ['invalid-syntax.js'],
      ].map(([name]) => [path.resolve(global.BASE_PATH, name)]),
    ]));
  });

  test('reports parsing error(s)', async () => {
    glob.resolveWith = [
      'invalid-syntax.js'
    ];

    await validate();
    const ReporterInstance = Reporter.mock.instances[0];
    expect(ReporterInstance.error).toHaveBeenCalledWith({
      reason: PARSING_ERROR,
      message: expect.any(String),
    });
  });

  test('reports missing imports', async () => {
    glob.resolveWith = [
      'missing-imports.jsx',
    ];

    await validate();
    const ReporterInstance = Reporter.mock.instances[0];
    expect(ReporterInstance.error).toHaveBeenCalledWith({
      reason: NO_MESSAGES_IMPORT,
      message: '',
    });
  });

  test('reports unsafe message usage', async () => {
    glob.resolveWith = [
      'unsafe-usage.jsx',
    ];

    await validate();
    const ReporterInstance = Reporter.mock.instances[0];
    expect(ReporterInstance.success).not.toHaveBeenCalled();
    expect(ReporterInstance.warn).toHaveBeenCalledWith({
      reason: UNSAFE_USAGE,
      message: expect.stringMatching(/messages[\[\].A-za-z]+\sat\s\d+:\d+/),
    });
  });

  test('reports unsafe message usage', async () => {
     glob.resolveWith = [
       'unsafe-usage.jsx',
     ];

     await validate();
     const ReporterInstance = Reporter.mock.instances[0];
     expect(ReporterInstance.success).not.toHaveBeenCalled();
     expect(ReporterInstance.warn).toHaveBeenCalledWith({
       reason: UNSAFE_USAGE,
       message: expect.stringMatching(/messages[.\[\]A-za-z]+\sat\s\d+:\d+/),
     });
   });
});
