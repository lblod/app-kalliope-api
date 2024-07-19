const assert = require('assert');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const fs = require('utils/fs');

const {
  authenticate,
  initAuthentication,
  _test: { extractCredentials, loadEncryptedPassword, encryptPasswords },
} = require('security/authenticate');

describe('authenticate', () => {
  let hashStub;
  let compareStub;
  let readFileStub;
  let writeFileStub;
  let unlinkStub;
  beforeEach(() => {
    hashStub = sinon.stub(bcrypt, 'hash');
    compareStub = sinon.stub(bcrypt, 'compare');
    readFileStub = sinon.stub(fs, 'readFile');
    writeFileStub = sinon.stub(fs, 'writeFile');
    unlinkStub = sinon.stub(fs, 'unlink');
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('authenticate', () => {
    it('returns true if the authorization is valid', async () => {
      const config = {
        enabled: true,
        authOutput: 'auth-output.json',
      };

      readFileStub
        .withArgs(config.authOutput)
        .resolves(
          '[{"username":"admin", "password":"$2b$10$tbTaji77Wg7lOWw03fi6LubD/6AadeeI9W1Vog/JUGQmHSeMIxo2y"}]'
        );
      compareStub
        .withArgs(
          'password',
          '$2b$10$tbTaji77Wg7lOWw03fi6LubD/6AadeeI9W1Vog/JUGQmHSeMIxo2y'
        )
        .resolves(true);

      const authorization = 'Basic YWRtaW46cGFzc3dvcmQ=';
      const result = await authenticate(config, authorization);
      assert.strictEqual(result, true);
    });
  });

  describe('initAuthentication', () => {
    it('returns true if the authentication is initialized successfully', async () => {
      const config = {
        enabled: true,
        authSource: 'auth-source.json',
        authOutput: 'auth-output.json',
      };

      const authSource = [
        { username: 'admin', password: 'password1' },
        { username: 'user', password: 'password2' },
      ];
      readFileStub
        .withArgs(config.authSource)
        .resolves(JSON.stringify(authSource));

      hashStub.withArgs('password1', 10).resolves('hash1');
      hashStub.withArgs('password2', 10).resolves('hash2');

      const encryptedAuthSource = [
        { username: 'admin', password: 'hash1' },
        { username: 'user', password: 'hash2' },
      ];
      const result = await initAuthentication(config);

      sinon.assert.calledOnceWithExactly(
        writeFileStub,
        config.authOutput,
        JSON.stringify(encryptedAuthSource, null, 2)
      );
      sinon.assert.calledOnce(unlinkStub);
      assert.strictEqual(result, true);
    });
  });

  describe('extractCredentials', () => {
    it('returns the credentials from the authorization header', () => {
      const authorization = 'Basic YWRtaW46cGFzc3dvcmQ=';
      const result = extractCredentials(authorization);
      assert.deepStrictEqual(result, {
        username: 'admin',
        password: 'password',
      });
    });
    it('returns {} if the authorization header is empty', () => {
      const result = extractCredentials();
      assert.deepStrictEqual(result, {});
    });
  });

  describe('loadEncryptedPassword', () => {
    it('returns the encrypted password', async () => {
      const authOutput = 'auth-output.json';
      readFileStub
        .withArgs(authOutput)
        .resolves(
          '[{"username":"admin", "password":"$2b$10$tbTaji77Wg7lOWw03fi6LubD/6AadeeI9W1Vog/JUGQmHSeMIxo2y"}]'
        );

      const result = await loadEncryptedPassword(authOutput, 'admin');
      assert.strictEqual(
        result,
        '$2b$10$tbTaji77Wg7lOWw03fi6LubD/6AadeeI9W1Vog/JUGQmHSeMIxo2y'
      );
    });
    it('returns undefined if the username is not found', async () => {
      const authOutput = 'auth-output.json';
      readFileStub
        .withArgs(authOutput)
        .resolves(
          '[{"username":"admin", "password":"$2b$10$tbTaji77Wg7lOWw03fi6LubD/6AadeeI9W1Vog/JUGQmHSeMIxo2y"}]'
        );

      const result = await loadEncryptedPassword(authOutput, 'user');
      assert.strictEqual(result, null);
    });
  });

  describe('encryptPasswords', () => {
    it('returns the encrypted passwords', async () => {
      const config = [
        { username: 'admin', password: 'password1' },
        { username: 'user', password: 'password2' },
      ];

      hashStub.withArgs('password1', 10).resolves('hash1');
      hashStub.withArgs('password2', 10).resolves('hash2');

      const result = await encryptPasswords(config);
      assert.deepStrictEqual(result, [
        { username: 'admin', password: 'hash1' },
        { username: 'user', password: 'hash2' },
      ]);
    });
    it('returns [] if the config is empty', async () => {
      const result = await encryptPasswords([]);
      assert.deepStrictEqual(result, []);
    });
  });
});
