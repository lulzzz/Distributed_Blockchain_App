/*
*   material service to make service calls for material registration/shipment/acknowledge using ngResource
*
*/

'use strict';
angular.module('materialModule')

    // Registering/Retreiving/shipping/acknowledging material
    .value('materialUrl', {
        'register': 'api/material/register.json',  // TO-DO need to change against WEB API URL
        /****** below needs to be change. Hardcoded for demo */
        'list': 'asset/data/materialList.json', // TO-DO need to change against WEB API URL
        'ship': 'asset/data/register.json',  // TO-DO need to change against WEB API URL
        'procure': 'asset/data/register.json',   // TO-DO need to change against WEB API URL
        /****** below needs to be change. Hardcoded for demo */
        'deleteMat': 'asset/data/deleteMaterial.json',   // TO-DO need to change against WEB API URL
        'upload': 'api/material/upload',
        'getMaterial': 'asset/data/material.json',
        'manufacturerList': 'asset/data/manufacturerList.json' // TO-DO need to change against WEB API URL
    })

    //Configuring resource for making service call
    .service('materialResource', ['$resource', 'materialUrl', '__ENV', 'appConstants', function ($resource, materialUrl, __ENV, appConstants) {

        return $resource('', {_id: '@materialId'}, {
            /****** below needs to be change. Hardcoded for demo */
            materialList: { url: __ENV.apiUrl + materialUrl.list, method: "GET", isArray: "true" },
            /**************************************************************** */
            registerMat: { url: __ENV.apiUrl + materialUrl.register, method: "POST"},  //  // TO-DO need to change POST
            shipMat: { url: __ENV.apiUrl + materialUrl.ship, method: "GET" },   // TO-DO need to change POST
            procureMat: { url: __ENV.apiUrl + materialUrl.procure, method: "GET" },  // TO-DO need to change POST
            /****** below needs to be change. Hardcoded for demo */
            matDelete: { url: __ENV.apiUrl + materialUrl.deleteMat, method: "GET", isArray: "true" }, // TO-DO need to change DELETE
            fileUpload: { url: __ENV.apiUrl + materialUrl.upload, method: "POST", isArray: "true", transformRequest: appConstants.HEADER_CONFIG.transformRequest, headers: appConstants.HEADER_CONFIG.headers }, // TO-DO need to change DELETE
            retreiveMat: { url: __ENV.apiUrl + materialUrl.getMaterial, method: "GET"}, // TO-DO need to change DELETE
            manufacturerList: { url: __ENV.apiUrl + materialUrl.manufacturerList, method: "GET", isArray: "true"}
        });
    }])

    //Making service call 
    .service('materialService', ['materialResource', 'appConstants', '$q', '$log', function (materialResource, appConstants, $q, $log) {
        
        this.registerMaterial = function (req) {
             
            var deferred = $q.defer();
            try{
                materialResource
                    .registerMat(req)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };


        /****** below needs to be change. Hardcoded for demo */
        this.getMaterialList = function (req) {
            var deferred = $q.defer();
            try{
                materialResource
                    .materialList(req)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };

         /****** below needs to be change. Hardcoded for demo */
        this.getMaterial = function (req) {
            var deferred = $q.defer();
            try{
                materialResource
                    .retreiveMat(req)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };


         this.shipMaterial = function (req) {
            var deferred = $q.defer();
            try{
                materialResource
                    .shipMat(req)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
        this.procureMaterial = function (list) {
            var deferred = $q.defer();
            try{
                materialResource
                    .procureMat(list)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
        
        this.deleteMaterial = function (req) {
            var deferred = $q.defer();
            try{
                materialResource
                    .matDelete(req)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };

        
        this.uploadFile = function (req) {
            var deferred = $q.defer();
            try{
                materialResource
                    .fileUpload(req)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };

         this.getManufacturerList = function (req) {
            var deferred = $q.defer();
            try{
                materialResource
                    .manufacturerList(req)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
       
    }]);