/*
*	
*/
'use strict';

const log4js = require('log4js'),
      log = log4js.getLogger("userController"),
      path = require('path');

exports.doLogin = function(reqObject, resObject) {
    log.debug("******do login******", reqObject.body);
    var r = reqObject.body;
    

    try{        
    			var admin = {
                    userName : "Admin_User",
                    isAuthenticatedUser : true,
                    certification : 'B00RWSC2MW',
                    consortium : {
                        id : '',
                        name : ''    
                    },
                    userProfile : {
                        id : 'ADMIN',
                        profile : 'admin'
                    },
                    password : reqObject.password
                };
                var producer = {
                    userName : "Raw Material Producer",
                    isAuthenticatedUser : true,
                    certification : 'B00RWSC2MW',
                    consortium : {
                        id : '',
                        name : ''    
                    },
                    userProfile : {
                        id : 'PROD',
                        profile : 'producer'
                    },
                    password : reqObject.password
                };
                var manufact = {
                    userName : "Manufacturer",
                    isAuthenticatedUser : true,
                    certification : 'B00RWSC2MW',
                    consortium : {
                        id : '',
                        name : ''    
                    },
                    userProfile : {
                        id : 'MANUFACT',
                        profile : 'manufacturer'
                    },
                    password : reqObject.password
                };
                var retail = {
                    userName : "Retailer",
                    isAuthenticatedUser : true,
                    certification : 'B00RWSC2MW',
                    consortium : {
                        id : '',
                        name : ''    
                    },
                    userProfile : {
                        id : 'RETAIL',
                        profile : 'retailer'
                    },
                    password : reqObject.password
                };
                
                resObject.json({user: r.id === 'retailer' ? retail : r.id === 'admin' ? admin : 
                                r.id === 'manufacturer' ? manufact : r.id === 'producer' ? producer : producer});
   
    }catch(err){
        log.error("Error occurred while authenticating user", err);
        resObject.json({errMsg : constants.SERVICE_ERROR});
    }
};

exports.doRegistration = function(reqObject, resObject) {
    log.debug("******do registering******", reqObject.body);
    

    try{        
                var user = {
                    userName : "Abc1234",
                    isAuthenticatedUser : true,
                    certification : 'B00RWSC2MW',
                    consortium : {
                        id : '',
                        name : ''    
                    },
                    userProfile : {
                        id : 'PROD',
                        profile : 'producer'
                    },
                    password : reqObject.password
                }
                resObject.json({user: user});
   
    }catch(err){
        log.error("Error occurred while registering user", err);
        resObject.json({errMsg : constants.SERVICE_ERROR});
    }
};