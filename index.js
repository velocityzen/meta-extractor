'use strict';
const url = require('url');
const hyperquest = require('hyperquest');
const htmlparser = require('htmlparser2');

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

function extract(opts, cb) {
  let uri = url.parse(opts.uri);
  let host = uri.protocol + '//' + uri.host;
  let res = {
    host: uri.host,
    title: '',
    images: new Set()
  };
  let isHead = false;
  let current;
  let parser = new htmlparser.Parser({
    onopentag: function(name, attrs) {
      current = name;
      if (name === 'head') {
        isHead = true;
      } else if (name === 'meta') {
        let meta = parseMeta(attrs);
        if (meta) {
          res[meta[0]] = meta[1];
        }
      } else if (name === 'img') {
        let src = attrs.src;
        if (src && src.substr(0, 4) !== 'data') {
          if (src[0] === '/') {
            src = host + src;
          }
          res.images.add(src);
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

  hyperquest(opts)
    .on('data', chunk => parser.write(chunk))
    .on('end', () => {
      res.title = res.title.replace(/\s{2,}|\n/gmi, '');
      cb(null, res);
    })
    .on('close', () => cb(new Error('Read stream was closed')))
    .on('error', err => cb(err));
}

module.exports = extract;
