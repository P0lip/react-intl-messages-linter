import fs from 'fs';
import path from 'path';
import util from 'util';

const readFileAsync = util.promisify(fs.readFile);

global.BASE_PATH = path.resolve(__dirname, 'tests/fixtures');

global.getFixturePath = filename => path.resolve(global.BASE_PATH, filename);

global.getFixture = filename => readFileAsync(
  global.getFixturePath(filename),
  'UTF-8',
);

process.exit = () => {};
