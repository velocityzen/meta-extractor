'use strict';
const url = require('url');
const got = require('got');
const htmlparser = require('htmlparser2');
const fileType = require('file-type');
const Transform = require('stream').Transform;
const VERSION = require('./package.json').version;

const USERAGENT = `meta-extractor/${VERSION} (https://github.com/velocityzen/meta-extractor)`;

function fixName(name) {
  return name.replace(/(?::|_)(\w)/g, (matches, letter) => letter.toUpperCase());
}

function parseMeta(attrs, rx) {
  const name = attrs.name || attrs.property || Object.keys(attrs)[0];

  if (rx.test(name)) {
    return [
      fixName(name),
      attrs.content || attrs[name]
    ]
  }
}

function parseFeed(attrs) {
  const match = /^application\/(atom|rss)\+xml$/i.exec(attrs.type);

  if (!match) {
    return;
  }

  return {
    type: match[1],
    href: attrs.href,
    title: attrs.title
  };
}

function createHtmlParser(res, opts) {
  let isHead = false;
  let current;

  return new htmlparser.Parser({
    onopentag: (name, attrs) => {
      current = name;
      if (name === 'head') {
        isHead = true;
      } else if (name === 'meta') {
        const meta = parseMeta(attrs, opts.rx);
        if (meta && !res[meta[0]]) {
          res[meta[0]] = meta[1];
        }
      } else if (name === 'img') {
        const src = attrs.src;
        if (src && src.substr(0, 4) !== 'data') {
          if (!res.images) {
            res.images = new Set();
          }
          res.images.add(url.resolve(opts.uri, src));
        }
      }

      if (isHead && name === 'link') {
        const feed = parseFeed(attrs);
        if (feed) {
          if (!res.feeds) {
            res.feeds = [];
          }
          res.feeds.push(feed);
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

function createParser(opts, done) {
  const limit = opts.limit;
  const urlParts = url.parse(opts.uri);
  const res = {
    host: urlParts.host,
    path: urlParts.path,
    title: ''
  };

  let parser;
  let isFileChecked = false;
  let size = 0;

  return new Transform({
    transform: function(chunk, enc, cb) {
      size += chunk.length;

      if (size >= limit) {
        this.resume();
        return done(new Error('Response body limit exceeded'));
      }

      if (!isFileChecked) {
        let file = fileType(chunk);

        if (file) {
          res.file = file;
          this.resume();
          return done(null, res);
        }

        parser = createHtmlParser(res, {
          uri: opts.uri,
          rx: opts.rx
        });
        isFileChecked = true;
      }

      parser.write(chunk);
      cb();
    },

    flush: cb => {
      res.title = res.title.replace(/\s{2,}|\n/gmi, '');
      cb();
      done(null, res);
    }
  });
}

function _extract(opts, done) {
  const uri = opts.uri;
  const limit = opts.limit || 2 * 1024 * 1024;
  opts.headers = Object.assign({
    'User-Agent': USERAGENT
  }, opts.headers);

  let isDone = false;

  got
    .stream(uri, opts)
    .on('error', err => {
      done(err);
      isDone = true;
    })
    .pipe(createParser({
      uri, limit,
      rx: opts.rxMeta || /charset|description|keywords|twitter:|og:|vk:|al:|theme-color/im
    }, (err, res) => {
      !isDone && done(err, res)
    }));
}

function extract(opts, done) {
  if (!done) {
    return new Promise((resolve, reject) => {
      _extract(opts, (err, res) => err ? reject(err) : resolve(res))
    });
  }

  _extract(opts, done);
}

module.exports = extract;
