'use strict';
const test = require('ava');
const extract = require('./index');

test('checks 404 Not Found resource', t => extract({ uri: 'http://www.newyorker.com/doesnotexist' })
  .then(() => t.fail())
  .catch(err => {
    t.is(err.statusCode, 404);
  })
);

test.cb('checks host resource', t => {
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

test('checks page resource', t => extract({ uri: 'http://www.w3.org/TR/html4/index/list.html' })
  .then(res => {
    t.truthy(res);
    t.is(res.host, 'www.w3.org');
    t.truthy(res.title);
    t.truthy(res.path);
  })
);

test.cb('checks binary file', t => {
  extract({ uri: 'https://superpow.im/static/icons/ogpreview.png' }, (err, res) => {
    t.falsy(err);
    t.truthy(res);
    t.is(res.host, 'superpow.im');
    t.truthy(res.file);
    t.is(res.file.ext, 'png');
    t.is(res.file.mime, 'image/png');
    t.end();
  });
});

test.cb('checks the media resource', t => {
  extract({ uri: 'https://www.youtube.com/watch?v=9M77quPL3vY&list=RDEMhe2AFH_WvB5nuMd9tU5CHg&index=27' }, (err, res) => {
    t.falsy(err);
    t.truthy(res);
    t.truthy(res.images);
    t.is(res.host, 'www.youtube.com');
    t.is(res.ogType, 'video');
    t.is(res.ogVideoWidth, '480');
    t.is(res.ogVideoHeight, '360');
    t.end();
  });
});

test.cb('checks the url with redirects', t => {
  extract({ uri: 'https://uxdesign.cc/how-ux-helped-me-learn-english-7f763b81bf0e#.hhgkmdu3r' }, (err, res) => {
    t.falsy(err);
    t.truthy(res);
    t.is(res.host, 'uxdesign.cc');
    t.end();
  });
});

test.cb('gets the custom meta', t => {
  extract({
    uri: 'https://meduza.io/en',
    rxMeta: /vk:/im
  }, (err, res) => {
    t.falsy(err);
    t.truthy(res);
    t.truthy(res.vkImage);
    t.end();
  });
});

test('checks the feeds links', t => extract({ uri: 'https://www.wired.com/beyond-the-beyond/2018/01/david-byrnes-reasons-cheerful/' })
  .then(res => {
    t.truthy(res);
    t.truthy(res.feeds);
  })
)
