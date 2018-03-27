const { default: parse } = require.requireActual('src/parser');

export default code => parse(code, { locations: false });
