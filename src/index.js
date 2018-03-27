#!/usr/bin/env node
import validate from './validator';
import debug from './console';

(async () => {
  try {
    await validate();
    process.exit(0);
  } catch (ex) {
    debug.error(ex);
    process.exit(1);
  }
})();
