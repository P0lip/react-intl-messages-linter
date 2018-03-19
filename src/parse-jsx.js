import * as acorn from 'acorn-jsx';

import injectDynamicImport from 'acorn-dynamic-import/lib/inject';
import injectClassFields from 'acorn-class-fields/inject';
import injectStaticClassPropertyInitializer from 'acorn-static-class-property-initializer/inject';

injectDynamicImport(acorn);
injectClassFields(acorn);
injectStaticClassPropertyInitializer(acorn);

export default (code, setup = {}) => acorn.parse(code, {
  sourceType: 'module',
  ecmaVersion: 9,
  plugins: {
    jsx: true,
    classFields: true,
    dynamicImport: true,
    staticClassPropertyInitializer: true,
  },
  locations: true,
  ...setup,
});

