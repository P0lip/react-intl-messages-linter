const resolveWith = [];
let shouldFail = false;

const glob = (pattern, opts, cb) => {
  if (shouldFail) {
    throw new Error(glob.ERROR_MSG);
  }
  cb(null, resolveWith);
};

glob.ERROR_MSG = 'Glob error';

Object.defineProperties(glob, {
  resolveWith: {
    get() {
      return resolveWith;
    },
    set(value) {
      resolveWith.length = 0;
      resolveWith.push(...value.map(global.getFixturePath));
      return true;
    },
  },
  shouldFail: {
    get() {
      return shouldFail;
    },
    set(value) {
      shouldFail = value;
      return true;
    },
  },
});

module.exports = glob;
