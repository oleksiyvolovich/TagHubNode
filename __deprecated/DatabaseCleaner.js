'use strict';

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/taghub', {useNewUrlParser: true, useUnifiedTopology: true})
	.then(() => {
		console.log('MongoDB connected');
		// Здесь происходит очистка базы данных
		return mongoose.connection.dropDatabase();
	})
	.then(() => {
		console.log('Database cleared');
		// Закрываем соединение с базой данных после очистки (опционально)
		return mongoose.connection.close();
	})
	.then(() => console.log('Connection closed'))
	.catch((err) => console.error(err));
