# meta-extractor

Super simple and fast meta data extractor.

Extracts:
* title
* description
* charset
* theme-color
* all opengraph related data
* all twitter related data
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
```

The first parameter `opts` as in [hyperquest](https://github.com/substack/hyperquest) module


License MIT;

© velocityzen
