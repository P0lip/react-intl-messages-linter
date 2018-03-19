#!/usr/bin/env node
import validate from './validator';

(async () => {
  try {
    await validate();
    process.exit(0);
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.error(ex);
    process.exit(1);
  }
})();
