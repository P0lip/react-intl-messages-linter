import * as acorn from 'acorn-jsx';
import injectDynamicImport from 'acorn-dynamic-import/lib/inject';
import injectClassFields from 'acorn-class-fields/inject';
import injectStaticClassPropertyInitializer from 'acorn-static-class-property-initializer/inject';
import setup from './cli';

injectDynamicImport(acorn);
injectClassFields(acorn);
injectStaticClassPropertyInitializer(acorn);

const parser = setup.parser
  ? require(
    require.resolve(setup.parser, {
      paths: [setup.cwd],
    }),
  )
  : acorn;

export default (code, opts = {}) => {
  if (parser !== acorn) {
    return parser.parse(code, opts);
  }

  return acorn.parse(code, {
    sourceType: 'module',
    ecmaVersion: 9,
    plugins: {
      jsx: true,
      classFields: true,
      dynamicImport: true,
      staticClassPropertyInitializer: true,
    },
    locations: true,
    ...opts,
  });
};

