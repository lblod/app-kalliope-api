const { Parser } = require('n3');
const jsonld = require('jsonld');

/**
 * Converts a Turtle string to JSON-LD
 * @param {string} ttlString - The Turtle string to convert
 * @returns {Promise<Object>} A promise that resolves with the JSON-LD object
 * @throws {Error} If an error occurs during conversion
 */
const turtleToJsonld = async (ttlString) => {
  try {
    const quads = await parseTurtle(ttlString);
    const jsonLdArray = await jsonld.fromRDF([...quads]);
    const compacted = await jsonld.compact(jsonLdArray, {});

    return compacted;
  } catch (error) {
    console.error('Error converting Turtle to JSON-LD:', error);
    throw error; // Rethrow or handle as needed.
  }
};

/**
 * Parses a Turtle string into quads
 *
 * @param {string} ttl - The Turtle string to parse
 * @returns {Promise<Array>} A promise that resolves with an array of quads
 */
const parseTurtle = async (ttl) => {
  return new Promise((resolve, reject) => {
    const parser = new Parser();
    const quads = [];
    parser.parse(ttl, (error, quad, _prefixes) => {
      if (error) {
        reject(error);
      } else if (quad) {
        quads.push(quad);
      } else {
        resolve(quads);
      }
    });
  });
};

module.exports = {
  turtleToJsonld,
};
