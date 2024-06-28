const assert = require('assert');
const {
  createSingleRequestEnforcer,
} = require('middleware/create-single-request-enforcer');

describe('createSingleRequestEnforcer', () => {
  it('should call next when no request is being processed', async () => {
    const middleware = createSingleRequestEnforcer();
    const req = {};
    const res = {};
    const next = () => {
      assert.ok(true);
    };
    await middleware(req, res, next);
  });

  it('should return 429 when a request is being processed', async () => {
    const middleware = createSingleRequestEnforcer();
    const req = {};
    const res = {
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
    };
    const next = () => {
      assert.ok(false, 'next should not be called');
    };
    middleware(req, res, async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });
    await middleware(req, res, next);
  });

  it('should call next when a request is being processed and then completed', async () => {
    const middleware = createSingleRequestEnforcer();
    const req = {};
    const res = {};
    const next = () => {
      assert.ok(true);
    };
    await middleware(req, res, () => {});
    await middleware(req, res, next);
  });
});
