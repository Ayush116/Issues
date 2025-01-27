const http = require('http');
const debug = require('debug')('node-angular');
const app = require('./backend/app');

// confirming the port received is a valid number (in case coming from env)
const normalizePort = val => {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port > 0) {
        // port number
        return port;
    }

    return false;
}

// Which type of error is coming and logging it
const onError = error => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + port;
    switch (error.code) {
        case 'EACCESS':
            console.error(bind + ' requires elevated priviledges.');
            process.exit(1);
            // break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
            // break;
        default:
            throw error;
    }
}

// listening to incoming requests
const onListening = () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + port;
    debug('listening on ' + bind);
}

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);
server.on('error', onError); // occured some issues
server.on('listening', onListening); // server is working fine
server.listen(port);
