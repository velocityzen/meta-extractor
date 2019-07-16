'use strict';
const test = require('ava');
const extract = require('./index');

test('checks 404 Not Found resource', t => extract({ uri: 'http://www.newyorker.com/doesnotexist' })
  .then(() => t.fail())
  .catch(err => {
    t.is(err.statusCode, 404);
  })
);

test.cb('checks host resource with callback syntax', t => {
  extract({ uri: 'https://www.nytimes.com/' }, (err, res) => {
    t.falsy(err);
    t.truthy(res);
    t.is(res.host, 'www.nytimes.com');
    t.truthy(res.title);
    t.truthy(res.description);
    t.truthy(res.images);
    t.truthy(res.ogTitle);
    t.truthy(res.ogDescription);
    t.end();
  });
});

test('checks page resource and promise syntax', t => extract({ uri: 'http://www.w3.org/TR/html4/index/list.html' })
  .then(res => {
    t.truthy(res);
    t.is(res.host, 'www.w3.org');
    t.truthy(res.title);
    t.truthy(res.path);
  })
);

test('checks page resource', async t => {
  const res = await extract({ uri: 'http://www.w3.org/TR/html4/index/list.html' });
  t.truthy(res);
  t.is(res.host, 'www.w3.org');
  t.truthy(res.title);
  t.truthy(res.path);
});

test('checks binary file', async t => {
  const res = await extract({ uri: 'https://media.newyorker.com/photos/597238624867016af4a67a62/16:9/w_1200,h_630,c_limit/HP-Social-Tout-B-072117.png' });
  t.truthy(res);
  t.is(res.host, 'media.newyorker.com');
  t.truthy(res.file);
  t.is(res.file.ext, 'png');
  t.is(res.file.mime, 'image/png');
});

test('checks the media resource', async t => {
  const res = await extract({ uri: 'https://www.youtube.com/watch?v=9M77quPL3vY&list=RDEMhe2AFH_WvB5nuMd9tU5CHg&index=27' });
  t.truthy(res);
  t.truthy(res.images);
  t.is(res.host, 'www.youtube.com');
  t.is(res.ogType, 'video.other');
  t.is(res.ogVideoWidth, '480');
  t.is(res.ogVideoHeight, '360');
});

test('checks the url with redirects', async t => {
  const res = await extract({ uri: 'https://uxdesign.cc/how-ux-helped-me-learn-english-7f763b81bf0e#.hhgkmdu3r' });
  t.truthy(res);
  t.is(res.host, 'uxdesign.cc');
});

test('gets the custom meta', async t => {
  const res = await extract({
    uri: 'https://meduza.io/en',
    rxMeta: /vk:/im
  })

  t.truthy(res);
  t.truthy(res.vkImage);
});

test('checks the feeds links', async t => {
  const res = await extract({ uri: 'https://www.wired.com/beyond-the-beyond/2018/01/david-byrnes-reasons-cheerful/' });
  t.truthy(res);
  t.truthy(res.feeds);
});

test.cb('checks the response limit', t => {
  extract({
    uri: 'https://www.youtube.com/watch?v=9M77quPL3vY&list=RDEMhe2AFH_WvB5nuMd9tU5CHg&index=27',
    limit: 10
  }, (err, res) => {
    t.truthy(err);
    t.is(err.message, 'Response body limit exceeded');
    t.falsy(res);
    t.end();
  });
});
