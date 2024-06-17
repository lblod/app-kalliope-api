const assert = require('assert');
const {
  convertTtlToJsonld,
} = require('../../src/utils/convert-ttl-to-jsonld.js');

describe('convertTtlToJsonld', async () => {
  it('returns a JSON-LD object', async () => {
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
    const jsonld = await convertTtlToJsonld(ttlString);

    assert.deepStrictEqual(jsonld, expected);
  });
});
