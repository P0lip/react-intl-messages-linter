export class ParsingError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'ParsingError';
  }
}

export class MissingImports extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'MissingImports';
  }
}

export class FileError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'FileError';
  }
}
