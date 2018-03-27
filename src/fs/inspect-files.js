import util from 'util';
import fs from 'fs';
import { getMessageImportPaths } from '../ast/utils';
import listUsage from '../messages/list-usage';
import listMessages from '../messages/list-messages';
import { FileError, MissingImports, ParsingError } from '../errors';

const glob = util.promisify(require('glob'));

const readFile = util.promisify(fs.readFile);

export default async ({
  cwd,
  ignore,
  pattern,
  resolver,
}) => {
  const files = (await glob(pattern, {
    absolute: true,
    cwd,
    ignore,
    nodir: true,
    nocase: true,
  }));

  const cases = [];

  await Promise.all(files.map(async (filename) => {
    const code = await readFile(filename, 'utf-8');
    const messages = [];
    const singleCase = {
      filename,
      messages,
      imports: {},
      error: null,
    };
    const importPaths = [];
    try {
      importPaths.push(...getMessageImportPaths(code));
      messages.push(...listUsage(code));
    } catch (ex) {
      singleCase.error = new ParsingError(ex.message);
      cases.push(singleCase);
      return;
    }

    if (messages.length > 0 && !importPaths.length) {
      singleCase.error = new MissingImports();
      cases.push(singleCase);
      return;
    }

    if (importPaths.length > 0) {
      cases.push(singleCase);
      try {
        await Promise.all(importPaths.map(
          async ({ name, source }) => {
            const { filepath, content } = await resolver(source, filename);
            singleCase.imports[name] = listMessages(
              content,
              filepath,
            );
          },
        ));
      } catch (ex) {
        singleCase.imports = {};
        singleCase.error = new FileError(ex.message);
      }
    }
  }));

  return cases;
};
