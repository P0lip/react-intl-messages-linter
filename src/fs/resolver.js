import fs from 'fs';
import path from 'path';
import util from 'util';
import {
  NodeJsInputFileSystem,
  CachedInputFileSystem,
  ResolverFactory,
} from 'enhanced-resolve';

const readFile = util.promisify(fs.readFile);

export default (resolverOpts) => {
  const myResolver = ResolverFactory.createResolver({
    fileSystem: new CachedInputFileSystem(new NodeJsInputFileSystem(), 4000),
    ...resolverOpts,
  });

  const resolveContext = {};
  const resolveFile = util.promisify(myResolver.resolve);

  return async (source, filename) => {
    const filepath = await resolveFile.call(
      myResolver,
      {},
      filename.replace(path.basename(filename), ''),
      source,
      resolveContext,
    );

    return {
      filepath,
      content: await readFile(filepath, 'utf-8'),
    };
  };
};

