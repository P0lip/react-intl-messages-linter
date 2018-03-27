import path from 'path';
import resolver from 'src/fs/resolver';
import {
  FileError,
  ParsingError,
  MissingImports,
} from 'src/errors';

const { BASE_PATH } = global;

const resolveOpts = {
  extensions: ['.js', '.jsx'],
  modules: [BASE_PATH],
};

describe('List-files', () => {
  let glob;
  const setup = {
    cwd: BASE_PATH,
    searchIn: BASE_PATH,
    resolver: resolver(resolveOpts),
  };

  beforeAll(async (done) => {
    jest.mock('glob');
    jest.mock('src/parser');
    glob = await import('glob');
    done();
  });

  beforeEach(() => {
    glob.resolveWith = [];
  });

  test('graceful handling of parsing error', async () => {
    const { default: listFiles } = await import('src/fs/inspect-files');
    glob.resolveWith = [
      'syntax/invalid.js',
    ];

    const cases = await listFiles(setup);
    expect(cases).toEqual([{
      filename: expect.stringMatching(new RegExp(glob.resolveWith[0])),
      imports: {},
      messages: [],
      error: expect.any(ParsingError),
    }]);
  });

  test('graceful handling of file error', async () => {
    const { default: listFiles } = await import('src/fs/inspect-files');
    glob.resolveWith = [
      'unresolvable-component.jsx',
    ];

    const cases = await listFiles(setup);
    expect(cases).toEqual([{
      filename: expect.stringMatching(new RegExp(glob.resolveWith[0])),
      imports: {},
      messages: [{
        base: 'messages',
        computed: false,
        name: 'messages.test',
        location: undefined,
        safe: true,
      }],
      error: expect.any(FileError),
    }]);
  });

  test('lists missing import cases', async () => {
    const { default: listFiles } = await import('src/fs/inspect-files');
    glob.resolveWith = [
      'missing-imports.jsx',
      'missing-imports2.jsx',
    ];

    const expected = [expect.objectContaining({
      filename: expect.stringMatching(new RegExp(`${BASE_PATH}/missing-imports\\d?.jsx`)),
      imports: {},
      messages: expect.arrayContaining([expect.objectContaining({
        name: expect.any(String),
        safe: expect.any(Boolean),
        location: undefined,
      })]),
      error: expect.any(MissingImports),
    })];

    const cases = await listFiles(setup);
    expect(cases).toEqual(
      expect.arrayContaining(expected),
    );
  });

  test('lists unsafe accesses', async () => {
    const { default: listFiles } = await import('src/fs/inspect-files');
    glob.resolveWith = [
      'dynamic-messages/index.jsx',
    ];

    const location = undefined;

    const expected = {
      filename: path.resolve(BASE_PATH, glob.resolveWith[0]),
      imports: {
        commonMessages: {
          Alert: {
            id: 'alert',
            defaultMessage: 'Ey yooo xD',
          },
        },
        messages: {
          Foo: {
            id: 'bar',
            defaultMessage: 'Baziiingaaa',
          },
        },
      },
      messages: [
        {
          computed: false, name: 'messages.foo', safe: true, location, base: 'messages',
        },
        {
          computed: false, name: 'messages.baz', safe: true, location, base: 'messages',
        },
        {
          computed: false, name: 'messages.bar', safe: true, location, base: 'messages',
        },
        {
          computed: false, name: 'commonMessages.Alert', safe: true, location, base: 'commonMessages',
        },
        {
          computed: true, name: 'messages[msg]', safe: false, location, base: 'messages',
        },
        {
          computed: false, name: 'messages.safeAccess', safe: true, location, base: 'messages',
        },
      ],
      error: null,
    };

    const cases = await listFiles(setup);
    expect(cases).toHaveLength(1);
    expect(cases[0]).toEqual(expected);
  });

  test('resolves paths', async () => {
    const { default: listFiles } = await import('src/fs/inspect-files');
    glob.resolveWith = [
      'resolve-component.jsx',
    ];

    const cases = await listFiles(setup);
    expect(cases).toHaveLength(1);
    expect(cases[0]).toEqual({
      filename: expect.any(String),
      imports: {
        messages: {
          Foo: {
            id: 'bar',
            defaultMessage: 'Baziiingaaa',
          },
        },
      },
      error: null,
      messages: expect.any(Array),
    });
  });
});
