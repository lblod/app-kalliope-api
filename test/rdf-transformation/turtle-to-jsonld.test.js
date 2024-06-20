const assert = require('assert');
const { turtleToJsonld } = require('rdf-transformation/turtle-to-jsonld');

describe('turtleToJsonld', async () => {
  it('returns a compacted JSON-LD object', async () => {
    const ttlString = `
      <http://data.lblod.info/id/adressen/1108f389f3c007a771b18aa0a6d26d68> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/locn#Address>.
      <http://data.lblod.info/id/adressen/0569be682c7abf4aa84d1bde47216cf3> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/locn#Address>.
      <http://data.lblod.info/id/adressen/1108f389f3c007a771b18aa0a6d26d68> <https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer> """22""".
      <http://data.lblod.info/id/adressen/1108f389f3c007a771b18aa0a6d26d68> <http://www.w3.org/ns/locn#thoroughfare> """Amelbergastraat""".
      <http://data.lblod.info/id/adressen/1108f389f3c007a771b18aa0a6d26d68> <http://www.w3.org/ns/locn#postCode> """2240""".
      <http://data.lblod.info/id/adressen/1108f389f3c007a771b18aa0a6d26d68> <https://data.vlaanderen.be/ns/adres#gemeentenaam> """Zandhoven""".
      <http://data.lblod.info/id/adressen/1108f389f3c007a771b18aa0a6d26d68> <http://www.w3.org/ns/locn#adminUnitL2> """Antwerpen""".
      <http://data.lblod.info/id/adressen/1108f389f3c007a771b18aa0a6d26d68> <https://data.vlaanderen.be/ns/adres#land> """België""".
      <http://data.lblod.info/id/adressen/0569be682c7abf4aa84d1bde47216cf3> <http://www.w3.org/ns/locn#fullAddress> """Het Blok 24, 2990 Wuustwezel, België""".
      <http://data.lblod.info/id/adressen/1108f389f3c007a771b18aa0a6d26d68> <http://www.w3.org/ns/locn#fullAddress> """Amelbergastraat 22, 2240 Zandhoven, België""".
    `;
    const expected = {
      '@graph': [
        {
          '@id':
            'http://data.lblod.info/id/adressen/0569be682c7abf4aa84d1bde47216cf3',
          '@type': 'http://www.w3.org/ns/locn#Address',
          'http://www.w3.org/ns/locn#fullAddress':
            'Het Blok 24, 2990 Wuustwezel, België',
        },
        {
          '@id':
            'http://data.lblod.info/id/adressen/1108f389f3c007a771b18aa0a6d26d68',
          '@type': 'http://www.w3.org/ns/locn#Address',
          'http://www.w3.org/ns/locn#adminUnitL2': 'Antwerpen',
          'http://www.w3.org/ns/locn#fullAddress':
            'Amelbergastraat 22, 2240 Zandhoven, België',
          'http://www.w3.org/ns/locn#postCode': '2240',
          'http://www.w3.org/ns/locn#thoroughfare': 'Amelbergastraat',
          'https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer':
            '22',
          'https://data.vlaanderen.be/ns/adres#gemeentenaam': 'Zandhoven',
          'https://data.vlaanderen.be/ns/adres#land': 'België',
        },
      ],
    };
    const jsonld = await turtleToJsonld(ttlString);

    assert.deepStrictEqual(jsonld, expected);
  });

  it('it deduplicate the triples', async () => {
    const ttlString = `
      <http://vocab.belgif.be/auth/refnis2019/93010> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2004/02/skos/core#Concept>.
      <http://vocab.belgif.be/auth/refnis2019/93010> <http://www.w3.org/2004/02/skos/core#prefLabel> """Cerfontaine""".
      <http://vocab.belgif.be/auth/refnis2019/93010> <http://www.w3.org/2004/02/skos/core#prefLabel> """Cerfontaine""".
      <http://vocab.belgif.be/auth/refnis2019/93010> <http://www.w3.org/2004/02/skos/core#prefLabel> """Cerfontaine""".
      <http://vocab.belgif.be/auth/refnis2019/93000> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2004/02/skos/core#Concept>.
      <http://vocab.belgif.be/auth/refnis2019/93000> <http://www.w3.org/2004/02/skos/core#prefLabel> """Arrondissement Philippeville""".
      <http://vocab.belgif.be/auth/refnis2019/93000> <http://www.w3.org/2004/02/skos/core#prefLabel> """Arrondissement de Philippeville""".
      <http://vocab.belgif.be/auth/refnis2019/93000> <http://www.w3.org/2004/02/skos/core#prefLabel> """Bezirk Philippeville""".
    `;
    const expected = {
      '@graph': [
        {
          '@id': 'http://vocab.belgif.be/auth/refnis2019/93000',
          '@type': 'http://www.w3.org/2004/02/skos/core#Concept',
          'http://www.w3.org/2004/02/skos/core#prefLabel': [
            'Arrondissement Philippeville',
            'Arrondissement de Philippeville',
            'Bezirk Philippeville',
          ],
        },
        {
          '@id': 'http://vocab.belgif.be/auth/refnis2019/93010',
          '@type': 'http://www.w3.org/2004/02/skos/core#Concept',
          'http://www.w3.org/2004/02/skos/core#prefLabel': 'Cerfontaine',
        },
      ],
    };
    const jsonld = await turtleToJsonld(ttlString);

    assert.deepStrictEqual(jsonld, expected);
  });
});
