const addMetadata = (consolidatedGraph, date) => {
  return {
    ...consolidatedGraph,
    '@context': {
      date: {
        '@id': 'http://purl.org/dc/terms/date',
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
      },
    },
    '@id': 'http://mu.semte.ch/graphs/kalliope/consolidated',
    date: date.toISOString(),
  };
};

module.exports = {
  addMetadata,
};
