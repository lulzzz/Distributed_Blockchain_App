/*
*   material service to make service calls for material registration/shipment/acknowledge using ngResource
*
*/

'use strict';
angular.module('materialModule')

    // Registering/Retreiving/shipping/acknowledging material
    .value('shipMaterialUrl', {
        'list': 'asset/data/materialList.json', // TO-DO need to change against WEB API URL
        'ship': 'shipment',  // TO-DO need to change against WEB API URL
        /****** below needs to be change. Hardcoded for demo */
        'getMaterial': 'asset/data/material.json',
        'manufacturerList': 'asset/data/manufacturerList.json' // TO-DO need to change against WEB API URL
    })

    //Configuring resource for making service call
    .service('shipMaterialResource', ['$resource', 'shipMaterialUrl', '__ENV', 'appConstants', function ($resource, shipMaterialUrl, __ENV, appConstants) {

        return $resource('', {_id: '@id'}, {
            /****** below needs to be change. Hardcoded for demo */
            materialList: { url: __ENV.apiUrl + shipMaterialUrl.list, method: "GET", isArray: "true" },
            /**************************************************************** */
            shipMat: { url: 'http://35.164.15.146:8082/' + shipMaterialUrl.ship, method: "POST" },   // TO-DO need to change POST
            /****** below needs to be change. Hardcoded for demo */
            retreiveMat: { url: __ENV.apiUrl + shipMaterialUrl.getMaterial, method: "GET"}, // TO-DO need to change DELETE
            manufacturerList: { url: __ENV.apiUrl + shipMaterialUrl.manufacturerList, method: "GET", isArray: "true"}
        });
    }])

    //Making service call 
    .service('shipMaterialService', ['shipMaterialResource', 'appConstants', '$q', '$log', function (shipMaterialResource, appConstants, $q, $log) {

        /****** below needs to be change. Hardcoded for demo */
        this.getMaterialList = function (req) {
            var deferred = $q.defer();
            try{
                shipMaterialResource
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
                shipMaterialResource
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


         this.shipMaterial = function (mat) {
            var req = getMatShipHexRequest(mat);
            var deferred = $q.defer();
            try{
                shipMaterialResource
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
        
         this.getManufacturerList = function (req) {
            var deferred = $q.defer();
            try{
                shipMaterialResource
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

        function getMatShipHexRequest(mat) {
            return {
                carrier: CONVERTER.strTohex(mat.carrier),
                type: 0, // for raw material shipment
                item: mat.batchNumber,
                quantity: parseInt(mat.quantity)
            }
        };
       
    }]);