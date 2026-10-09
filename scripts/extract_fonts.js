import https from 'node:https';

https.get('https://fonts.google.com/specimen/Google+Sans+Flex?preview.script=Latn', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const regex = /https:\/\/fonts\.gstatic\.com\/s\/googlesansflex\/[^\)"'\s]+/g;
    const matches = [...new Set(d.match(regex) || [])];
    console.log('Found fonts:', matches.length);
    matches.forEach(m => console.log(m));
  });
});
