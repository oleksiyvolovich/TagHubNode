'use strict';
const { body, param } = require('express-validator');

const commentValidator = {
	fetchAll: [
		param('id').notEmpty().isString().withMessage('Invalid post ID')
	],
	create: [
		param('id').notEmpty().isString().withMessage('Invalid post ID'),

		body('text').notEmpty().isString().withMessage('Text is required'),
		body('files').optional().isString().withMessage('Files is required')
	],
	update: [
		param('id').notEmpty().isString().withMessage('Invalid post ID'),
		param('commentId').notEmpty().isString().withMessage('Invalid comment ID'),

		body('text').notEmpty().isString().withMessage('Text is required'),
		body('files').optional().isString().withMessage('Files is required')
	],
	delete: [
		param('id').notEmpty().isString().withMessage('Invalid post ID'),
		param('commentId').notEmpty().isString().withMessage('Invalid comment ID')
	]
};

module.exports = commentValidator;