import chalk from 'chalk';

const { log } = console;

export default {
  error(...args) {
    log(chalk.red(...args));
  },
};
