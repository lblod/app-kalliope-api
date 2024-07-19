const fs = require('node:fs/promises');

/**
 * Read a file asynchronously.
 *
 * @param {string} path - The path to the file.
 * @param {object} [options] - The options for reading the file.
 * @returns {Promise<string>} The content of the file.
 */
const readFile = async (path, options) => {
  return fs.readFile(path, {
    encoding: 'utf-8',
    ...options,
  });
};

/**
 * Write a file asynchronously.
 *
 * @param {string} path - The path to the file.
 * @param {string} data - The data to write to the file.
 * @param {object} [options] - The options for writing the file.
 * @returns {Promise<void>} A promise that resolves when the file is written.
 */
const writeFile = async (path, data, options) => {
  return fs.writeFile(path, data, {
    encoding: 'utf-8',
    ...options,
  });
};

/**
 * Unlink a file asynchronously.
 *
 * @param {string} path - The path to the file.
 * @returns {Promise<void>} A promise that resolves when the file is unlinked.
 */
const unlink = async (path) => {
  return fs.unlink(path);
};

module.exports = {
  readFile,
  writeFile,
  unlink,
};
