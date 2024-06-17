const sinon = require('sinon');
const proxyquireStrict = require('proxyquire').noCallThru();

const readFileStub = sinon.stub();
const { consolidatedHandler } = proxyquireStrict.load('../src/controller.js', {
  './service.js': {
    fetchLatestDumpFilePath: async (_s) => 'share://path/to/file.ttl',
  },
  'node:fs/promises': {
    readFile: readFileStub,
  },
  './security/index.js': {
    isWhitelisted: () => true,
    authenticate: () => true,
  },
});

describe('app', async () => {
  describe('GET /consolidated', async () => {
    afterEach(function () {
      readFileStub.reset();
    });

    it('returns a 200 status code', async () => {
      readFileStub.resolves('');
      const req = {
        socket: {
          remoteAddress: '0.0.0.0',
        },
        headers: {
          authorization: 'Basic YWR authorization',
        },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        type: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis(),
        send: sinon.stub().returnsThis(),
      };
      await consolidatedHandler(req, res);

      sinon.assert.calledOnceWithMatch(res.status, 200);
      sinon.assert.calledOnceWithMatch(res.type, 'application/ld+json');
      // sinon.assert.calledOnceWithMatch(res.json, 200);
    });
  });
});
