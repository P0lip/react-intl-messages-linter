import path from 'path';
import yargs from 'yargs';
import createResolver from './fs/resolver';

yargs
  .option('quiet', {
    alias: 'q',
    default: false,
    type: 'boolean',
    description: 'Report errors only',
  });

yargs
  .option('ignore', {
    alias: 'i',
    type: 'string',
    description: 'Pattern of files to ignore',
  });

yargs
  .option('webpack', {
    type: 'string',
    description: 'Path to webpack config',
  });

yargs
  .option('parser', {
    alias: 'p',
    type: 'string',
    description: 'Any ESTree compliant parser to be used instead of default one',
  });

yargs
  .option('pattern', {
    default: '**/*.js{x,}',
    type: 'string',
    description: 'File pattern to match against',
  });

const { argv } = yargs;

const resolverOpts = {};
const cwd = process.cwd();

if (argv.webpack) {
  // eslint-disable-next-line global-require
  Object.assign(resolverOpts, require(path.resolve(cwd, argv.webpack)).resolve);
} else {
  resolverOpts.extensions = ['.js', '.jsx'];
  resolverOpts.modules = [cwd];
}

const resolver = createResolver(resolverOpts);

export { resolver };

export default {
  quiet: argv.quiet,
  pattern: argv.pattern,
  resolver,
  cwd: argv._[argv._.length - 1] ? path.resolve(cwd, argv._[argv._.length - 1]) : cwd,
  ignore: [
    'node_modules',
    '**/*.test.js',
    '**/*messages.js',
    '*messages.js',
  ],
};
