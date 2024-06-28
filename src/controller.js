const env = require('./env');
const { fetchLatestDumpFilePath } = require('./query');
const { turtleToJsonld } = require('./rdf-transformation/turtle-to-jsonld');
const { addMetadata } = require('./rdf-transformation/metadata');
const { isWhitelisted, authenticate } = require('./security/index');
const { resolveSharePath } = require('./utils/resolve-share-path');
const { readFile } = require('./utils/fs');

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
  console.log('Handling consolidated request...');

  // Verify IP address, allow only whitelisted addresses
  if (!isWhitelisted(req.ip)) {
    console.error('Forbidden request from IP address: ', req.ip);

    return res.status(403).json({ error: 'Forbidden' });
  }

  // Authenticate credentials (Basic access authentication).
  const authorized = await authenticate(req.headers.authorization);
  if (!authorized) {
    console.error('Unauthorized request');

    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if the DUMP_SUBJECT is defined
  if (env.DUMP_SUBJECT === undefined) {
    console.error('DUMP_SUBJECT is not defined');

    return res.status(500).json({ error: 'Internal Server Error' });
  }

  // Retrieve the latest dump file
  const latestDumpFilePath = await fetchLatestDumpFilePath(env.DUMP_SUBJECT);
  const localDumpFilePath = resolveSharePath(latestDumpFilePath);
  const turtle = await readFile(localDumpFilePath);

  // Convert the dump file from TTL to JSON-LD format
  const consolidatedGraph = await turtleToJsonld(turtle);

  // Decorate the consolidated graph with metadata
  const response = addMetadata(consolidatedGraph, new Date());

  // Return the converted result
  res.status(200).type('application/ld+json').json(response);

  console.log('Consolidated request handled');
};

module.exports = {
  consolidatedHandler,
};
