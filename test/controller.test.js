const assert = require('assert');
const sinon = require('sinon');
const proxyquireStrict = require('proxyquire').noCallThru();
const fs = require('utils/fs');
const env = require('env');
const turtleToJsonld = require('rdf-transformation/turtle-to-jsonld');
const metadata = require('rdf-transformation/metadata');
const security = require('security/index');

const req = {
  socket: {
    remoteAddress: '0.0.0.0',
  },
  headers: {
    authorization: 'Basic YWR authorization',
  },
};

describe('app', async () => {
  let consolidatedHandler;
  let dumpSubjectStub;
  let readFileStub;
  let isWhitelistedStub;
  let authenticateStub;
  let statusStub;
  let typeStub;
  let jsonStub;
  let res;
  describe('GET /consolidated', async () => {
    beforeEach(() => {
      dumpSubjectStub = sinon
        .stub(env, 'DUMP_SUBJECT')
        .value('http://example.com/dump');
      sinon.stub(turtleToJsonld, 'turtleToJsonld').callsFake((graph) => graph);
      sinon.stub(metadata, 'addMetadata').callsFake((graph) => graph);
      readFileStub = sinon.stub(fs, 'readFile');
      isWhitelistedStub = sinon.stub(security, 'isWhitelisted').returns(true);
      authenticateStub = sinon.stub(security, 'authenticate').resolves(true);
      statusStub = sinon.stub().returnsThis();
      typeStub = sinon.stub().returnsThis();
      jsonStub = sinon.stub().returnsThis();
      res = {
        status: statusStub,
        type: typeStub,
        json: jsonStub,
      };
      // prevent mu from being loaded
      consolidatedHandler = proxyquireStrict.load('controller', {
        './query': {
          fetchLatestDumpFilePath: async (_s) => 'share://path/to/file.ttl',
        },
      }).consolidatedHandler;
    });

    afterEach(() => {
      sinon.restore();
    });

    it('returns a 200 status code', async () => {
      readFileStub.resolves('');

      await consolidatedHandler(req, res);

      sinon.assert.calledOnceWithMatch(res.status, 200);
      sinon.assert.calledOnceWithMatch(res.type, 'application/ld+json');
      sinon.assert.calledOnceWithMatch(res.json, {});
    });

    it('returns a 403 status code if the IP address is not whitelisted', async () => {
      isWhitelistedStub.returns(false);

      await consolidatedHandler(req, res);

      sinon.assert.calledOnceWithMatch(res.status, 403);
      assert.deepEqual(res.type.callCount, 0);
      sinon.assert.calledOnceWithMatch(res.json, { error: 'Forbidden' });
    });

    it('returns a 401 status code if the credentials are not authenticated', async () => {
      authenticateStub.resolves(false);

      await consolidatedHandler(req, res);

      sinon.assert.calledOnceWithMatch(res.status, 401);
      assert.deepEqual(res.type.callCount, 0);
      sinon.assert.calledOnceWithMatch(res.json, { error: 'Unauthorized' });
    });

    it('returns a 500 status code if DUMP_SUBJECT is not defined', async () => {
      dumpSubjectStub.value(undefined);

      await consolidatedHandler(req, res);

      sinon.assert.calledOnceWithMatch(res.status, 500);
      assert.deepEqual(res.type.callCount, 0);
      sinon.assert.calledOnceWithMatch(res.json, {
        error: 'Internal Server Error',
      });
    });
  });
});
