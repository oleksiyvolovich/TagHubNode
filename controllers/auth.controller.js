'use strict';

// app packages
const _ = require('lodash');
const bcrypt = require('bcrypt');
const db = require('../database');
const Auth = require('../components/auth');
const Validator = require('../components/validator');

class AuthController {
	async login(req, res) {
		const { isValid, errors } = Validator.validateFields(req);
		if (!isValid) {
			return res.status(400).json(errors);
		}

		const { email, password } = req.body;

		try {
			// Checking if the user exists
			const user = await db.models.user
				.findOne({ email })
				.select('-device -__v -email')
				.populate('channels');
			if (!user) {
				return res.status(400).json({ errors: ['Wrong Credentials'] });
			}

			// Checking and comparing password
			const isValidPassword = await bcrypt.compare(password, user.password);
			if (!isValidPassword) {
				return res.status(400).json({ errors: ['Wrong Credentials'] });
			}

			// Generating auth token
			const token = Auth.generateAuthToken({ userId: user.id });
			const response = _.omit(user._doc, ['password', '__v', '_id']);

			return res.status(200).json({ token, user: response });
		}catch (err) {
			res.status(400).json({ error: err.message });
		}
	}

	async register(req, res) {
		const { email, password } = req.body;

		/** Validate required fields **/
		const { isValid, errors } = Validator.validateFields(req);
		if (!isValid) {
			return res.status(400).json({ errors });
		}

		const isExisted = await db.models.user.findOne({ email });
		if (isExisted) {
			return res.status(400).json({ errors: { email: 'User with such email already exist' } });
		}

		try {
			const user = await db.models.user.create({
				email,
				password: bcrypt.hashSync(password, 10),

				channels: [],
				createdPostsGUIDS: [],
				savedMessagesGUIDS: []
			});

			const response = _.omit(user._doc, ['password', '__v', '_id']);
			return res.status(201).json({ success: true, user: response });
		}catch (err) {
			return res.status(400).json({ errors: [err.message] });
		}
	}
}

module.exports = new AuthController();