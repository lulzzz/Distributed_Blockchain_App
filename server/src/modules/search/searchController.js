/*
*	
*/
'use strict';

const log4js = require('log4js'),
      log = log4js.getLogger("searchController"),
      path = require('path');

exports.getShipmentDetails = function(reqObject, resObject) {
    log.debug("******get shipment details******", reqObject.body);
    

    try{        
    			var shipmentDetails = {
    				name : "leather",
    				batchNumber : 'B00RWSC2MW',
    				weight : '100kg',
    				quantity : '100',
    				manufactureDate : '10/10/2010',
    				currentlyAt : 'DTDC'
    			}
                resObject.json(shipmentDetails);
    }catch(err){
        log.error("Error occurred while search shipment details", err);
        resObject.json({errMsg : constants.SERVICE_ERROR});
    }
};