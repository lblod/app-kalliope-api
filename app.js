const { app, errorHandler } = require('mu');
const { consolidatedHandler } = require('./src/controller.js');
const { initSecurity } = require('./src/security/index.js');
const {
  createSingleRequestEnforcer,
} = require('./src/middleware/create-single-request-enforcer');

const initService = async () => {
  await initSecurity();

  // Enable trust proxy. This will allow us to get the real IP address of the client
  app.set('trust proxy', true);

  /**
   * Node.js uses an event loop to manage asynchronous operations. Computationally expensive tasks can block the event loop,
   * causing concurrent requests to delay response times. If a request takes more than 60 seconds, Nginx may timeout and
   * consider the Node.js service unresponsive.
   *
   * To prevent this, the middleware limits the endpoint to process only one request at a time.
   * If a request is already being processed, it returns a 429 status code (Too Many Requests). 
   * 
   * Related to https://binnenland.atlassian.net/browse/OP-3172?focusedCommentId=108335
   */
  app.get('/consolidated', createSingleRequestEnforcer, consolidatedHandler);

  app.use(errorHandler);

  console.log('jsonld-delta-service running on port 80');
};

initService();
