'use strict';
const { body } = require('express-validator');

const authValidator = {
	login: [
		body('email').isEmail().withMessage('Invalid email address'),
		body('password')
			.isString()
			.isLength({ min: 6 })
			.withMessage('Password must be at least 6 characters long')
	],
	register: [
		body('email').isEmail().withMessage('Invalid email address'),
		body('password')
			.isString()
			.isLength({ min: 6 })
			.withMessage('Password must be at least 6 characters long')
	]
};

module.exports = authValidator;