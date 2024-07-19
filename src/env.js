const DUMP_SUBJECT = process.env.DUMP_SUBJECT;
const SECURITY_CONFIG_PATH =
  process.env.SECURITY_CONFIG_PATH || '/config/security.json';

module.exports = {
  DUMP_SUBJECT,
  SECURITY_CONFIG_PATH,
};
