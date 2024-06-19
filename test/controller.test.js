const assert = require('assert');
const sinon = require('sinon');
const proxyquireStrict = require('proxyquire').noCallThru();

const readFileStub = sinon.stub();
// override dependencies of the controller
const defaultSubs = {
  './service.js': {
    fetchLatestDumpFilePath: async (_s) => 'share://path/to/file.ttl',
  },
  'node:fs/promises': {
    readFile: readFileStub,
  },
  './security/index': {
    isWhitelisted: () => true,
    authenticate: () => true,
  },
  './rdf-transformation/metadata': {
    addMetadata: (graph) => graph,
  },
};
const req = {
  socket: {
    remoteAddress: '0.0.0.0',
  },
  headers: {
    authorization: 'Basic YWR authorization',
  },
};

describe('app', async () => {
  describe('GET /consolidated', async () => {
    afterEach(function () {
      readFileStub.reset();
    });

    it('returns a 200 status code', async () => {
      readFileStub.resolves('');
      const res = {
        status: sinon.stub().returnsThis(),
        type: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis(),
        send: sinon.stub().returnsThis(),
      };
      const { consolidatedHandler } = proxyquireStrict.load(
        'controller',
        defaultSubs
      );

      await consolidatedHandler(req, res);

      sinon.assert.calledOnceWithMatch(res.status, 200);
      sinon.assert.calledOnceWithMatch(res.type, 'application/ld+json');
      sinon.assert.calledOnceWithMatch(res.json, {});
      assert.deepEqual(res.send.callCount, 0);
    });
  });

  it('returns a 403 status code if the IP address is not whitelisted', async () => {
    const { consolidatedHandler } = proxyquireStrict.load('controller', {
      ...defaultSubs,
      './security/index': {
        isWhitelisted: () => false,
        authenticate: () => true,
      },
    });
    const res = {
      status: sinon.stub().returnsThis(),
      type: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
    };

    await consolidatedHandler(req, res);

    sinon.assert.calledOnceWithMatch(res.status, 403);
    assert.deepEqual(res.type.callCount, 0);
    assert.deepEqual(res.json.callCount, 0);
    sinon.assert.calledOnceWithMatch(res.send, { msg: 'Forbidden' });
  });

  it('returns a 401 status code if the credentials are not authenticated', async () => {
    const { consolidatedHandler } = proxyquireStrict.load('controller', {
      ...defaultSubs,
      './security/index': {
        isWhitelisted: () => true,
        authenticate: () => false,
      },
    });
    const res = {
      status: sinon.stub().returnsThis(),
      type: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
    };

    await consolidatedHandler(req, res);

    sinon.assert.calledOnceWithMatch(res.status, 401);
    assert.deepEqual(res.type.callCount, 0);
    assert.deepEqual(res.json.callCount, 0);
    sinon.assert.calledOnceWithMatch(res.send, { msg: 'Unauthorized' });
  });
});
