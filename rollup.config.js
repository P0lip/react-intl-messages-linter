import babel from 'rollup-plugin-babel';
import hashbang from 'rollup-plugin-hashbang';
import pkg from './package.json';

export default {
  input: './src/index.js',
  output: {
    file: './bin/index.js',
    format: 'cjs',
    name: pkg.name,
    sourcemap: false,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      externalHelpers: true,
    }),
    hashbang(),
  ],
  acorn: {
    allowReserved: true,
    ecmaVersion: 9,
  },
};
