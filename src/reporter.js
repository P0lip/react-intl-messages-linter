import path from 'path';
import chalk from 'chalk';

const { log } = console;

const INDENTATION = '* ';

export default class Reporter {
  constructor({ cwd, quiet }) {
    this.shouldWarn = !quiet;
    this.cwd = cwd;
    this.pending = '';
    this.stats = {
      warnings: 0,
      errors: 0,
    };

    log(
      chalk.yellow('Use with caution.'),
    );
  }

  static formatMessage({ name, location }) {
    return `${name} at ${Object.values(location.start).join(':')}`;
  }

  logFile() {
    if (this.pending !== '') {
      log('');
      log(`- ${path.relative(this.cwd, this.pending)}`);
      this.pending = '';
    }
  }

  file(filename) {
    this.pending = filename;
  }

  success({ reason, message }) {
    log(
      chalk.green(`${INDENTATION}${reason}`),
      message,
    );
  }

  error({ reason, message }) {
    this.logFile();
    this.stats.errors += 1;
    log(
      chalk.red(`${INDENTATION}${reason}`),
      message,
    );
  }

  warn({ reason, message }) {
    this.stats.warnings += 1;
    if (this.shouldWarn) {
      this.logFile();
      log(
        chalk.yellow(`${INDENTATION}${reason}`),
        message,
      );
    }
  }
}
