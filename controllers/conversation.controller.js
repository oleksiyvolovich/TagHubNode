'use strict';
// app packages
const _ = require('lodash');
const db = require('../database');
const Validator = require('../components/validator');

class ConversationController {
	async fetchAll(req, res) {
		const userId = req.user._id;

		const conversations = await db.models.conversation
			.find({ members: { $regex: new RegExp(userId, 'i') } })
			.populate({
				path: 'messages',
				options: { sort: { createdAt: -1 }, limit: 1 }
			})
			.select('-__v');

		return res.status(200).json({ success: true, conversations });
	}

	async fetchOne(req, res) {
		const userId = req.user._id;
		const conversationId = req.params.id;

		const conversation = await db.models.conversation
			.findOne({
				_id: conversationId,
				members: { $regex: new RegExp(userId, 'i') }
			})
			.populate({
				path: 'messages',
				options: { sort: { createdAt: -1 } }
			})
			.select('-__v');

		return res.status(200).json({ success: true, conversation });
	}

	/** Creating a new post **/
	async create(req, res) {
		/** Validate required fields **/
		const { isValid, errors } = Validator.validateFields(req);
		if (!isValid) {
			return res.status(400).json({ errors });
		}

		const userId = req.user._id;
		const { participantId } = req.body;

		const conversation = await db.models.conversation
			.findOne({
				$and: [{ members: userId }, { members: participantId }]
			})
			.populate({
				path: 'messages',
				options: { sort: { createdAt: -1 } }
			})
			.select('-__v');
		if (conversation) {
			return res.status(200).json({ success: true, conversation });
		}

		const created = await db.models.conversation.create({
			members: [userId, participantId],
			messages: []
		});

		return res.status(200).json({
			success: true,
			conversation: _.omit(created._doc, ['__v'])
		});
	}

	// websocket handler.
	async _createMessage(data) {
		const created = await db.models.conversationMessage.create({
			chatId: data.chatId,
			senderId: data.senderId,
			text: data.text
		});

		/** Updating relation field in conversation model **/
		await db.models.conversation.updateOne(
			{ _id: data.chatId },
			{ $push: { messages: created._id } }
		);

		return _.omit(created._doc, ['__v']);
	}
}

module.exports = new ConversationController();