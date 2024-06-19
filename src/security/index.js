const { isWhitelisted } = require('./is-whitelisted');
const { authenticate } = require('./authenticate');

const configurationPath =
  process.env.SECURITY_CONFIG_PATH || '/config/security.json';

let configuration = null;

/**
 * Get the configuration.
 *
 * @returns {object} The configuration.
 */
const getConfiguration = () => {
  if (!configuration) {
    configuration = require(configurationPath);
  }

  return configuration;
};

module.exports = {
  isWhitelisted: (ip) => isWhitelisted(getConfiguration(), ip),
  authenticate: (authorization) =>
    authenticate(getConfiguration(), authorization),
  initSecurity: () => getConfiguration(),
};
