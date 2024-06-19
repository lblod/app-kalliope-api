const fs = require('node:fs/promises');
const bcrypt = require('bcrypt');

/**
 * Authenticate the request based on the authorization header
 *
 * @param {object} config - The security configuration
 * @param {boolean} config.enabled - Indicates whether the security is enabled
 * @param {string} config.authSource - path to the source of the authentication data
 * @param {string} config.authOutput - path to the output of the authentication data
 * @param {string} authorization - The authorization header
 * @returns {Promise<boolean>} - Returns true if the authorization is valid, otherwise false
 */
const authenticate = async (
  { enabled, authSource, authOutput },
  authorization
) => {
  console.log('Authorization:', authorization);
  console.log('Enabled:', enabled);
  console.log('Auth source:', authSource);
  console.log('Auth output:', authOutput);

  // Is security disabled?
  if (enabled === false) {
    return true;
  }

  // Is mandatory configuration missing?
  if (!authSource || !authOutput) {
    console.error('authSource or authOutput is missing in the configuration');

    return false;
  }

  const basicAuth = authorization.split(' ').pop();
  console.log('Basic auth:', basicAuth);
  const [username, password] = Buffer.from(basicAuth, 'base64')
    .toString()
    .split(':');
  console.log('Username:', username);
  console.log('Password:', password);

  // Generate output if source exists
  try {
    const authSourceContent = await fs.readFile(authSource, {
      encoding: 'utf-8',
    });
    console.log('isAuthSourceExists:', authSourceContent);
    if (authSourceContent?.length > 0) {
      const authSourceArray = JSON.parse(authSourceContent);
      console.log('authSourceArray:', authSourceArray);
      const authOutputArray = await Promise.all(
        authSourceArray?.map(async ({ username, password }) => {
          const hash = await bcrypt.hash(password, 10);

          return { username, password: hash };
        })
      );
      console.log('authOutputArray:', authOutputArray);
      await fs.writeFile(authOutput, JSON.stringify(authOutputArray), {
        encoding: 'utf-8',
      });
      // await fs.unlink(authSource);
    }
  } catch (error) {
    console.error('Error reading the authSource:', error);
  }

  // 3. load authOutput content and check if the authorization is valid
  try {
    const authOutputContent = await fs.readFile(authOutput, {
      encoding: 'utf-8',
    });
    console.log('isAuthOutputExists:', authOutputContent);
    if (authOutputContent?.length > 0) {
      const authOutputArray = JSON.parse(authOutputContent);
      console.log('authOutputArray:', authOutputArray);
      const auth = authOutputArray.find(({ username: u }) => u === username);
      
      if (auth) {
        const match = await bcrypt.compare(password, auth.password);

        return match;
      }
    }
  } catch (error) {
    console.error('Error reading the authSource:', error);
  }

  return false;
};



module.exports = {
  authenticate,
};
