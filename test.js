const extract = require('./index');

extract({ uri: 'http://www.newyorker.com' }, (err, res) =>
  console.log(err, res)
);
