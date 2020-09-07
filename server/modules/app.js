
const static = require('./static')

const routes = new Map();

function app(req, res) {
    const { headers: {
        ':path': requestPath,
        ':method': requestMethod,
    } } = req;

    if (routes.has(requestPath)) {
        routes.get(requestPath).call(null, req, res);
        return;
    }

    // Serve static files
    if (requestMethod === 'GET' && /(.js$|.css$|.html$|.ico$)/.test(requestPath)) {
        static(req, res);
        return;
    }

    if (requestMethod === 'GET' && requestPath === '/') {
        static({ ...req, ...req.headers, ...{ headers: { ':path': '/index.html' } } }, res)
        return;
    }

    res.writeHead(403);
    res.end('forbidden')
}

app.use = (path, callback) => {
    routes.set(path, callback)
}

module.exports = app