const { isWhitelisted } = require('./isWhitelisted');
const { authenticate } = require('./authenticate');

const configurationPath =
  process.env.SECURITY_CONFIG_PATH || '/config/security.json';

let configuration = null;
// expample of configuration file:
// {
//   "enabled": true,
//   "allowedIpAddresses": [
//     "127.0.0.1",
//     "0:0:0:0:0:0:0:1"
//   ],
//   "source": "/tmp/source-example.json",
//   "output": "/tmp/out.json",
// }

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
