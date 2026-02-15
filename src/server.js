const http = require('http');
const fs = require('fs');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

const users = {};

const respondJSON = (request, response, status, object) => {
    const content = JSON.stringify(object);
    response.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content, 'utf8'),
    });

    if (request.method !== 'HEAD' && status !== 204) {
        response.write(content);
    }

    response.end();
};

const onRequest = (request, response) => {
    console.log(request.url);

    switch (request.url) {
        case '/': {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.write(index);
            response.end();
            break;
        }
        case '/style.css': {
            response.writeHead(200, { 'Content-Type': 'text/css' });
            response.write(css);
            response.end();
            break;
        }
        case '/getUsers': {
            const content = JSON.stringify(users);

            response.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(content, 'utf8') });

            if (request.method !== 'HEAD') {
                response.write(content);
            }

            response.end();
            break;
        }
        case '/addUser': {

            if (request.method === 'POST') {

                const body = [];

                request.on('error', (err) => {
                    console.dir(err);
                    response.statusCode = 400;
                    response.end();
                });

                request.on('data', (chunk) => {
                    body.push(chunk);
                });

                request.on('end', () => {
                    request.body = JSON.parse(Buffer.concat(body).toString());

                    const responseJSON = {
                        message: 'Name and age are both required.',
                    };

                    const { name, age } = request.body;

                    if (!name || !age) {
                        responseJSON.id = 'addUserMissingParams';
                        respondJSON(request, response, 400, responseJSON);
                    }

                    let responseCode = 204;

                    if (!users[name]) {
                        responseCode = 201;
                        users[name] = {
                            name: name,
                        };
                    }

                    users[name].age = age;

                    if (responseCode === 201) {
                        responseJSON.message = 'Created Successfully';
                        return respondJSON(request, response, responseCode, responseJSON);
                    }

                    respondJSON(request, response, responseCode, {});
                });
            }

            break;
        }
        default: {
            break;
        }

    }
};

http.createServer(onRequest).listen(port, () => {
    console.log(`Listening on 127.0.0.1:${port}`);
});