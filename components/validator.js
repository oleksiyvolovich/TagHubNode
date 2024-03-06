'use strict';
// core packages
const { validationResult } = require('express-validator');

const validateFields = (req) => {
	const results = validationResult(req).mapped();

	const errors = {};
	for (const i in results) {
		const item = results[i];
		errors[i] = item.msg;
	}

	return { isValid: !Object.keys(errors).length, errors };
};

module.exports = {
	validateFields
};