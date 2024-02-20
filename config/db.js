'use strict';

// app packages
const _ = require('lodash');
const ENV = process.env;

module.exports = {
	username: _.get(ENV, 'DATABASE_USERNAME', 'admin'),
	password: _.get(ENV, 'DATABASE_PASSWORD', 'admin'),
	name: _.get(ENV, 'DATABASE_NAME', 'taghub'),
	host: _.get(ENV, 'DATABASE_HOST', 'localhost')
};
