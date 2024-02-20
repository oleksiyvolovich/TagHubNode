'use strict';

const express = require('express');
const app = express();

// ... ваш код для определения маршрутов ...

// получаем список маршрутов
const routes = app._router.stack
	.filter((r) => r.route)
	.map((r) => {
		return {
			method: Object.keys(r.route.methods)[0].toUpperCase(),
			path: r.route.path
		};
	});

console.log(routes);
