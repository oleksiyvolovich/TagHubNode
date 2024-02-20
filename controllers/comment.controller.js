'use strict';

// app packages
const db = require('../database');

class CommentController {
	async fetchAll(req, res){
		try{
			const comments = await db.models.comment.findOne({messageGUID: req.params.guid}, {_id: 0, __v: 0});
			if(comments){
				return res.status(200).json(comments);
			}
			return res.status(404).json({error: 'Comments not found'});
		}catch(err){
			res.status(400).json({error: err.message});
		}
	}

	async create(req, res){
		const{messageGUID, comments} = req.body;

		console.log(comments);
		try{
			// Проверяем, существует ли запись в базе данных для данного сообщения
			let commentData = await db.models.comment.findOne({messageGUID});

			if(!commentData){
				// Если запись не существует, создаем новый объект комментария и сохраняем его в базе данных
				commentData = new Comment({
					messageGUID,
					comments
				});
				await commentData.save();
			}else{
				// Если запись существует, обновляем ее, добавляя новые комментарии
				commentData.comments.push(...comments);
				await commentData.save();
			}

			res.status(200).json({success: true});
		}catch(err){
			res.status(400).json({error: err.message});
		}
	}
}

module.exports = new CommentController();