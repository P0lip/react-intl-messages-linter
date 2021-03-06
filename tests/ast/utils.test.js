import parse from 'src/parser';
import {
  getMessagesDefinitions,
  isMessageImportSpecifier,
  isDefineMessagesImport,
} from 'src/ast/utils';

describe('ast/utils', () => {
  describe('isDefineMessagesImport', () => {
    test('returns true if valid import is found', () => {
      expect(isDefineMessagesImport(parse(
        'import { defineMessages } from \'react-intl\'',
      ).body[0])).toBe(true);
    });

    test('returns false if no valid import is found', () => {
      [
        'import { defineMessages } from \'react-tintl\'',
        'import defineMessages from \'react-intl\'',
      ].forEach((code) => {
        expect(isDefineMessagesImport(parse(code).body[0])).toBe(false);
      });
    });
  });

  describe('getMessagesDefinitions', () => {
    test('lists messages', async () => {
      const fixture = parse(await global.getFixture('dummy-component/messages.js'));
      expect(getMessagesDefinitions(fixture)).toEqual(
        fixture.body[1].declaration.arguments[0],
      );
    });

    test('lists nested messages', async () => {
      const fixture = parse(await global.getFixture('messages/nested-messages.js'));
      expect(getMessagesDefinitions(fixture)).toEqual(
        fixture.body[0].declaration,
      );
    });
  });

  describe('isMessageImportSpecifier', () => {
    test('returns true if valid import is found', () => {
      [
        'import messages from \'./messages\'',
        'import { messages } from \'./messages\'',
        'import messages from \'./messages.js\'',
        'import commonMessages from \'./messages.js\'',
        'import commonMessages from \'../messages\'',
        'import commonMessages from \'../common-messages\'',
        'import defineMessages from \'assets/messages\'',
      ].forEach((code) => {
        expect(isMessageImportSpecifier(parse(code).body[0])).toBe(true);
      });
    });
  });
});
