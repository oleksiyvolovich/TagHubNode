'use strict';
// core packages
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../database');

class Auth {
	constructor() {}

	/**
     * Check user authorized
     *
     * @param {Object} request - The request object
     * @param {Object} response - The response object
     * @param {Function} next - The next function for express.
     * @return {Object} The passport.authenticate object
     */
	checkAuthorize(request, response, next) {
		const userId = request.user && request.user._id || null;
		if (!userId) {
			return response.status(401).send('request unauthorized');
		}
		return next();
	}

	/**
	 * Generate User Auth Token
	 *
	 * @param {Object} data - data for the generate jwt auth token
	 * @return {String} JWT Auth Token
	 */
	generateAuthToken(data) {
		return jwt.sign(data, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
	}

	/**
     * Decode User Auth Token
     *
     * @param {Object} request - The request object
     * @param {Object} response - The response object
     * @param {Function} next - The next function for express.
     * @return {Object} The passport.authenticate object
     */
	async verifier(request, response, next) {
		const token = _.get(request, 'headers.x-access-token', null);
		try {
			const verified = token ? jwt.decode(token, config.jwt.secret) : {};
			const user = await db.models.user.findOne({ _id: verified.userId });
			if (user) {
				request.user = _.omit(user._doc, ['password', '__v']);
			}
			return next();
		}catch (err) {
			return response.status(401).send('request unauthorized 11');
		}
	}
}

module.exports = exports = new Auth();
