const ipRangeCheck = require('ip-range-check');

/**
 * Checks if the given IP address is whitelisted.
 *
 * @param {object} config - The configuration object.
 * @param {boolean} config.enabled - Indicates whether the security is enabled.
 * @param {Array<string>} config.allowedIpAddresses - The list of allowed IP addresses.
 * @param {string} ip - The IP address to check.
 * @returns {boolean} - Returns true if the IP address is whitelisted, otherwise false.
 */
const isWhitelisted = ({ enabled, allowedIpAddresses }, ip) => {
  console.log('IP:', ip);
  console.log('Allowed IP addresses:', allowedIpAddresses);
  console.log('Enabled:', enabled);

  // Is security disabled?
  if (enabled === false) {
    return true;
  }

  // Is mandatory configuration missing?
  if (!allowedIpAddresses) {
    console.error('allowedIpAddresses is missing in the configuration');

    return false;
  }

  // Is the IP address in the allowed IP addresses?
  return ipRangeCheck(ip, allowedIpAddresses);
};

module.exports = {
  isWhitelisted,
};
