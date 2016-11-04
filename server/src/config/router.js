/*
*	Routing configuration file
*/
'use strict';
var express = require("express"),
    searchCtrl = require("../modules/search/searchController.js"),
    userCtrl = require("../modules/user/userController.js"),
    router = express.Router();

router.route('/track')
    .get(function(req, res) {
        searchCtrl.getShipmentDetails(req, res);
    });

router.route('/login')
    .post(function(req, res) {
        userCtrl.doLogin(req, res);
    });

router.route('/register')
    .post(function(req, res) {
        userCtrl.doRegistration(req, res);
    });    
    
module.exports = router;