const assert = require('assert');
const { addMetadata } = require('rdf-transformation/metadata');

describe('addMetadata', () => {
  it('returns a JSON-LD object with metadata', () => {
    const graph = {
      '@graph': [],
    };
    const date = new Date('2021-10-05T10:00:00Z');
    const expected = {
      '@context': {
        date: {
          '@id': 'http://purl.org/dc/terms/date',
          '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        },
      },
      '@id': 'http://mu.semte.ch/graphs/kalliope/consolidated',
      '@graph': [],
      date: '2021-10-05T10:00:00.000Z',
    };
    const result = addMetadata(graph, date);

    assert.deepStrictEqual(result, expected);
  });
});
