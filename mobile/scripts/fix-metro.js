const fs = require('fs');
const path = require('path');

const metroSrc = path.join(__dirname, '..', 'node_modules', 'metro', 'src', 'lib', 'formatBundlingError.js');
const metroPrivate = path.join(__dirname, '..', 'node_modules', 'metro', 'private', 'lib');

if (fs.existsSync(metroSrc)) {
  if (!fs.existsSync(metroPrivate)) {
    fs.mkdirSync(metroPrivate, { recursive: true });
  }
  const dest = path.join(metroPrivate, 'formatBundlingError.js');
  fs.copyFileSync(metroSrc, dest);
  console.log('Fixed metro formatBundlingError module');
}
