
const static = require('./static')

const routes = new Map();
const streams = new Map();

const buildRouteRegex = route => {
    const formattedRoute = route
        .split('/')
        .map(str => {
            if (str.match(':')) {
                return '(.[^\\/])*\\w+';
            }
            return str;
        })
        .join('\\/');
    const regex = new RegExp(`^${formattedRoute}$`);
    return regex;
};

const buildRouteParams = (route, pathname) => {
    const splitPath = pathname.split('/');
    const params = {};
    route.split('/').forEach((param, index) => {
        if (param.match(':')) {
            params[param.slice(1)] = splitPath[index];
        }
    });

    return params;
};

function app(req, res) {
    const { headers: {
        ':path': requestPath,
        ':method': requestMethod,
    } } = req;



    for (const [regex, { route, callback }] of streams.entries()) {

        if (regex.test(requestPath)) {
            res.writeContinue()
            return;
        }

    }

    for (const [regex, { route, callback }] of routes.entries()) {

        if (regex.test(requestPath)) {
            const params = buildRouteParams(route, requestPath);
            callback.call(null, { ...req, params }, res)
            return;
        }

    }

    // Serve static files
    if (requestMethod === 'GET' && /(.js$|.css$|.html$|.ico$)/.test(requestPath)) {
        static(req, res);
        return;
    }

    if (requestMethod === 'GET' && requestPath === '/') {
        static({ ...req, ...{ headers: { ...req.headers, ':path': '/index.html' } } }, res)
        return;
    }

    res.writeHead(403);
    res.end('forbidden')
}


app.use = (route, callback) => {
    const regex = buildRouteRegex(route);
    routes.set(regex, { callback, route })
}

const streamer = (stream, headers) => {
    const {
        ':path': requestPath,
    } = headers;

    for (const [regex, { route, callback }] of streams.entries()) {

        if (regex.test(requestPath)) {
            const params = buildRouteParams(route, requestPath);
            callback.call(null, stream, { ...headers, params })
            return;
        }

    }
}

streamer.use = (route, callback) => {
    const regex = buildRouteRegex(route);
    streams.set(regex, { callback, route })
}

module.exports = { app, streamer }