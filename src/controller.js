const { fetchLatestDumpFilePath } = require('./service.js');
const { ORGANIZATIONS_DUMP_SUBJECT } = require('./constant.js');
const fs = require('node:fs/promises');
const { convertTtlToJsonld } = require('./utils/convert-ttl-to-jsonld.js');

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

/**
 * This is the main entrypoint of the service.
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */
const consolidatedHandler = async (req, res) => {
  // 1. Verify IP address (allow only whitelisted addresses).
  if (!isWhitelisted(req.socket.remoteAddress)) {
    res.status(403).send({ msg: 'Forbidden' });

    return;
  }

  // 2. Authenticate credentials (Basic access authentication).
  if (!authenticate(req.headers.authorization)) {
    res.status(401).send({ msg: 'Unauthorized' });

    return;
  }

  // 3. Retrieve the latest dump file using a SPARQL query.
  console.log('Retrieving latest dump file...');
  const latestDumpFilePath = await fetchLatestDumpFilePath(
    ORGANIZATIONS_DUMP_SUBJECT
  );
  const turtle = await fs.readFile(
    latestDumpFilePath.replace('share://', '/share/'),
    { encoding: 'utf-8' }
  );
  // console.log('Turtle:', turtle);
  // 4. Convert the dump file from TTL to JSON-LD format.
  console.log('Converting TTL to JSON-LD...');
  console.log('ttlToJsonld:', convertTtlToJsonld);
  const consolidatedGraph = await convertTtlToJsonld(turtle);

  // 5. decorate the JSON-LD with a date and context
  console.log('Decorating JSON-LD with metadata...');
  // const response = JSON.parse(JSON.stringify(addMetadata(consolidatedGraph, new Date())));
  const response = addMetadata(consolidatedGraph, new Date());

  // 6. Return the converted result.
  console.log('Returning the converted result');
  res.status(200).type('application/ld+json').json(response);
};

const isWhitelisted = (ip) => {
  console.log('IP address:', ip);

  return true;
};

const authenticate = (authorization) => {
  console.log('Authorization:', authorization);

  return true;
};

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
  consolidatedHandler,
};
