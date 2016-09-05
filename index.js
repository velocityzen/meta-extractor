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
    onopentag: function(name, attrs) {
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
    ontext: function(text) {
      if (isHead && current === 'title') {
        res.title += text;
      }
    },
    onclosetag: function(name) {
      if (name === 'head') {
        isHead = false;
      }
    }
  }, { decodeEntities: true });
}

function extract(opts, cb) {
  let uri = url.parse(opts.uri);
  let res = {
    host: uri.host,
    path: uri.path,
    title: ''
  };

  let parser;
  let isClosed = false;
  let isFileChecked = false;
  let req = hyperquest(opts)
    .on('data', chunk => {
      if (!isFileChecked) {
        let file = fileType(chunk);

        if (file) {
          res.file = file;
          req.end();
          isClosed = true;
          req.destroy();
          return;
        }

        parser = createParser(opts.uri, res);
        isFileChecked = true;
      }

      parser.write(chunk);
    })
    .on('end', () => {
      res.title = res.title.replace(/\s{2,}|\n/gmi, '');
      cb(null, res);
    })
    .on('close', () => !isClosed && cb(new Error('Read stream was closed')))
    .on('error', err => cb(err));
}

module.exports = extract;
