# meta-extractor

Super simple and fast meta data extractor.

Extracts:
* title
* description
* charset
* theme-color
* all opengraph related data
* all twitter related data
* all image urls (absolute)

## install

`npm i meta-extractor`

## usage

```js
const extract = require('meta-extractor');

extract({ uri: 'http://www.newyorker.com' }, function(err, res) {
  console.log(err, res);
});
```

License MIT;

© velocityzen
