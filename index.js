const http = require('http');
const config = require('./lib/config.js');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const routerHandlers = require('./lib/routerHandler.js');

const httpPort = config.httpPort;
const httpsPort = config.httpsPort;

const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});

httpServer.listen(httpPort, () => {
    console.log(`Server Started at ${httpPort} in ${config.envName} mode`);
})

const unifiedServer = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    const method = req.method.toLowerCase();

    const queryStringObject = parsedUrl.query;

    const headers = req.headers;

    const decoder = new stringDecoder('utf-8');
    let buffer = '';

    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        const data = {
            'path'          : trimmedPath,
            'method'        : method,
            'queryString'   : queryStringObject,
            'headers'        : headers,
            'payload'       : buffer
        };

        //Choose the route (Router Logic)
        const chosenRoute = typeof router[trimmedPath] != 'undefined' ? router[trimmedPath] : routerHandlers.notFound;

        chosenRoute(data, (statusCode, payload) => {
            //Use the statusCode callback by the handler or 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            //Use the payload called back by the handler or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            let payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log(statusCode, payloadString);
        })

    });
}

const router = {
    'users' : routerHandlers.users,
    'hobby' : routerHandlers.hobby
};