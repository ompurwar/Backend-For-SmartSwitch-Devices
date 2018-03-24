var express = require('express');
var app = express();
const db = {
  '60:01:94:20:26:86': 'DOOR-7-g14f53a19',
  '18:FE:AA:AA:AA:BB': 'TEMP-1.0.0'
};

app.get('/api/firmware_update', function(req, res) {
  const localBinary = '/bin/' + db[req.headers['x-esp8266-sta-mac']] + '.bin';
  const file = require('fs').readFileSync(
      '.' + localBinary);  // the file you want to get the hash
  const file_size = file.byteLength;
  const hash = md5_file(file);
  console.log('[Request-Log]\t:\ta request landed');
  console.log('[file_size]\t:\t' + file_size)
  console.log('[Device]\t:\t' + db[req.headers['x-esp8266-sta-mac']]+"\n");
  // console.log(String(JSON.stringify(req.headers)));
  console.log("[Free-Space]\t:\t"+req.headers['x-esp8266-free-space']);
  if (!check_header(req, 'user-agent', 'ESP8266-http-Update')) {
    console.log('only for ESP8266 updater!\n');
    res.status(403).send(' 403 Forbidden');
    /*res.statusCode = 403;
    res.statusMessage = ' 403 Forbidden';*/
  } else if (
      !check_header(req, 'x-esp8266-sta-mac') ||
      !check_header(req, 'x-esp8266-ap-mac') ||
      !check_header(req, 'x-esp8266-free-space') ||
      !check_header(req, 'x-esp8266-sketch-size') ||
      !check_header(req, 'x-esp8266-sketch-md5') ||
      !check_header(req, 'x-esp8266-chip-size') ||
      !check_header(req, 'x-esp8266-sdk-version')) {
    console.log('only for ESP8266 updater! (header)\n');
    res.status(403).send(' 403 Forbidden');
    /* statusCode = 403;
    res.statusMessage = ' 403 Forbidden';*/
  } else if (!isset(db[req.headers['x-esp8266-sta-mac']])) {
    res.status(500).send(' 500 ESP MAC not configured for updates');
    /*res.statusCode = 500;
    res.statusMessage = ' 500 ESP MAC not configured for updates';*/
  } else {
    // Check if version has been set and does not match, if not, check if
    // MD5 hash between local binary and ESP8266 binary do not match if not.
    // then no update has been found.
    if ((!check_header(req, 'x-esp8266-sdk-version') &&
         db[req.headers['x-esp8266-sta-mac']] !=
             req.headers['x-esp8266-sta-mac']) ||
        req.headers['x-esp8266-sketch-md5'] != hash) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader(
          'Content-Disposition', 'attachment; filename=' +
              db[req.headers['x-esp8266-sta-mac']] + '.bin');
      res.setHeader('Content-Length', file_size);
      res.setHeader('x-MD5', hash);
      res.status(200);
      res.statusMessage = ' 500 no version for ESP MAC';
      res.sendFile(
          __dirname + localBinary.replace(new RegExp('/', 'g'), '\\'),
          function(err) {
            if (err) {
              console.log(
                  __dirname + localBinary.replace(new RegExp('/', 'g'), '\\'));
              console.error(err);
            } else {
              console.log('\nFirmware send succefully');
            }
          });
      console.log('it worked');
    } else {
      res.status(304).send(' 304 Not Modified');
    }
  }
});

var server = app.listen(8052, function() {
  console.log('update server is running at\t http://hello-pc:8052');
});

function isset(value) {
  if (value === undefined) {
    return false;
  } else {
    return true;
  }
}

function check_header(req, name, value) {
  if (!isset(req.headers[name])) {
    return false;
  }
  if (isset(value) && req.headers[name] !== value) {
    return false;
  }
  return true;
}
function md5_file(data) {
  const crypto = require('crypto');  // crypto module

  var hash = crypto.createHash('md5');  // hashing algorithm you wann use 'md5'
  hash.update(data);
  return hash.digest('hex');
}