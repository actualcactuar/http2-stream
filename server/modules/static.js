const fs = require('fs');
const path = require('path');

const mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "svg": "image/svg+xml",
    "json": "application/json",
    "js": "text/javascript",
    "css": "text/css"
};

const static = (req, res) => {
    const { headers: {
        ':path': requestPath,
    } } = req;


    const staticFilePath = path.join(process.env.NODE_ENV, 'client');
    const requestedFile = path.join(staticFilePath, requestPath);
    const exists = fs.existsSync(requestedFile);
    const extension = requestPath.slice(requestPath.lastIndexOf('.') + 1)
    const mimeType = extension in mimeTypes ? mimeTypes[extension] : 'text/plain'

    if (!exists) {
        res.writeHead(404, null, { 'Content-type': mimeType });
        res.end();
        return;
    }


    res.writeHead(200, null, { 'Content-type': mimeType });

    const stream = fs.createReadStream(requestedFile)
    stream.pipe(res)

    stream.on('end', () => {
        res.end()
    })

}

module.exports = static;