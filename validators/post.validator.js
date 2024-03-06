'use strict';
const { body, param } = require('express-validator');

const postValidator = {
	create: [
		body('text').notEmpty().isString().withMessage('Text is required'),
		body('tags')
			.notEmpty()
			.isArray({ min: 1, max: 10 })
			.withMessage('tags must be an array')
			.custom((value) => {
				if (!value.every(item => typeof item === 'string')) {
					throw new Error('tags elements must be strings');
				}
				return true;
			}).withMessage('Invalid tags data'),
		body('files')
			.isArray({ min: 0, max: 5 })
			.withMessage('files must be an array')
			.custom((value) => {
				if (!value.every(item => typeof item === 'string')) {
					throw new Error('files elements must be strings');
				}
				return true;
			}).withMessage('Invalid files data'),
		body('location')
			.optional()
			.isObject()
			.withMessage('location must be an object')
			.custom((value) => {
				if (!value.lat || !value.lng) {
					throw new Error('lat and lng are required params');
				}
				return true;
			}).withMessage('Invalid location data')
	],
	update: [
		param('id').notEmpty().isString().withMessage('Invalid post ID'),
		body('text').notEmpty().isString().withMessage('Text is required'),
		body('tags')
			.notEmpty()
			.isArray({ min: 1, max: 10 })
			.withMessage('tags must be an array')
			.custom((value) => {
				if (!value.every(item => typeof item === 'string')) {
					throw new Error('tags elements must be strings');
				}
				return true;
			}).withMessage('Invalid tags data')
	],
	delete: [
		param('id').notEmpty().isString().withMessage('Invalid post ID')
	],
	saved: [
		param('id').notEmpty().isString().withMessage('Invalid post ID')
	]
};

module.exports = postValidator;