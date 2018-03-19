const yargs = jest.genMockFromModule('yargs');

yargs.argv = {
  _: [],
};

module.exports = yargs;
