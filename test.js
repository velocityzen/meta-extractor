const extract = require('./index');

extract({ uri: 'http://www.newyorker.com' }, function(err, res) {
  console.log(err, res);
});
