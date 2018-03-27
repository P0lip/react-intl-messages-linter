export const NO_MESSAGES_IMPORT = 'Messages are not found in the current scope';
export const DUPLICATED_MESSAGES = '';
export const UNSAFE_USAGE = 'Potentially unsafe usage of %s';
export const UNDEFINED_MESSAGE = '%s is undefined';
export const RESOLVING_ERROR = 'There was some problem with file(s) resolving... %s';
export const NO_ERRORS = 'No errors... most likely ;) %s';
export const PARSING_ERROR = 'Parsing failed: %s';

const DISABLING_TOKEN = 'lint-messages-disable';
export const DISABLING_TOKENS = {
  [`${DISABLING_TOKEN}-next-line`]: 1,
  [`${DISABLING_TOKEN}-line`]: 0,
};

export const REASON_TYPES = {
  SKIP: 'skip',
  SAFE: 'safe',
  LINK: 'link',
};

export const SAFE_LOGICAL_EXPRESSIONS = ['&&'];

export const MESSAGES_IMPORT_PATH = /\.*\/[a-z-]*messages(?:\.js)?$/i;
export const MESSAGES_IMPORT_NAME = /[az]*messages$/i;
