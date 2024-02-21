'use strict';

// core packages
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');

// app packages
const _ = require('lodash');

// components
const Cors = require('./components/cors');
const Auth = require('./components/auth');
const Routes = require('./components/routes');
const Socket = require('./components/socket');
const Database = require('./database');

class Server {
	constructor(){
		this.app = express();
		this.port = _.parseInt(process.env.PORT, 10) || 9001;
	}

	async setCore(){
		this.app.set('port', this.port);

		this.app.use(bodyParser.json({limit: '50mb'}));
		this.app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

		// Auth verifier
		this.app.use(Auth.verifier);

		// set cors
		this.app.options('*', Cors);

		this.app.all('*', (req, res, next) => {
			// parse parameters. Request body has higher priority than query parameters.
			req.parameters = _.merge({}, req.query, req.body);

			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Headers', 'X-Requested-With');
			next();
		});
	}

	async setRoutes(){
		const routesInstance = new Routes(this.app);
		return routesInstance.init();
	}

	async start(){
		await this.setCore();
		await this.setRoutes();

		/** Initialization Database connection **/
		await Database.init();

		/** Creating node HTTP server **/
		const server = http.createServer(this.app);

		/** Initialization socket connection **/
		await Socket.init(socketIo(server));

		server.listen(this.port, () => {
			console.log(`The server is running at http://localhost:${this.port}`);
		});
	}
}

const serverInstance = new Server();

return serverInstance.start();