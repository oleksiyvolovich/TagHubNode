'use strict';

// eslint-disable-next-line func-style
const setModels = (mongoose) => {
	const Schema = mongoose.Schema;

	const UserSchema = new Schema({
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },

		device: { id: String, token: String },

		// relations
		channels: [{ type: Schema.Types.ObjectId, ref: 'channel' }],
		createdPosts: [{ type: Schema.Types.ObjectId, ref: 'post' }],
		savedPosts: [{ type: Schema.Types.ObjectId, ref: 'post' }]
	}, { timestamps: true });

	const ChannelSchema = new Schema({
		name: String,
		tags: [String],

		// relations
		createdBy: { type: Schema.Types.ObjectId, ref: 'user' } // user._id
	}, { timestamps: true });

	const PostSchema = new Schema({
		text: String,
		files: [String],
		postedAt: String,

		tags: [String],
		location: new Schema({
			type: {
				type: String,
				enum: ['Point'] // Ensure that the type is 'Point'
			},
			coordinates: {
				type: [Number] // Array of [longitude, latitude]
			}
		}),

		// relations
		createdBy: { type: Schema.Types.ObjectId, ref: 'user' }, // user._id
		comments: [{ type: Schema.Types.ObjectId, ref: 'posts_comments' }]
	}, { timestamps: true });

	const PostCommentSchema = new Schema({
		postId: { type: Schema.Types.ObjectId, ref: 'post', required: true },
		text: String,
		files: [String],
		createdBy: String, // user._id
		postedAt: String
	}, { timestamps: true });

	const ConversationSchema = new Schema({
		members: [String],

		// relations
		messages: [{ type: Schema.Types.ObjectId, ref: 'conversations_messages' }]
	}, { timestamps: true });

	const ConversationMessageSchema = new Schema({
		conversationId: { type: Schema.Types.ObjectId, ref: 'conversation', required: true },
		senderId: String, // user_.id
		text: String
	}, { timestamps: true });

	return {
		user: mongoose.model('user', UserSchema),
		channel: mongoose.model('channel', ChannelSchema),
		post: mongoose.model('post', PostSchema),
		postComments: mongoose.model('posts_comments', PostCommentSchema),
		conversation: mongoose.model('conversation', ConversationSchema),
		conversationMessage: mongoose.model('conversations_messages', ConversationMessageSchema)
	};
};

module.exports = setModels;