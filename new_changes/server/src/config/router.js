/*
*	Routing configuration file
*/
'use strict';
var express = require("express"),
    searchCtrl = require("../modules/search/searchController.js"),
    userCtrl = require("../modules/user/userController.js"),
    productCtrl = require("../modules/product/productController.js"),
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
    
router.route('/product/list')
    .get(function(req, res) {
        productCtrl.getProductList(req, res);
    });  
    
router.route('/product/register')
    .post(function(req, res) {
        productCtrl.registerProduct(req, res);
    }); 
router.route('/product/ack')
    .post(function(req, res) {
        productCtrl.acknowledgeProduct(req, res);
    }); 
router.route('/product/ship')
    .post(function(req, res) {
        productCtrl.shipProduct(req, res);
    });
router.route('/product/delete/:id')
    .delete(function(req, res) {
        productCtrl.deleteProduct(req, res);
    });         
    
module.exports = router;