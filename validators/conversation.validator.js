'use strict';
const { body, param } = require('express-validator');

const commentValidator = {
	fetchOne: [
		param('id').notEmpty().isString().withMessage('Invalid conversation ID')
	],
	create: [
		body('text').notEmpty().isString().withMessage('Text is required'),
		body('memberId').notEmpty().isString().withMessage('Member ID is required')
	]
};

module.exports = commentValidator;