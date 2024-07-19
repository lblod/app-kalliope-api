const assert = require('assert');
const { isWhitelisted } = require('security/is-whitelisted');

describe('isWhitelisted', () => {
  it('returns false if the IP address is not whitelisted', () => {
    const config = {
      enabled: true,
      allowedIpAddresses: ['127.0.0.1', '0:0:0:0:0:0:0:1'],
    };
    const ip = '127.0.0.2';
    const result = isWhitelisted(config, ip);
    assert.strictEqual(result, false);
  });
  it('returns true if the IPv4 address is whitelisted', () => {
    const config = {
      enabled: true,
      allowedIpAddresses: ['127.0.0.1', '0:0:0:0:0:0:0:1'],
    };
    const ip = '127.0.0.1';
    const result = isWhitelisted(config, ip);
    assert.strictEqual(result, true);
  });
  it('returns true if the IPv6 address is whitelisted', () => {
    const config = {
      enabled: true,
      allowedIpAddresses: ['127.0.0.1', '0:0:0:0:0:0:0:1'],
    };
    const ip = '0:0:0:0:0:0:0:1';
    const result = isWhitelisted(config, ip);
    assert.strictEqual(result, true);
  });
  it('returns true if the IP address is whitelisted in range', () => {
    const config = {
      enabled: true,
      allowedIpAddresses: ['127.0.0.1', '0:0:0:0:0:0:0:1', '125.19.23.0/24'],
    };
    const ip = '125.19.23.12';
    const result = isWhitelisted(config, ip);
    assert.strictEqual(result, true);
  });
  it('returns true if the security is disabled', () => {
    const config = {
      enabled: false,
      allowedIpAddresses: ['127.0.0.1', '0:0:0:0:0:0:0:1'],
    };
    const ip = '127.0.0.2';
    const result = isWhitelisted(config, ip);
    assert.strictEqual(result, true);
  });
  it('returns false if allowedIpAddresses is missing in the configuration', () => {
    const config = {
      enabled: true,
    };
    const ip = '125.19.23.12';
    const result = isWhitelisted(config, ip);
    assert.strictEqual(result, false);
  });
});
