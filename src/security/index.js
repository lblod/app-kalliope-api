const { isWhitelisted } = require('./is-whitelisted');
const { authenticate, initAuthentication } = require('./authenticate');
const { SECURITY_CONFIG_PATH } = require('../env');

let configuration = null;

/**
 * Get the configuration.
 *
 * @returns {object} The configuration.
 */
const getConfiguration = () => {
  if (!configuration) {
    configuration = require(SECURITY_CONFIG_PATH);
  }

  return configuration;
};

module.exports = {
  isWhitelisted: (ip) => isWhitelisted(getConfiguration(), ip),
  authenticate: (authorization) =>
    authenticate(getConfiguration(), authorization),
  initSecurity: () => initAuthentication(getConfiguration()),
};
