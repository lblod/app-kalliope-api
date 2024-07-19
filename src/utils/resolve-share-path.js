/**
 * Resolves a share path to a local path.
 * @param {string} path - The share path to resolve.
 * @returns {string} The resolved local path.
 */
const resolveSharePath = (path) => {
  return path.replace('share://', '/share/');
};

module.exports = {
  resolveSharePath,
};
