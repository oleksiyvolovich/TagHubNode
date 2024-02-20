'use strict';

// Core Packages
const cors = require('cors');

class Cors {
	/**
     * Constructor delegates cors options on request.
     *
     */
	constructor(){
		// init
		const self = this;

		self.corsOptions = {
			credentials: true,
			origin: true
		};

		return cors((request, callback) => {
			// callback expects two parameters: error and options
			callback(null, self.corsOptions);
		});
	}
}

module.exports = new Cors();
