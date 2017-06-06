const extract = require('./index');

//error
extract({ uri: 'http://www.newyorker.com/doesnotexist' }, (err, res) =>
  console.log('error', err, res)
);

//url
extract({ uri: 'http://www.newyorker.com' }, (err, res) =>
  console.log('url', err, res)
);

//page
extract({ uri: 'http://www.w3.org/TR/html4/index/list.html' }, (err, res) =>
  console.log('page', err, res)
);

//file
extract({ uri: 'https://superpow.im/static/icons/ogpreview.png' }, (err, res) =>
  console.log('file', err, res)
);

//media
extract({ uri: 'https://www.youtube.com/watch?v=9M77quPL3vY&list=RDEMhe2AFH_WvB5nuMd9tU5CHg&index=27' }, (err, res) =>
  console.log('media', err, res)
);

//redirect
extract({ uri: 'https://uxdesign.cc/how-ux-helped-me-learn-english-7f763b81bf0e#.hhgkmdu3r' }, (err, res) =>
  console.log('redirect', err, res)
);


