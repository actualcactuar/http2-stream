const http2 = require('http2');
const fs = require('fs');

const { streamer, app } = require('./modules/app');

const streams = new Map();

streamer.use('/node/:hash', (stream, headers) => {
    const method = headers[':method']
    const { hash } = headers.params;

    if (method === 'GET') {
        if (!streams.has(hash)) streams.set(hash, new Set())

        streams.get(hash).add(stream)
    }

    if (method === 'POST') {
        if (!streams.has(hash)) streams.set(hash, new Set())

        stream.on('data', chunk => {
            console.log({ chunk })
            for (const res of streams.get(hash)) {
                res.write(chunk)
            }
        })

        stream.on('close', () => {
            console.log('stream closed')
            for (const res of streams.get(hash)) {
                res.end()
            }
        })

    }
    console.log({ hash, method })
})

const server = http2.createSecureServer({
    key: fs.readFileSync(__dirname + '/key.pem'),
    cert: fs.readFileSync(__dirname + '/cert.pem'),
});

server.on('stream', streamer);
server.on('request', app);

server.listen(8443);