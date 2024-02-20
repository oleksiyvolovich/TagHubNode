'use strict';
// app packages
const bcrypt = require('bcrypt');
const db = require('../database');

class AuthController {
	async login(req, res){
		const{username, password} = req.body;

		try{
			// Проверяем, существует ли пользователь в базе данных
			const user = await db.models.user.findOne({username});
			if(!user){
				return res.status(401).json({error: 'Incorrect username or password'});
			}

			console.log(user);

			// Проверяем, соответствует ли пароль
			const validPassword = await bcrypt.compare(password, user.password);
			if(!validPassword){
				return res.status(401).json({error: 'Incorrect username or password'});
			}

			// Ищем данные пользователя в базе данных
			const userData = await db.models.userData.findOne({username}, {_id: 0, __v: 0});
			if(!userData){
				// Если данных пользователя нет, создаем новый объект данных пользователя
				const newUserData = new db.models.userData({
					username: user.username,
					likedMessagesGUIDS: [],
					channelModels: [],
					postedMessagesGUIDS: [],
					additionalData: []
				});
				await newUserData.save();

				// Возвращаем новый объект данных пользователя
				return res.status(200).json(newUserData);
			}

			// Если данные пользователя уже существуют, возвращаем их
			return res.status(200).json(userData);
		}catch(err){
			res.status(400).json({error: err.message});
		}
	}

	async register(req, res){
		const{username, password} = req.body;

		try{
			const user = await db.models.user.create({
				username,
				password: bcrypt.hashSync(password, 10)
			});

			const newUserData = new db.models.userData({
				username: username,
				likedMessagesGUIDS: [],
				channelModels: [],
				postedMessagesGUIDS: [],
				additionalData: []
			});
			await newUserData.save();

			console.log('registration success for user ' + username);

			return res.status(201).json({success: true, user});
		}catch(err){
			console.log('registration failed');
			return res.status(400).json({error: err.message});
		}
	}
}

module.exports = new AuthController();