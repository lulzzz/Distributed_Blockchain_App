/*
*	Importing required modules in app.js
*/

'use strict';

const express = require('express'),
	bodyParser = require('body-parser'),
	productCtrl = require('./server/controller/productController'),
	multer  = require('multer'),
    autoReap  = require('multer-autoreap'),
	app = express();

const dest = './src/asset/images/';
app.use(autoReap);


/*
*	Configuring multer for acessing form data and file name/upload in a specific destination.
*/
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dest)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() +'_'+ file.originalname)
  }
});

var upload = multer({ storage: storage });

/*
*   Middleware to set request header. Added manually. Next method is called to jump into next middleware function
*/
		app.use(function(req, res, next){
		  res.set('X-Powered-By', 'B-Verify Retail Blockchain Application');
		  next();
		});

/*
*	Built-in middleware express.static for making files such as images/css/js accessable
*/
    app.use(express.static('./'));
    app.use(express.static('src'));
	app.use(express.static('node_modules'));

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));

//Render landing page
app.get("*", function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/api/material/upload', upload.single('file'), productCtrl.uploadFile);
app.post('/api/material/register.json', productCtrl.registerMaterial);
app.post('/api/product/register.json', productCtrl.registerProduct);

/**
 * Get port from environment and store in Express.
 */
var port = process.env.PORT || '8080';
app.listen(port, function(){
    console.log("\n Angular Client is running on port ", 8080);
});

/*
*	Error Handler. Development error handler.
*/
if (app.get('env') === 'development') {
		  app.use(function(err, req, res, next) {
		  	console.log(err);
			res.status(err.status || 500);
			res.json({errorMsg: "Currently we are experiencing technical difficulties. Please try after some time."});
		  });
}

