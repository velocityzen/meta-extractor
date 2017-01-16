'use strict';
const url = require('url');
const hyperquest = require('hyperquest');
const htmlparser = require('htmlparser2');
const fileType = require('file-type');

let rxMeta = /charset|description|twitter:|og:|theme-color/im;

function fixName(name) {
  return name.replace(/(?:\:|_)(\w)/g, (matches, letter) => {
    return letter.toUpperCase();
  });
}

function parseMeta(attr) {
  let name = attr.name || attr.property || Object.keys(attr)[0];

  if (rxMeta.test(name)) {
    return [
      fixName(name),
      attr.content || attr[name]
    ]
  }
}

function createParser(uri, res) {
  let isHead = false;
  let current;

  return new htmlparser.Parser({
    onopentag: (name, attrs) => {
      current = name;
      if (name === 'head') {
        isHead = true;
      } else if (name === 'meta') {
        let meta = parseMeta(attrs);
        if (meta && !res[meta[0]]) {
          res[meta[0]] = meta[1];
        }
      } else if (name === 'img') {
        let src = attrs.src;
        if (src && src.substr(0, 4) !== 'data') {
          if (!res.images) {
            res.images = new Set();
          }
          res.images.add(url.resolve(uri, src));
        }
      }
    },
    ontext: text => {
      if (isHead && current === 'title') {
        res.title += text;
      }
    },
    onclosetag: name => {
      if (name === 'head') {
        isHead = false;
      }
    }
  }, { decodeEntities: true });
}

function parseResponse(uri, response, cb) {
  let uriParts = url.parse(uri);
  let res = {
    host: uriParts.host,
    path: uriParts.path,
    title: ''
  };

  let parser;
  let isClosed = false;
  let isFileChecked = false;

  response.on('data', chunk => {
    if (!isFileChecked) {
      let file = fileType(chunk);

      if (file) {
        res.file = file;
        response.resume();
        isClosed = true;
        return;
      }

      parser = createParser(uri, res);
      isFileChecked = true;
    }

    parser.write(chunk);
  })
  .on('end', () => {
    res.title = res.title.replace(/\s{2,}|\n/gmi, '');
    cb(null, res);
  })
  .on('close', () => !isClosed && cb(new Error('Read stream was closed')))
  .on('error', cb);
}

function extract(opts, done) {
  let maxRedirects = opts.maxRedirects === undefined ? 10 : opts.maxRedirects;

  let request = (opts, cb) => {
    let req = hyperquest(opts)
    .on('response', response => {
      let status = response.statusCode;

      if (status >= 200 && status < 300) {
        return parseResponse(opts.uri, response, cb);
      }

      if (status >= 300 && status < 400 && response.headers.location) {
        req.destroy();

        if (--maxRedirects <= 0) {
          return cb(new Error('Max redirects exceeded.'));
        }

        let redirectUrl = url.resolve(opts.uri, response.headers.location);
        return request(Object.assign({}, opts, { uri: redirectUrl }), cb);
      }

      cb(new Error(`Request Failed.\nStatus Code: ${status}`));
    })
    .on('error', cb);
  }

  request(opts, done);
}

module.exports = extract;
