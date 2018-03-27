import has from 'lodash.has';
import setup from './cli';
import listFiles from './fs/inspect-files';
import Reporter from './reporter';
import {
  NO_ERRORS,
  NO_MESSAGES_IMPORT,
  PARSING_ERROR,
  RESOLVING_ERROR,
  UNDEFINED_MESSAGE,
  UNSAFE_USAGE,
} from './consts';
import {
  ParsingError,
  MissingImports,
} from './errors';

export default async () => {
  const report = new Reporter(setup);
  const cases = [];

  try {
    cases.push(...await listFiles(setup));
  } catch (ex) {
    report.error({
      reason: RESOLVING_ERROR,
      message: ex.message,
    });
    return;
  }

  if (cases.length) {
    cases.forEach(({
      filename,
      error,
      imports,
      messages,
    }) => {
      report.file(filename);
      switch (error !== null ? error.constructor : null) {
        case ParsingError:
          report.error({
            reason: PARSING_ERROR,
            message: error.message,
          });
          break;
        case MissingImports:
          report.error({
            reason: NO_MESSAGES_IMPORT,
            message: '',
          });
          break;
        default:
          if (messages.length) {
            messages.forEach((message) => {
              if (!message.safe) {
                report.warn({
                  reason: UNSAFE_USAGE,
                  message: Reporter.formatMessage(message),
                });
              } else if (!message.computed && !has(imports, message.name)) {
                report.error({
                  reason: UNDEFINED_MESSAGE,
                  message: Reporter.formatMessage(message),
                });
              }
            });
          }
      }
    });
  }

  if (!report.stats.errors) {
    report.success({
      reason: NO_ERRORS,
      message: !report.shouldWarn && report.stats.warnings ? '...but some warnings are hidden' : '',
    });
  }
};
