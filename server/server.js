const http2 = require('http2');
const fs = require('fs');

const { app, streamer } = require('./modules/app');

streamer.use('/node/:hash', (stream, headers) => {
    const { hash } = headers.params;
    console.log({ hash })
    stream.end(hash)
})

const server = http2.createSecureServer({
    key: fs.readFileSync(__dirname + '/localhost-privkey.pem'),
    cert: fs.readFileSync(__dirname + '/localhost-cert.pem'),
}, app);

server.on('stream', streamer);

server.listen(8443);