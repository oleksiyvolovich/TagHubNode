/* eslint new-cap: 0 */
'use strict';

// core packages
const express = require('express');
const router = express.Router();

// app packages
const Auth = require('../components/auth');

// controllers
const AuthController = require('../controllers/auth.controller');
const UserController = require('../controllers/user.controller');
const CommentController = require('../controllers/comment.controller');
const PostController = require('../controllers/post.controller');
const ChannelController = require('../controllers/channel.controller');
const ConversationController = require('../controllers/conversation.controller');

// Validators
const AuthValidator = require('../validators/auth.validator');
const ChannelValidator = require('../validators/channel.validator');
const PostValidator = require('../validators/post.validator');
const CommentValidator = require('../validators/comment.validator');
const ConversationValidator = require('../validators/conversation.validator');

class Routes {
	constructor(app) {
		this.app = app;
	}

	init() {
		/** Auth Routes **/
		router.route('/login').post(AuthValidator.login, AuthController.login.bind(AuthController));
		router.route('/register').post(AuthValidator.register, AuthController.register.bind(AuthController));

		/** API Routes **/

		// User controller
		router.route('/user').put(UserController.update.bind(UserController)); // TODO update user info

		// Channel controller
		router.route('/channel').get(Auth.checkAuthorize, ChannelController.fetchAll.bind(ChannelController));
		router.route('/channel').post(
			Auth.checkAuthorize,
			ChannelValidator.create,
			ChannelController.create.bind(ChannelController)
		);
		router.route('/channel/:id').delete(
			ChannelValidator.delete,
			ChannelController.delete.bind(ChannelController)
		);

		// Post controller
		router.route('/post').get(Auth.checkAuthorize, PostController.fetchAll.bind(PostController));
		router.route('/post').post(
			Auth.checkAuthorize,
			PostValidator.create,
			PostController.create.bind(PostController)
		);
		router.route('/post/:id').put(
			Auth.checkAuthorize,
			PostValidator.update,
			PostController.update.bind(PostController)
		);
		router.route('/post/:id').delete(
			Auth.checkAuthorize,
			PostValidator.delete,
			PostController.delete.bind(PostController)
		);

		router.route('/post/saved').get(
			Auth.checkAuthorize,
			PostController.fetchAllSaved.bind(PostController)
		);
		router.route('/post/:id/saved').put(
			Auth.checkAuthorize,
			PostValidator.saved,
			PostController.save.bind(PostController)
		);
		router.route('/post/:id/saved').delete(
			Auth.checkAuthorize,
			PostValidator.saved,
			PostController.unsave.bind(PostController)
		);

		router.route('/post/:id/comments').get(
			Auth.checkAuthorize,
			CommentValidator.fetchAll,
			CommentController.fetchAll.bind(CommentController)
		);
		router.route('/post/:id/comments').post(
			Auth.checkAuthorize,
			CommentValidator.create,
			CommentController.create.bind(CommentController)
		);
		router.route('/post/:id/comments/:commentId').put(
			Auth.checkAuthorize,
			CommentValidator.update,
			CommentController.update.bind(CommentController)
		);
		router.route('/post/:id/comments/:commentId').delete(
			Auth.checkAuthorize,
			CommentValidator.delete,
			CommentController.delete.bind(CommentController)
		);

		// Conversation Controller
		router.route('/conversation/').get(
			Auth.checkAuthorize,
			ConversationController.fetchAll.bind(ConversationController)
		);

		router.route('/conversation').post(
			Auth.checkAuthorize,
			ConversationValidator.create,
			ConversationController.create.bind(ConversationController)
		);

		router.route('/conversation/:id').get(
			Auth.checkAuthorize,
			ConversationValidator.fetchOne,
			ConversationController.fetchOne.bind(ConversationController)
		);

		this.app.use('', router);
	}
}


module.exports = Routes;