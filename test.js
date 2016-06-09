const extract = require('./index');

extract({ uri: 'http://www.newyorker.com' }, (err, res) =>
  console.log(err, res)
);

extract({ uri: 'http://www.w3.org/TR/html4/index/list.html' }, (err, res) =>
  console.log(err, res)
);

extract({ uri: 'http://65.media.tumblr.com/6befa1e9d561cb2c66e65a67731af600/tumblr_o7t3afkeA41qagn9ao1_1280.jpg' }, (err, res) =>
  console.log(err, res)
);

extract({ uri: 'https://www.youtube.com/watch?v=9M77quPL3vY&list=RDEMhe2AFH_WvB5nuMd9tU5CHg&index=27' }, (err, res) =>
  console.log(err, res)
);
