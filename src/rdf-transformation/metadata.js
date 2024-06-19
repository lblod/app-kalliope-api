/**
 * Add metadata to the consolidated graph
 *
 * @param {Object} consolidatedGraph
 * @param {Date} date
 * @returns {Object} the consolidated graph with metadata
 */
const addMetadata = (consolidatedGraph, date) => {
  if (typeof consolidatedGraph !== 'object' || !(date instanceof Date)) {
    throw new TypeError('Invalid arguments');
  }

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
