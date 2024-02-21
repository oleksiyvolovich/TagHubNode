'use strict';

const SOCKET_EVENTS = {
	SEND_MESSAGE: 'send-message',
	RECEIVE_MESSAGE: 'receive-message'
};

class Socket {
	async init(io){
		this.io = io;
		await this.listen();
	}

	async listen(){
		this.io.on('connection', (socket) => {
			socket.on(SOCKET_EVENTS.SEND_MESSAGE, (msg) => {
				console.log('send message: ' + msg);

				// TODO need to add handler for new message

				this.io.emit(SOCKET_EVENTS.SEND_MESSAGE, msg);
			});

			socket.on('disconnect', () => {
				console.log('User disconnected');
			});
		});
	}
}

module.exports = new Socket();