# meta-extractor

[![NPM Version](https://img.shields.io/npm/v/meta-extractor.svg?style=flat-square)](https://www.npmjs.com/package/meta-extractor)
[![NPM Downloads](https://img.shields.io/npm/dt/meta-extractor.svg?style=flat-square)](https://www.npmjs.com/package/meta-extractor)

Super simple and fast meta data extractor with low memory footprint.

Extracts:

- title
- description
- charset
- theme-color
- rss/atom feeds
- all opengraph meta data
- all twitter meta data
- all app links meta data
- all vk meta data
- all unique image urls (absolute)
- **returns mime and extension for binary files without downloading the whole file**

## install

`npm i meta-extractor`

## usage

```js
const extract = require('meta-extractor');

extract({ uri: 'http://www.newyorker.com' }, (err, res) =>
  console.log(err, res)
);

or;

const res = await extract({ uri: 'http://www.newyorker.com' });
console.log(res);
```

If no callback provided returns a Promise.

The first parameter `opts` as in [got](https://github.com/sindresorhus/got) module and:

- **uri** — uri to get meta from.
- rxMeta — regexp, custom regexp for meta data.
- limit — number, response body size limit in bytes. Default 2Mb.

License MIT;

© velocityzen
