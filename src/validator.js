import has from 'lodash.has';
import setup from './cli';
import listFiles from './list-files';
import Reporter from './reporter';
import {
  NO_ERRORS,
  NO_MESSAGES_IMPORT,
  PARSING_ERROR,
  RESOLVING_ERROR,
  UNDEFINED_MESSAGE,
  UNSAFE_USAGE,
} from './consts';

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

  if (!cases.length) {
    report.success({
      reason: NO_ERRORS,
      message: '',
    });
  } else {
    cases.forEach(({
      filename,
      imports,
      messages,
      missingImports,
      parsingError,
    }) => {
      report.file(filename);
      if (parsingError !== null) {
        report.error({
          reason: PARSING_ERROR,
          message: parsingError.message,
        });
      } else if (missingImports) {
        report.error({
          reason: NO_MESSAGES_IMPORT,
          message: '',
        });
      } else if (messages.length) {
        messages.forEach((message) => {
          if (!message.safe) {
            report.warn({
              reason: UNSAFE_USAGE,
              message: Reporter.formatMessage(message),
            });
          } else if (!has(imports, message.name)) {
            report.error({
              reason: UNDEFINED_MESSAGE,
              message: Reporter.formatMessage(message),
            });
          }
        });
      }
    });
  }
};
