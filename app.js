const { app, errorHandler } = require('mu');
const consolidatedHandler = require('./src/controller.js').consolidatedHandler;

app.get('/consolidated', consolidatedHandler);

app.use(errorHandler);

console.log('jsonld-delta-service running on port 80');
