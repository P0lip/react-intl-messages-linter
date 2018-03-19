const setup = require.requireActual('../cli');
jest.mock('yargs');

export default {
  ...setup,
  quiet: false,
  searchIn: global.BASE_PATH,
  set cwd(value) { // just to make sure workingDir always points to BASE_PATH
    return false;
  },
  get cwd() {
    return global.BASE_PATH;
  },
};

