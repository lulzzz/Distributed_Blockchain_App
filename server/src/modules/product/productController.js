/*
*	
*/
'use strict';

const log4js = require('log4js'),
      log = log4js.getLogger("productController"),
      path = require('path');

exports.getProductList = function(reqObject, resObject) {
    log.debug("******get Product List ******", reqObject.body);

    try{        
        var list = [];
        for(var i = 0; i<= 10; i++){
            list.push({
                    materialName : "",
                    productName : "Handbag" + i,
    				batchNumber : 'B00RWSC2MW' + i,
    				weight : '100kg',
    				quantity : '200',
    				manufactureDate : '10/10/2010',
                    registeredDate : '10/09/2010',
    				trackDetails : {
                        currentlyAt : 'DTDC',
                        trackRecord : []
                    },
                    shippedOn: '10/10/2011',
                    shippedFrom: 'Producer 1'
            });
        };

        resObject.json(list);
    }catch(err){
        log.error("Error occurred while retreiving product list", err);
        resObject.json({errMsg : constants.SERVICE_ERROR});
    }
};

exports.registerProduct = function(reqObject, resObject) {
    log.debug("******registering product ******", reqObject.body);

    try{        
       
        resObject.json(reqObject.body);
    }catch(err){
        log.error("Error occurred while registering product", err);
        resObject.json({errMsg : constants.SERVICE_ERROR});
    }
};

exports.acknowledgeProduct = function(reqObject, resObject) {
    log.debug("******acknowledge product ******", reqObject.body);

    try{        
       
        resObject.json(reqObject.body);
    }catch(err){
        log.error("Error occurred while acknowleding product", err);
        resObject.json({errMsg : constants.SERVICE_ERROR});
    }
};

exports.shipProduct = function(reqObject, resObject) {
    log.debug("******acknowledge product ******", reqObject.body);

    try{        
       
        resObject.json(reqObject.body);
    }catch(err){
        log.error("Error occurred while acknowleding product", err);
        resObject.json({errMsg : constants.SERVICE_ERROR});
    }
};