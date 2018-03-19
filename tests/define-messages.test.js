import defineMessages from 'src/define-messages';
import escodegen from 'escodegen';
import vm from 'vm';

describe('defineMessages', () => {
  test('ast should be exported', () => {
    expect(defineMessages.type).toBe('FunctionDeclaration');
  });

  test('ast can be consumed by escodegen', () => {
    expect(escodegen.generate(defineMessages)).toBeTruthy();
    expect(
      escodegen.generate(defineMessages)
        .split('\n')[0]
        .startsWith('function defineMessages(messages) {'),
    ).toBe(true);
  });

  test('defineMessages should store messages', () => {
    const context = {
      allMessages: new Set(),
    };
    vm.createContext(context);
    vm.runInContext(escodegen.generate(defineMessages), context);
    vm.runInContext('defineMessages({ test: { id: \'test\', defaultMessage: \'\' } })', context);
    expect([...context.allMessages]).toEqual(['test']);
    vm.runInContext('defineMessages({ foo: { id: \'bar\', defaultMessage: \'\'  } })', context);
    expect([...context.allMessages]).toEqual(['test', 'bar']);
  });

  test('defineMessages should support nested messages', () => {
    const context = {
      allMessages: new Set(),
    };

    vm.createContext(context);
    vm.runInContext(escodegen.generate(defineMessages), context);
    try {
      vm.runInContext(
            'defineMessages({ test: { Foo: { id: \'test\', defaultMessage: \'\' } }})',
            context,
          )
    } catch (Ex) {
      console.error(Ex)
    }
    expect(vm.runInContext(
      'defineMessages({ test: { Foo: { id: \'test\', defaultMessage: \'\' } }})',
      context,
    )).toEqual({
      test: {
        Foo: {
          id: 'test',
          defaultMessage: '',
        },
      },
    });
  });

  xtest('defineMessages should throw error if duplicated ID is encountered', () => {
    const context = {
      allMessages: new Set(),
    };
    vm.createContext(context);
    vm.runInContext(escodegen.generate(defineMessages), context);
    vm.runInContext('defineMessages({ test: { id: \'test\',  defaultMessage: \'\' } })', context);
    expect([...context.allMessages]).toEqual(['test']);
    expect(() => vm.runInContext('defineMessages({ test: { id: \'test\', defaultMessage: \'\' } })', context))
      .toThrow();
    expect([...context.allMessages]).toEqual(['test']);
  });
});
