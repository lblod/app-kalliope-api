const { app, errorHandler } = require('mu');
const { consolidatedHandler } = require('./src/controller.js');
const { initSecurity } = require('./src/security/index.js');

const initService = async () => {
  await initSecurity();

  // Enable trust proxy. This will allow us to get the real IP address of the client
  app.set('trust proxy', true);

  app.get('/consolidated', consolidatedHandler);

  app.use(errorHandler);

  console.log('jsonld-delta-service running on port 80');
};

initService();
