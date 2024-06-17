
const ipRangeCheck = require("ip-range-check");
/**
 * Checks if the given IP address is whitelisted.
 *
 * @param {object} config - The configuration object.
 * @param {boolean} config.enabled - Indicates whether the security is enabled.
 * @param {Array<string>} config.allowedIpAddresses - The list of allowed IP addresses.
 * @param {string} ip - The IP address to check.
 * @returns {boolean} - Returns true if the IP address is whitelisted, otherwise false.
 */
const isWhitelisted = ({enabled, allowedIpAddresses}, ip) => {
  if (!enabled) {
    return true;
  }
  
  if (!ipRangeCheck(ip, allowedIpAddresses)) {
    return false;
  }

  return true;
};

module.exports = {
  isWhitelisted,
};
