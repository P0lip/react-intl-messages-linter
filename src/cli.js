import path from 'path';
import yargs from 'yargs';
import createResolver from './resolver';

yargs
  .option('quiet', {
    alias: 'q',
    default: true,
    type: 'boolean',
    description: 'Report errors only',
  });

// yargs
//  .option('ignore', {
//    alias: 'i',
//    type: 'string',
//  });

yargs
  .option('webpack', {
    type: 'string',
    description: 'Path to webpack config',
  });

// yargs
//  .option('parser', {
//    alias: 'p',
//    type: 'string',
//    description: 'path to webpack config',
//  });

const { argv } = yargs;

const resolverOpts = {};
const cwd = process.cwd();

if (argv.webpack) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  Object.assign(resolverOpts, require(path.resolve(cwd, argv.webpack)).resolve);
} else {
  resolverOpts.extensions = ['.js', '.jsx'];
  resolverOpts.modules = [cwd];
}

const resolver = createResolver(resolverOpts);

export { resolver };

export default {
  quiet: argv.quiet,
  searchIn: argv._[argv._.length - 1]
    ? path.resolve(cwd, argv._[argv._.length - 1])
    : cwd,
  resolver,
  cwd,
};
