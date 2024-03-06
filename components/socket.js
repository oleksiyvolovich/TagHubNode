'use strict';
const jwt = require('jsonwebtoken');
const socketIo = require('socket.io');
const config = require('../config');
const ConversationController = require('controllers/conversation.controller');

const SOCKET_EVENTS = {
	SEND_MESSAGE: 'send-message',
	RECEIVE_MESSAGE: 'receive-message'
};

class Socket {
	async init(server) {
		this.io = socketIo(server, {
			cors: { origin: '*' }
		});
		await this.verifyToken();
		await this.listen();
	}

	async listen() {
		this.io.on('connection', (socket) => {
			console.log('connection');

			socket.on(SOCKET_EVENTS.SEND_MESSAGE, async(msg) => {
				if (!msg || !msg.text || !msg.chatId) {
					return null;
				}

				const message = await ConversationController._createMessage({
					senderId: socket.user._id,
					chatId: msg.chatId,
					text: msg.text
				});

				this.io.emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
			});

			socket.on('disconnect', () => {
				console.log('User disconnected');
			});
		});
	}

	async verifyToken() {
		this.io.use((socket, next) => {
			const headers = socket.handshake.headers;
			const token = headers['x-access-token'] || null;

			if (!token) {
				return next(new Error('Authentication error: Token missing'));
			}

			try {
				socket.user = token ? jwt.decode(token, config.jwt.secret) : {};
				return next();
			}catch (e) {
				return next(new Error('Authentication error: Token missing'));
			}
		});
	}
}

module.exports = new Socket();