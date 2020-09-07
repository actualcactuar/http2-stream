const http2 = require('http2');
const fs = require('fs');

const app = require('./modules/app')

app.use('/test', (req, res) => {
    res.end('works')
})

const server = http2.createSecureServer({
    key: fs.readFileSync(__dirname + '/localhost-privkey.pem'),
    cert: fs.readFileSync(__dirname + '/localhost-cert.pem'),
}, app);

server.listen(8443);