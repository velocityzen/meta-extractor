'use strict';
const url = require('url');
const hyperquest = require('hyperquest');
const htmlparser = require('htmlparser2');
const fileType = require('file-type');

const rxMeta = /^(?:charset|description|keywords|favicon|theme-color|author)$|^(?:og|al|twitter|fb|article):/i;
const isUrlMeta = /url|uri|href|link|image|icon/i;
const rxLink = /^(?:canonical|alternate|publisher|me)$|icon/i;

function parseMeta(attrs, base) {
  const name = attrs.name || attrs.property || Object.keys(attrs)[0];
  if (rxMeta.test(name)) {
    let content = attrs.content || attrs[name];
    if (isUrlMeta.test(name)) content = url.resolve(base, content);
    return [name, content];
  }
}

function parseLink(attrs, base) {
  if (attrs.href && rxLink.test(attrs.rel)) {
    return ['link:' + attrs.rel, url.resolve(base, attrs.href)];
  }
}

function extract(opts) {
  return new Promise((resolve, reject) => {
    const uri = url.parse(opts.uri);
    const res = {
      host: uri.host,
      path: uri.path,
      title: ''
    };

    let isHead = false;
    let current;
    let base = opts.uri;
    const parser = new htmlparser.Parser({
      onopentag: (name, attrs) => {
        current = name;
        switch (name) {
        case 'head':
          isHead = true;
          break;
        case 'base':
          if (attrs.href) base = url.resolve(base, attrs.href);
          break;
        case 'meta':
          const meta = parseMeta(attrs, base);
          if (meta) res[meta[0]] = meta[1];
          break;
        case 'link':
          const link = parseLink(attrs, base);
          if (link) res[link[0]] = link[1];
          break;
        case 'img':
          const src = attrs.src;
          if (src && src.substr(0, 4) !== 'data') {
            if (!res.images) {
              res.images = new Set();
            }
            res.images.add(url.resolve(base, src));
          }
          break;
        }
      },
      ontext: (text) => {
        if (isHead && current === 'title') {
          res.title += text;
        }
      },
      onclosetag: (name) => {
        if (name === 'head') isHead = false;
      }
    }, { decodeEntities: true });

    let isClosed = false;
    let isFileChecked = false;
    let isSuccess = false;
    const req = hyperquest(opts)
      .on('data', chunk => {
        if (!isFileChecked) {
          const file = fileType(chunk);

          if (file) {
            res.file = file;
            req.end();
            isClosed = true;
            req.destroy();
            return;
          }

          isFileChecked = true;
        }

        parser.write(chunk);
      })
      .on('end', () => {
        res.title = res.title.replace(/\s{2,}|\n/gmi, '');
        if (isSuccess) resolve(res);
      })
      .on('close', () => !isClosed && reject(new Error('Read stream was closed')))
      .on('response', (response) => {
        const {statusCode} = response;
        isSuccess = statusCode >= 200 && statusCode < 300;
        if (statusCode >= 300 && statusCode < 400) {
          if (response.headers.location) {
            opts.uri = response.headers.location;
            extract(opts).then(resolve, reject);
          } else {
            reject(new Error(response.statusMessage || statusCode));
          }
        } else if (statusCode >= 400) {
          reject(new Error(response.statusMessage || statusCode));
        }
      })
      .on('error', (err) => reject(err));
  });
}

module.exports = extract;
