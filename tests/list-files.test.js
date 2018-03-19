import path from 'path';
import resolver from 'src/resolver';

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
    resolver: resolver(resolveOpts)
  };

  beforeAll(async (done) => {
    jest.mock('glob');
    jest.mock('src/parse-jsx');
    glob = await import('glob');
    done();
  });

  beforeEach(() => {
    glob.resolveWith = [];
  });

  test('graceful handling of parsing error', async () => {
    const { default: listFiles } = await import('src/list-files');
    glob.resolveWith = [
      'invalid-syntax.js',
    ];

    const cases = await listFiles(setup);
    expect(cases).toEqual([{
      filename: expect.stringMatching(new RegExp(glob.resolveWith[0])),
      imports: {},
      messages: [],
      missingImports: false,
      parsingError: expect.any(Error),
      fileError: null,
    }])
  });

  test('graceful handling of file error', async () => {
     const { default: listFiles } = await import('src/list-files');
     glob.resolveWith = [
       'unresolvable-component.jsx',
     ];

    const cases = await listFiles(setup);
     expect(cases).toEqual([{
       filename: expect.stringMatching(new RegExp(glob.resolveWith[0])),
       imports: {},
       messages: [{
         name: 'messages.test',
         location: undefined,
         safe: true,
       }],
       missingImports: false,
       parsingError: null,
       fileError: expect.any(Error),
     }])
   });

  test('lists missing import cases', async () => {
    const { default: listFiles } = await import('src/list-files');
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
      missingImports: true,
    })];

    const cases = await listFiles(setup);
    expect(cases).toEqual(
      expect.arrayContaining(expected),
    );
  });

  test('lists unsafe accesses', async () => {
    const { default: listFiles } = await import('src/list-files');
    glob.resolveWith = [
      'dynamic-messages/index.jsx',
    ];

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
        { name: 'messages.foo', safe: true, location: undefined },
        { name: 'messages.baz', safe: true, location: undefined },
        { name: 'messages.bar', safe: true, location: undefined },
        { name: 'commonMessages.Alert', safe: true, location: undefined },
        { name: 'messages[msg]', safe: false, location: undefined },
        { name: 'messages.safeAccess', safe: true, location: undefined },
      ],
      missingImports: false,
      parsingError: null,
      fileError: null,
    };

    const cases = await listFiles(setup);
    expect(cases).toHaveLength(1);
    expect(cases[0]).toEqual(expected);
  });

  test('resolves paths', async () => {
    const { default: listFiles } = await import('src/list-files');
    glob.resolveWith = [
      'resolve-component.jsx',
    ];

    const cases = await listFiles(setup);
    expect(cases).toHaveLength(1);
    expect(cases[0]).toEqual({
      fileError: null,
      filename: expect.any(String),
      imports: {
        messages: {
          Foo: {
            id: 'bar',
            defaultMessage: 'Baziiingaaa',
          }
        },
      },
      missingImports: false,
      parsingError: null,
      messages: expect.any(Array),
    });
  });
});
