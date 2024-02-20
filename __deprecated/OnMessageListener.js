'use strict';

const mongoose = require('mongoose');
const apn = require('apn');
const path = require('path');

const TagHubUserData = mongoose.model('TagHubUserData', new mongoose.Schema({
	username: {type: String, required: true, unique: true},
	likedMessagesGUIDS: [String],
	channelModels: [String],
	postedMessagesGUIDS: [String],
	additionalData: [String]
}));

const Message = mongoose.model('Message', new mongoose.Schema({
	guid: String,
	text: String,
	author: String,
	creationTime: String,
	tags: [String]
}));

const filePath = path.join(__dirname, 'AuthKey_2KM5Q88N5G.p8');

// настройки APNS-сервера
const options = {
	token: {
		key: filePath,
		keyId: '2KM5Q88N5G',
		teamId: 'XSJJ46AGM5'
	},
	production: true // false для sandbox, true для production-режима
};

const apnProvider = new apn.Provider(options);

// Настраиваем change stream на коллекцию messages
const changeStream = Message.watch();

console.log('start watching message');

changeStream.on('change', async(change) => {
	console.log('new message arrived');
	// Если произошло добавление нового документа в коллекцию messages
	if(change.operationType === 'insert'){
		const newMessage = change.fullDocument;

		// Ищем всех пользователей, у которых в каналах есть такие же теги, как в новом сообщении
		const users = await TagHubUserData.find({
			channelModels: {
				$elemMatch: {
					tags: {$in: newMessage.tags}
				}
			}
		});

		// Формируем массив устройств для отправки уведомлений
		const devices = users.map(user => user.additionalData);

		console.log(devices);

		// Формируем пакет уведомлений
		const notification = new apn.Notification({
			alert: newMessage.text,
			topic: 'com.alexeyvolovych.taghub',
			payload: {message: newMessage.guid}
		});

		// Отправляем уведомления
		apnProvider.send(notification, devices)
			.then((result) => console.log('Уведомление отправлено успешно:', result.failed[0].response))
			.catch((error) => console.error('Ошибка отправки уведомления:', error));
	}
});
