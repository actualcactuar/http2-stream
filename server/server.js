const http2 = require('http2');
const fs = require('fs');
const stream = require('stream');

const server = http2.createSecureServer({
    key: fs.readFileSync(__dirname + '/localhost-privkey.pem'),
    cert: fs.readFileSync(__dirname + '/localhost-cert.pem')
}, (req, res) => {
    res.writeContinue()
});

server.on('error', (err) => console.error(err));

const duplex = stream.Duplex({
    read(size) {
        // console.log(this)
        // console.log({ size })
        return true;
    },

    write(chunk, encoding, callback) {
        this.push(chunk)
        callback(); // flushes the buffer and emits 'drain' event
    },
})

duplex.on('close', () => {
    console.log('closed')
})

duplex.on('data', data => {
    console.log({ data })
})

server.on('request', (request, response) => {
    response.writeContinue()
})

server.on('stream', (stream, headers) => {

    const path = headers[':path'].replace('/', '');
    const method = headers[':method'];

    console.log({ path, method })

    stream.respond({ ':status': 206 });

    stream.write('FOOo')
    stream.sendTrailers
    stream.pipe(stream, { readableHightWaterMark: 1 })
    stream.on('end', () => {
        stream.end()
    })

    // stream.end('some data');


});

server.listen(8443);