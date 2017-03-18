'use strict';
const url = require('url');
const got = require('got');
const htmlparser = require('htmlparser2');
const fileType = require('file-type');
const Transform = require('stream').Transform;
const VERSION = require('./package.json').version;

const USERAGENT = `meta-extractor/${VERSION} (https://github.com/velocityzen/meta-extractor)`;

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

function createHtmlParser(uri, res) {
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

function createParser(uri, done) {
  const urlParts = url.parse(uri);
  const res = {
    host: urlParts.host,
    path: urlParts.path,
    title: ''
  };

  let parser;
  let isFileChecked = false;

  return new Transform({
    transform: function(chunk, enc, cb) {
      if (!isFileChecked) {
        let file = fileType(chunk);

        if (file) {
          res.file = file;
          this.resume();
          return done(res);
        }

        parser = createHtmlParser(uri, res);
        isFileChecked = true;
      }

      parser.write(chunk);
      cb();
    },

    flush: cb => {
      res.title = res.title.replace(/\s{2,}|\n/gmi, '');
      cb();
      done(res);
    }
  });
}

function extract(opts, done) {
  const uri = opts.uri;
  opts.headers = Object.assign({
    'User-Agent': USERAGENT
  }, opts.headers);

  let error = null;

  got
    .stream(uri, opts)
    .on('error', err => {
      error = err;
    })
    .pipe(createParser(uri, res => {
      done(error, res)
    }))
}

module.exports = extract;
