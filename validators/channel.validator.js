'use strict';
const { body, param } = require('express-validator');

const channelValidator = {
	create: [
		body('name').notEmpty().isString().withMessage('Name is required'),
		body('tags')
			.notEmpty()
			.isArray({ min: 1, max: 10 })
			.withMessage('myArray must be an array')
			.custom((value) => {
				if (!value.every(item => typeof item === 'string')) {
					throw new Error('myArray elements must be strings');
				}
				return true;
			}).withMessage('Invalid tags data')
	],
	delete: [
		param('id').notEmpty().isString().withMessage('Invalid channel ID')
	]
};

module.exports = channelValidator;