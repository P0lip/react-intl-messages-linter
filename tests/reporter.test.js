/* eslint-disable no-console */
import chalk from 'chalk';

describe('Reporter', () => {
  const { log } = console;
  let Reporter;

  afterAll(() => {
    console.log = log;
  });

  afterEach(() => {
    console.log.mockClear();
  });

  beforeAll(async (done) => {
    console.log = jest.fn();
    ({ default: Reporter } = await import('src/reporter'));
    done();
  });

  describe('#formatMessage', () => {
    test('parses message and generates message with location info', () => {
      expect(Reporter.formatMessage({
        name: 'messages.foo',
        location: {
          start: {
            line: 2,
            col: 10,
          },
        },
      })).toBe('messages.foo at 2:10');
    });
  });

  describe('#file', () => {
    test('prints filename only when warn/error method was called', () => {
      const cwd = '/foo/bar/react-project';
      const relative = 'src/components/Common';
      const report = new Reporter({ cwd });
      console.log.mockClear();
      expect(console.log).not.toHaveBeenCalled();
      report.file(`${cwd}/${relative}`);
      report.warn({ });
      expect(console.log.mock.calls[1]).toEqual([`- ${relative}`]);
    });

    test('pretty-prints file location', () => {
      const cwd = '/foo/bar/react-project';
      const relative = 'src/components/Common';
      const report = new Reporter({ cwd });
      console.log.mockClear();
      report.file(`${cwd}/${relative}`);
      report.error({ });
      expect(console.log).toHaveBeenCalledTimes(3);
      expect(console.log.mock.calls[1]).toEqual([`- ${relative}`]);
    });
  });

  describe('#error', () => {
    test('prints to console', () => {
      const report = new Reporter({});
      console.log.mockClear();
      const reason = 'bar';
      const message = 'foo';
      report.error({
        reason,
        message,
      });
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        chalk.red(`* ${reason}`),
        message,
      );
    });
  });

  describe('#success', () => {
    test('prints to console', () => {
      const report = new Reporter({});
      console.log.mockClear();
      const reason = 'bar';
      const message = 'foo';
      report.success({
        reason,
        message,
      });
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        chalk.green(`* ${reason}`),
        message,
      );
    });
  });

  describe('#warn', () => {
    test('prints to console in no-quiet mode', () => {
      const report = new Reporter({ quiet: false });
      console.log.mockClear();
      const reason = 'bar';
      const message = 'foo';
      report.warn({
        reason,
        message,
      });
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        chalk.yellow(`* ${reason}`),
        message,
      );
    });

    test('does not print to console in quiet mode', () => {
      const report = new Reporter({ quiet: true });
      console.log.mockClear();
      const reason = 'bar';
      const message = 'foo';
      report.warn({
        reason,
        message,
      });
      expect(console.log).not.toHaveBeenCalled();
    });
  });
});
