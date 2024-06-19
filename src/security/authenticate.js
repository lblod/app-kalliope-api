const { readFile, writeFile, unlink } = require('../utils/fs');
const bcrypt = require('bcrypt');

/**
 * Authenticate the request based on the authorization header
 *
 * @param {object} config - The security configuration
 * @param {boolean} config.enabled - Indicates whether the security is enabled
 * @param {string} config.authOutput - path to the output of the authentication data
 * @param {string} authorization - The authorization header
 * @returns {Promise<boolean>} - Returns true if the authorization is valid, otherwise false
 */
const authenticate = async ({ enabled, authOutput }, authorization) => {
  // Is security disabled?
  if (enabled === false) {
    return true;
  }

  // Is mandatory configuration missing?
  if (!authOutput) {
    console.error('authOutput is missing in the configuration');

    return false;
  }

  // Extract the credentials from the authorization header
  const { username, password } = extractCredentials(authorization);
  if (!username || !password) {
    console.error('Invalid credentials:', { username, password });

    return false;
  }

  // Load encrypted credentials from the output file and compare them
  const encryptedPassword = await loadEncryptedPassword(authOutput, username);
  if (encryptedPassword) return await bcrypt.compare(password, encryptedPassword);

  return false;
};

/**
 * Initialize the authentication process
 *
 * @param {object} config - The security configuration
 * @param {boolean} config.enabled - Indicates whether the security is enabled
 * @param {string} config.authSource - path to the source of the authentication data (plain text)
 * @param {string} config.authOutput - path to the output of the authentication data (encrypted)
 * @returns {Promise<boolean>} - Returns true if the authentication is initialized successfully, otherwise false
 */
const initAuthentication = async ({ enabled, authSource, authOutput }) => {
  // Is security disabled?
  if (enabled === false) {
    return true;
  }

  // Is mandatory configuration missing?
  if (!authSource || !authOutput) {
    console.error('authSource or authOutput is missing in the configuration');

    return false;
  }

  try {
    // Read source file
    const authSourceContent = await readFile(authSource);
    // Is the source exists and has content?
    if (authSourceContent?.length > 0) {
      // Convert the string to an array
      const authSourceArray = JSON.parse(authSourceContent);
      // Hash the passwords
      const authEncryptedArray = await encryptPasswords(authSourceArray);
      // Write the output file
      await writeFile(authOutput, JSON.stringify(authEncryptedArray, null, 2));
      // Remove the source file
      await unlink(authSource);

      return true;
    }
  } catch (error) {
    // Prevent logging an error if the source file does not exist
    if (error.code !== 'ENOENT') {
      console.error('Error initAuthentication:', error);
    }
  }

  return false;
};

/**
 * Extracts username and password from a Basic Authentication header
 *
 * @param {string} authorization - The Basic Authentication header value
 * @returns {{username: string, password: string} | {}} - An object with `username` and `password` properties, or `null` if an error occurs
 */
const extractCredentials = (authorization) => {
  if (!authorization || !authorization.startsWith('Basic ')) {
    console.error('Invalid authorization header:', authorization);

    return {};
  }

  const basicAuth = authorization.split(' ').pop();
  const [username, password] = Buffer.from(basicAuth, 'base64')
    .toString()
    .split(':');

  if (!username || !password) {
    console.error('Invalid Basic Auth credentials.');

    return {};
  }

  return { username, password };
};

/**
 * Load the encrypted password from the authentication output file
 * @param {string} path - The path to the authentication output file
 * @param {string} user - The username to search for
 * @returns {Promise<string | null>} - The encrypted password or null if not found
 */
const loadEncryptedPassword = async (path, user) => {
  try {
    const authOutputContent = await readFile(path);
    if (authOutputContent?.length > 0) {
      const authOutputArray = JSON.parse(authOutputContent);
      const auth = authOutputArray.find(({ username }) => user === username);

      if (auth) return auth.password;
    }
  } catch (error) {
    console.error('Error reading the authSource:', error);
  }

  return null;
}

/**
 * Hashes the passwords
 * 
 * @param {Array<{username:string, password:string}>} authSourceArray - The array of usernames and plain text passwords
 * @returns {Promise<Array<{username:string, password:string}>>} - The array of usernames and hashed passwords
 */
const encryptPasswords = async (authSourceArray) => {
  return await Promise.all(
    authSourceArray?.map(async ({ username, password }) => {
      const hash = await bcrypt.hash(password, 10);

      return { username, password: hash };
    })
  );
}

module.exports = {
  authenticate,
  initAuthentication,
  // For testing purposes
  _test: {
    extractCredentials,
    loadEncryptedPassword,
    encryptPasswords,
  },
};
