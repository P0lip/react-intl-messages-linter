import util from 'util';
import fs from 'fs';
import path from 'path';
import { getMessageImportPaths } from './ast-utils';
import listMessages from './list-messages';
import getMessages from './sandbox';

const glob = util.promisify(require('glob'));

const readFile = util.promisify(fs.readFile);

export default async ({ searchIn, resolver }) => {
  const files = (await glob('**/*.js{x,}', {
    cwd: searchIn,
    ignore: [
      'node_modules',
      '**/*.test.js',
      '**/*messages.js',
      '*messages.js',
    ],
  })).map(filename => path.resolve(searchIn, filename));

  const cases = [];

  await Promise.all(files.map(async (filename) => {
    const code = await readFile(filename, 'utf-8');
    const messages = [];
    const singleCase = {
      filename,
      messages,
      imports: {},
      missingImports: false,
      parsingError: null,
      fileError: null,
    };
    const importPaths = [];
    try {
      importPaths.push(...getMessageImportPaths(code));
      messages.push(...listMessages(code));
    } catch (ex) {
      singleCase.parsingError = ex;
      cases.push(singleCase);
    }

    if (messages.length > 0 && !importPaths.length) {
      singleCase.missingImports = true;
      cases.push(singleCase);
      return;
    }

    if (importPaths.length > 0) {
      cases.push(singleCase);
      try {
        await Promise.all(importPaths.map(
          async ({ name, source }) => {
            singleCase.imports[name] = getMessages(await resolver(source, filename));
          },
        ));
      } catch (ex) {
        singleCase.imports = {};
        singleCase.fileError = ex;
      }
    }
  }));

  return cases;
};
