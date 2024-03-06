'use strict';

// core packages
const _ = require('lodash');
const mongoose = require('mongoose');

const config = require('../config');
const setModels = require('./models');

class Database {
	constructor() {
		this.init().then((db) => {
			/** Setting DB instance **/
			this.db = db;
		}).then(() => {
			/** Setting models instances **/
			this.models = setModels(this.db);
		});
	}

	async init() {
		try {
			if (_.isNil(this.connection)) {
				this.connection = await mongoose.connect(`mongodb://${config.db.host}/${config.db.name}`);
			}
			return this.connection;
		}catch (error) {
			console.log(`DATABASE CONNECTION ERROR: ${error}`);
		}
	}
}


// export the class as a singleton
module.exports = new Database();