const http = require('http');
const https = require('https');
const config = require('./lib/config.js');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const routerHandlers = require('./lib/routerHandler.js');
const fs = require('fs');

//const { httpPort, httpsPort, envName } = config;

//Made these changes for deploying to Heroku
const httpPort = process.env.PORT || 3000;
const envName = 'Heroku';

const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});

httpServer.listen(httpPort, () => {
    console.log(`Server Started at ${httpPort} in ${envName} mode`);
});

// const httpsServerOptions = {
//     key : fs.readFileSync('./https/key.pem'),
//     cert: fs.readFileSync('./https/cert.pem')
// }

// const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
//     unifiedServer(req, res);
// });

// httpsServer.listen(httpsPort, () => {
//     console.log(`Server Started at ${httpsPort} in ${envName} mode`);
// });

const unifiedServer = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    const method = req.method.toLowerCase();

    const queryString = parsedUrl.query;

    const headers = req.headers;

    const decoder = new stringDecoder('utf-8');
    let buffer = '';

    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        const data = {
            trimmedPath,
            method,
            queryString,
            headers,
            'payload'       : JSON.parse(JSON.stringify(buffer))
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
    'hobby' : routerHandlers.hobby,
    'age'   : routerHandlers.age
};