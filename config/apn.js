'use strict';

// app packages
const _ = require('lodash');
const path = require('path');
const filePath = path.join(__dirname, 'AuthKey_2KM5Q88N5G.p8');
const ENV = process.env;

// настройки APNS-сервера
module.exports = {
	options: {
		token: {
			key: filePath,
			keyId: _.get(ENV, 'APN_KEY_ID'),
			teamId: _.get(ENV, 'APN_TEAM_ID')
		},
		// false для sandbox, true для production-режима
		production: _.get(ENV, 'NODE_ENV', 'production') === 'production'
	},
	topic: _.get(ENV, 'APN_TOPIC', 'com.alexeyvolovych.taghub')
};