/*
*	app.js for initializing angular module container.
*   Defining routes, value and rootscope.
*/

'use strict';


// All application related routing and authentication has been wrapped up inside 'appRoute' module
// All application related constants, provider, interceptors, error handling and CORS has been wrapped up inside 'appConfig' module
angular.module('bverifyApp', ['appRoute', 'appConfig', 'materialModule', 'searchModule', 'userModule', 'dashboardModule']);