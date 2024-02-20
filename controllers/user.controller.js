'use strict';
// app packages

const db = require('../database');

class UserController {
	async update(req, res){
		const{username, likedMessagesGUIDS, postedMessagesGUIDS, channelModels, additionalData, chats} = req.body;

		try{
			// Находим данные пользователя в базе данных
			const userData = await db.models.userData.findOne({username});
			if(!userData){
				// Если данных пользователя нет, вернем ошибку
				return res.status(404).json({error: 'User data not found'});
			}

			// Обновляем поля данных пользователя
			userData.likedMessagesGUIDS = likedMessagesGUIDS;
			userData.postedMessagesGUIDS = postedMessagesGUIDS;
			userData.channelModels = channelModels;
			userData.additionalData = additionalData;
			userData.chats = chats;
			await userData.save();

			// Возвращаем обновленный объект данных пользователя
			return res.status(200).json(userData);
		}catch(err){
			return res.status(400).json({error: err.message});
		}
	}
}

module.exports = new UserController();