const extract = require('./index');

//url
extract({ uri: 'http://www.newyorker.com' }, (err, res) =>
  console.log(err, res)
);

//page
extract({ uri: 'http://www.w3.org/TR/html4/index/list.html' }, (err, res) =>
  console.log(err, res)
);

//file
extract({ uri: 'https://superpow.im/static/icons/ogpreview.png' }, (err, res) =>
  console.log(err, res)
);

//media
extract({ uri: 'https://www.youtube.com/watch?v=9M77quPL3vY&list=RDEMhe2AFH_WvB5nuMd9tU5CHg&index=27' }, (err, res) =>
  console.log(err, res)
);

//redirect
extract({ uri: 'https://uxdesign.cc/how-ux-helped-me-learn-english-7f763b81bf0e#.hhgkmdu3r' }, (err, res) =>
  console.log(err, res)
);


