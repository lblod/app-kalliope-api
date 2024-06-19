const fs = require('node:fs/promises');
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

  // Load output content and check if the authorization is valid
  try {
    const authOutputContent = await fs.readFile(authOutput, {
      encoding: 'utf-8',
    });
    if (authOutputContent?.length > 0) {
      const authOutputArray = JSON.parse(authOutputContent);
      const auth = authOutputArray.find(({ username: u }) => u === username);

      if (auth) return await bcrypt.compare(password, auth.password);
    }
  } catch (error) {
    console.error('Error reading the authSource:', error);
  }

  return false;
};

/**
 * Initialize the authentication process
 *
 * @param {object} config - The security configuration
 * @param {boolean} config.enabled - Indicates whether the security is enabled
 * @param {string} config.authSource - path to the source of the authentication data
 * @param {string} config.authOutput - path to the output of the authentication data
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
    const authSourceContent = await fs.readFile(authSource, {
      encoding: 'utf-8',
    });
    // Is the source exists and has content?
    if (authSourceContent?.length > 0) {
      // Convert the string to an array
      /** @type {Array<{username:string, password:string}>} */
      const authSourceArray = JSON.parse(authSourceContent);
      // Hash the passwords
      const authOutputArray = await Promise.all(
        authSourceArray?.map(async ({ username, password }) => {
          const hash = await bcrypt.hash(password, 10);

          return { username, password: hash };
        })
      );
      const authOutputContent = JSON.stringify(authOutputArray, null, 2);
      // Write the output file
      await fs.writeFile(authOutput, authOutputContent, {
        encoding: 'utf-8',
      });
      // Remove the source file
      await fs.unlink(authSource);

      return true;
    }
  } catch (error) {
    console.error('Error reading the authSource:', error);
  }

  return false;
};

/**
 * Extracts username and password from a Basic Authentication header
 *
 * @param {string} authorization - The Basic Authentication header value
 * @returns {{username: string, password: string} | null} - An object with `username` and `password` properties, or `null` if an error occurs
 */
const extractCredentials = (authorization) => {
  if (!authorization || !authorization.startsWith('Basic ')) {
    console.error('Invalid authorization header:', authorization);

    return null;
  }

  const basicAuth = authorization.split(' ').pop();
  const [username, password] = Buffer.from(basicAuth, 'base64')
    .toString()
    .split(':');

  if (!username || !password) {
    console.error('Invalid Basic Auth credentials.');

    return null;
  }

  return { username, password };
};

module.exports = {
  authenticate,
  initAuthentication,
};
