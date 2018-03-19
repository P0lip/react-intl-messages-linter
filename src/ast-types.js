import types from 'ast-types';

const { def } = types.Type;

def('FieldDefinition')
  .bases('MethodDefinition'); // very naive

types.finalize();

export default types;
