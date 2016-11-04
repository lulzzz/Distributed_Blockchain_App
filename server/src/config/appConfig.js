const express = require('express')
	  bodyParser = require('body-parser');

module.exports = function(app){

/*
*	Built-in middleware express.static for making files such as images/css/js accessable
*/
	app.use(express.static('node_modules'));
	
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));

/*
*   Middleware to set request header. Added manually. Next method is called to jump into next middleware function
*/
		app.use(function(req, res, next){
		  res.set('X-Powered-By', 'B-Verify Retail Blockchain Application');
		  next();
		});


// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests

	app.all('/api/*', function(req, res, next) {
	       res.header("Access-Control-Allow-Origin", "*");
	       res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
	       res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	       next();
	});
};