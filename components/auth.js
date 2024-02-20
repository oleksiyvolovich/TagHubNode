'use strict';
// core packages
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('../config');

class Auth {
	constructor(){}

	/**
     * Check user authorized
     *
     * @param {Object} request - The request object
     * @param {Object} response - The response object
     * @param {Function} next - The next function for express.
     * @return {Object} The passport.authenticate object
     */
	checkAuthorize(request, response, next){
		const userId = request.decodedToken && request.decodedToken.user_id || null;
		if(!userId){
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
	generateAuthToken(data){
		return jwt.sign(data, config.jwt.secret, {expiresIn: config.jwt.expiresIn});
	}

	/**
     * Decode User Auth Token
     *
     * @param {Object} request - The request object
     * @param {Object} response - The response object
     * @param {Function} next - The next function for express.
     * @return {Object} The passport.authenticate object
     */
	verifier(request, response, next){
		const token = _.get(request, 'headers.x-access-token', null);
		try{
			request.decodedToken = token ? jwt.decode(token, config.jwt.secret) : {};
			return next();
		}catch(err){
			return response.status(401).send('request unauthorized');
		}
	}
}

module.exports = exports = new Auth();
