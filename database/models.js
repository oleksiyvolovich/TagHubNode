'use strict';

// eslint-disable-next-line func-style
const setModels = (mongoose) => {
	/** Chat && Channel && Messages **/
	const chatSchema = new mongoose.Schema({
		guid: String,
		targetUser: String,
		messagesGUIDs: [String]
	});
	const channelSchema = new mongoose.Schema({
		name: String,
		tags: [String]
	});
	const messageSchema = new mongoose.Schema({
		mediaFiles: [String],
		guid: String,
		text: String,
		author: String,
		creationTime: String,
		tags: [String]
	});

	/** User && User Data **/
	const TagHubUserSchema = new mongoose.Schema({
		username: {type: String, required: true, unique: true},
		password: {type: String, required: true}
	});
	const TagHubUserDataSchema = new mongoose.Schema({
		username: {type: String, required: true, unique: true},
		likedMessagesGUIDS: [String],
		channelModels: [channelSchema],
		postedMessagesGUIDS: [String],
		additionalData: [String],
		chats: [chatSchema]
	});

	/** Comment && Log **/
	const commentSchema = new mongoose.Schema({
		messageGUID: {type: String, required: true},
		comments: [messageSchema]
	});
	const logSchema = new mongoose.Schema({
		message: String
	});

	return {
		user: mongoose.model('TagHubUser', TagHubUserSchema),
		userData: mongoose.model('TagHubUserData', TagHubUserDataSchema),
		message: mongoose.model('Message', messageSchema),
		comment: mongoose.model('Comment', commentSchema),
		channel: mongoose.model('Channel', channelSchema),
		log: mongoose.model('LogModel', logSchema),
		chat: mongoose.model('ChatModel', chatSchema)
	};
};

module.exports = setModels;