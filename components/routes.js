/* eslint new-cap: 0 */
'use strict';

// core packages
const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/auth.controller');
const UserController = require('../controllers/user.controller');
const CommentController = require('../controllers/comment.controller');
const MessageController = require('../controllers/message.controller');

class Routes {
	constructor(app){
		this.app = app;
	}

	init(){
		/** Auth Routes **/
		router.route('/login').post(AuthController.login.bind(AuthController));
		router.route('/register').post(AuthController.register.bind(AuthController));

		/** API Routes **/

		// User controller
		router.route('/updateUserData').post(UserController.update.bind(UserController));

		// Comment controller
		router.route('/comments').post(CommentController.create.bind(CommentController));
		router.route('/comments/:guid').get(CommentController.fetchAll.bind(CommentController));

		// Message controller
		router.route('/messages').get(MessageController.fetchAll.bind(MessageController));
		router.route('/messages').post(MessageController.create.bind(MessageController));
		router.route('/messages/:id').put(MessageController.update.bind(MessageController));
		router.route('/messages/:id').delete(MessageController.delete.bind(MessageController));
		router.route('/likedmessages').get(MessageController.like.bind(MessageController));
		router.route('/privatemessages/:guid/:targetUserName').post(
			MessageController.createPrivate.bind(MessageController)
		);

		this.app.use('', router);
	}
}


module.exports = Routes;