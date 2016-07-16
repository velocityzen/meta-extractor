const extract = require('./index');

const uris = [
  'http://www.newyorker.com',
  'http://www.w3.org/TR/html4/index/list.html',
  'http://65.media.tumblr.com/6befa1e9d561cb2c66e65a67731af600/tumblr_o7t3afkeA41qagn9ao1_1280.jpg',
  'https://www.youtube.com/watch?v=9M77quPL3vY&list=RDEMhe2AFH_WvB5nuMd9tU5CHg&index=27',
  'https://medium.com/@joonhocho/getting-off-the-google-bus-24b8ecc12328',
  'http://joonhocho.com',
];

uris.forEach((uri) => {
  extract({
    uri,
    headers: {
      Accept: 'text/html',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36'
    },
    timeout: 10 * 1000
  }).then(
    (res) => console.log(uri, 'OK', res),
    (err) => console.error(uri, 'ERROR', err)
  );
});
