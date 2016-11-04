/*
*	Importing required modules in app.js
*/

'use strict';

const express = require('express'),
	path = require('path'),
	log4js = require('log4js'),
    route = require('./src/config/router'),
	app = express(),
	appConfig = require('./src/config/appConfig')(app);

var server = require('./server.js')(app);
var log = log4js.getLogger("app");


app.use(function(req, res, next){
		  res.set('X-Powered-By', 'B-Verify Retail Blockchain Application');
		  next();
		});


//Render landing page
/*app.get('/',function(req, res){
    res.sendFile(__dirname + '/index.html');
});
*/
app.use('/api', route);

/*app.get("*", function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
*/

/*
*	Error Handler. Development error handler.
*/
if (app.get('env') === 'development') {
		  app.use(function(err, req, res, next) {
		  	log.error("unexpected error occur ", err);
		  	console.log(err);
			res.status(err.status || 500);
			res.json({errorMsg: "Currently we are experiencing technical difficulties. Please try after some time."});
		  });
}

