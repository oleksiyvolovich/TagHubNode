'use strict';

const apn = require('apn');
const config = require('../config');

class Apn {
	constructor() {
		try {
			this.provider = new apn.Provider(config.apn.options);
		}catch (e) {
			console.log(`APN PROVIDER: ERROR, ${e}`);
		}
	}

	async sendPush(message, deviceId) {
		// Формируем пакет уведомлений
		const notification = new apn.Notification({
			alert: message.text,
			topic: config.apn.topic,
			payload: { message: message.guid }
		});

		return this.provider.send(notification, deviceId);
	}
}

// export the class as a singleton
module.exports = new Apn();