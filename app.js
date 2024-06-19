const { app, errorHandler } = require('mu');
const { consolidatedHandler } = require('./src/controller.js');
const { initSecurity } = require('./src/security/index.js');

const initService = async () => {
  await initSecurity();

  app.get('/consolidated', consolidatedHandler);

  app.use(errorHandler);

  console.log('jsonld-delta-service running on port 80');
};

initService();
