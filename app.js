import { app, errorHandler } from 'mu';

app.get('/consolidated', function (req, res) { 
  res.send('consolidated works!');
});

console.log('jsonld-delta-service running on port 80');

