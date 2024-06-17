const { Parser, Store } = require('n3');
const jsonld = require('jsonld');

const convertTtlToJsonld = async (ttlString) => {
  const quad = await parseTurtle(ttlString);
  const jsonld1 = await jsonld.fromRDF([...quad], {});
  const compacted = await jsonld.compact(jsonld1, {});

  return compacted;
};

const parseTurtle = async (ttl) => {
  return new Promise((resolve, reject) => {
    const store = new Store();
    const parser = new Parser();
    parser.parse(ttl, (error, quad, _prefixes) => {
      if (error) {
        reject(error);
      } else if (quad) {
        store.addQuad(quad);
      } else {
        resolve(store);
      }
    });
  });
};

module.exports = {
  convertTtlToJsonld,
};
