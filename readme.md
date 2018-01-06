# meta-extractor

[![NPM Version](https://img.shields.io/npm/v/meta-extractor.svg?style=flat-square)](https://www.npmjs.com/package/meta-extractor)
[![NPM Downloads](https://img.shields.io/npm/dt/meta-extractor.svg?style=flat-square)](https://www.npmjs.com/package/meta-extractor)

Super simple and fast meta data extractor.

Extracts:
* title
* description
* charset
* theme-color
* feeds links
* all opengraph meta data
* all twitter meta data
* all app links meta data
* all vk meta data
* all unique image urls (absolute)
* __returns mime and extension for binary files__

## install

`npm i meta-extractor`

## usage

```js
const extract = require('meta-extractor');

extract({ uri: 'http://www.newyorker.com' }, (err, res) =>
  console.log(err, res)
);

or

extract({ uri: 'http://www.newyorker.com' })
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

If no callback provided returns a Promise.

The first parameter `opts` as in [got](https://github.com/sindresorhus/got) module and:

* **uri** — uri to get meta from;
* rxMeta — regexp, custom regexp for meta data.


License MIT;

© velocityzen
