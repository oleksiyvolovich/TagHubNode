'use strict';
// app packages

const db = require('../database');
const apn = require('../components/apn');

class MessageController {
	async fetchAll(req, res){
		try{
			const tags = req.query.tags.split(',');

			db.models.message.find({tags: {$regex: new RegExp(tags.join('|'), 'i')}})
				.select('-_id -__v') // исключаем поля _id и __v из выборки
				.then((messages) => {
					if(messages.length > 0){
						const filteredMessages = messages.map((message) => {
							const{_id, ...rest} = message.toObject();
							return {id: _id, ...rest};
						});
						return res.send(filteredMessages);
					}
					return res.status(404).send('No messages found');
				})
				.catch((err) => {
					console.error(err);
					return res.status(500).send('Error searching database');
				});
		}catch(err){
			console.error(err);
			return res.status(400).send('Invalid tags parameter');
		}
	}

	async create(req, res){
		const message = new db.models.message(req.body);

		console.log(message);

		message.save()
			.then(async() => {
				console.log('start searching for users');

				const users = await db.models.userData.find({
					channelModels: {
						$elemMatch: {
							tags: {$in: message.tags}
						}
					}
				});

				console.log('Users' + users);

				// Формируем массив устройств для отправки уведомлений
				const devices = users.map(user => user.additionalData);
				const uniqueDevices = devices.filter((device, index) => {
					return devices.indexOf(device) === index;
				});


				console.log('Devices' + devices);

				for(let i = 0; i < uniqueDevices.length; i++){
					apn.sendPush(message, uniqueDevices[i])
						.then((result) => console.log('Уведомление отправлено успешно:'))
						.catch((error) => console.error('Ошибка отправки уведомления:', error));
				}
				res.send('Message was successfully saved to database');
			})
			.catch((err) => {
				console.log(err);
				return res.status(400).send('Unable to save to database');
			});
	}

	async createPrivate(req, res){
		const chatGuid = req.params.guid;
		const targetUserName = req.params.targetUserName;
		const message = new db.models.message(req.body);

		console.log(message);

		await message.save();

		try{
			// Находим данные пользователя в базе данных
			const userData = await db.models.userData.findOne({username: targetUserName});

			console.log('User data was found = ' + targetUserName);

			if(!userData){
				// Если данных пользователя нет, вернем ошибку
				return res.status(404).json({error: 'User data not found'});
			}

			const existingChat = userData.chats.find(chat => chat.guid === chatGuid);

			if(!existingChat){
				console.log('chat wasn`t found. Create a new chat');
				// Создаем новый чат
				const newChat = {
					guid: chatGuid,
					targetUser: message.author,
					messagesGUIDs: [message.guid]
				};

				console.log(newChat.guid + ' ' + newChat.targetUser);
				userData.chats.push(newChat);
				console.log('push message to targetUserData');
			}else{
				if(!existingChat.messagesGUIDs){
					existingChat.messagesGUIDs = []; // Инициализируем массив, если он null
				}
				existingChat.messagesGUIDs.push(message.guid);
				console.log('message was written to existed chat');
			}

			await userData.save();

			// Возвращаем обновленный объект данных пользователя
			return res.status(200).json(message);
		}catch(err){
			res.status(400).json({error: err.message});
		}
	}

	async update(req, res){
		const id = req.params.id;
		const msg = new db.models.message(req.body);

		console.log(req.body);
		console.log(msg.tags);

		db.models.message.findOneAndUpdate({guid: id}, {tags: msg.tags}, {new: true})
			.then((message) => {
				const{__v, ...rest} = message.toObject();
				console.log(rest);
				console.log('Updated');
				return res.send(rest);
			})
			.catch((err) => {
				console.error(err);
				return res.status(500).send('Error updating message');
			});
	}

	async delete(req, res){
		console.log('delete request');
		const id = req.params.id;
		db.models.message.findOneAndDelete({guid: id})
			.select('-_id -__v') // исключаем поля _id и __v из выборки
			.then((message) => {
				if(message){
					res.send(message);
				}else{
					res.status(404).send('Message not found');
				}
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error deleting message');
			});
	}

	async like(req, res){
		const guids = req.query.guids.split(',');

		console.log(guids);

		try{
			// Используем метод find для поиска сообщений с переданными GUID-ами
			const messages = await db.models.message.find({guid: {$in: guids}});

			return res.status(200).json(messages);
		}catch(error){
			console.error('Ошибка при поиске сообщений:', error);
			return res.status(500).json({error: 'An error occurred while fetching messages.'});
		}
	}
}

module.exports = new MessageController();