const { sparqlEscapeUri } = require('mu');
const { querySudo: query } = require('@lblod/mu-auth-sudo');

const fetchLatestDumpFilePath = async (subject) => {
  if (!subject) throw new Error('No subject provided');

  const queryString = `
        PREFIX prov: <http://www.w3.org/ns/prov#>
        PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX dcat: <http://www.w3.org/ns/dcat#>
        SELECT * WHERE {
        ?sub dct:subject ${sparqlEscapeUri(subject)} ;
            dcat:distribution ?distribution.
        FILTER NOT EXISTS {
                ?revision prov:wasRevisionOf  ?sub.
            }
        ?distribution 
            dct:subject ?file;
            dct:created ?created.
        ?phyiscalFile nie:dataSource ?file. 
        }
    `;
  const { results } = await query(queryString);

  if (results.bindings.length) {
    const binding = results.bindings[0];
    console.log('binding:', binding);

    return binding.phyiscalFile?.value;
  }

  return null;
};

module.exports = {
  fetchLatestDumpFilePath,
};
