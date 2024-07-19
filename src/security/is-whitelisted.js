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
  // Is security disabled?
  if (enabled === false) {
    return true;
  }

  // Is mandatory configuration missing?
  if (!Array.isArray(allowedIpAddresses) || allowedIpAddresses.length === 0) {
    console.error('allowedIpAddresses is missing in the configuration');

    return false;
  }

  // Is the IP address in the allowed IP addresses?
  return ipRangeCheck(ip, allowedIpAddresses);
};

module.exports = {
  isWhitelisted,
};
