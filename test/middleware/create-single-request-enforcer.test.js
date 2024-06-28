const assert = require('assert');
const sinon = require('sinon');
const EventEmitter = require('events');
const {
  createSingleRequestEnforcer,
} = require('middleware/create-single-request-enforcer');

describe('createSingleRequestEnforcer', () => {
  let consoleErrorStub;

  beforeEach(() => {
    // Stub console.error to prevent actual logging during tests
    consoleErrorStub = sinon.stub(console, 'error');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call next when no request is being processed', async () => {
    const middleware = createSingleRequestEnforcer();
    const req = {};
    const res = Object.assign(new EventEmitter(), {});
    const next = () => {
      assert.ok(true);
    };
    await middleware(req, res, next);
  });

  it('should return 429 when a request is being processed', async () => {
    const middleware = createSingleRequestEnforcer();
    const req = {};
    const res = Object.assign(new EventEmitter(), {
      status: (code) => {
        assert.strictEqual(code, 429);

        return {
          json: (data) => {
            assert.deepEqual(data, {
              error: 'Too Many Requests',
              message: 'Only one request is allowed at a time.',
            });
          },
        };
      },
    });
    const next = () => {
      assert.ok(false, 'next should not be called');
    };
    middleware(req, res, async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });
    await middleware(req, res, next);

    sinon.assert.calledOnceWithMatch(consoleErrorStub, 'Too many requests');
  });

  it('should call next when a request is being finished', async () => {
    const middleware = createSingleRequestEnforcer();
    const req = {};
    const res = Object.assign(new EventEmitter(), {});
    const next = () => {
      assert.ok(true);
    };
    await middleware(req, res, () => {});

    // Simulate the response being finished
    res.emit('finish');

    await middleware(req, res, next);
  });

  it('should call next when a connection is closed', async () => {
    const middleware = createSingleRequestEnforcer();
    const req = {};
    const res = Object.assign(new EventEmitter(), {});
    const next = () => {
      assert.ok(true);
    };
    await middleware(req, res, () => {});

    // Simulate the connection being closed
    res.emit('close');

    await middleware(req, res, next);
  });
});
