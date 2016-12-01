/*
*   material service to make service calls for material registration/shipment/acknowledge using ngResource
*
*/

'use strict';
angular.module('materialModule')

    // Registering/Retreiving/shipping/acknowledging material
    .value('materialBatchUrl', {
        'registerBatch': 'api/material/register.json',  // TO-DO need to change against WEB API URL
        /****** below needs to be change. Hardcoded for demo */
        'list': 'asset/data/materialList.json', // TO-DO need to change against WEB API URL
        'getMaterial': 'asset/data/material.json',
        'deleteMatbatch': 'asset/data/deleteMaterial.json',   // TO-DO need to change against WEB API URL
        'matBatchEdit': 'rawmaterial/:_id'
    })

    //Configuring resource for making service call
    .service('materialBatchResource', ['$resource', 'materialBatchUrl', '__ENV', 'appConstants', function ($resource, materialBatchUrl, __ENV, appConstants) {

        return $resource('', { _id: '@materialId' }, {
            /****** below needs to be change. Hardcoded for demo */
            materialList: { url: __ENV.apiUrl + materialBatchUrl.list, method: "GET", isArray: "true" },
            /**************************************************************** */
            registerMatBatch: { url: __ENV.apiUrl + materialBatchUrl.registerBatch, method: "POST" },  //  // TO-DO need to change POST
            retreiveMat: { url: __ENV.apiUrl + materialBatchUrl.getMaterial, method: "GET" }, // TO-DO need to change DELETE
            matBatchDelete: { url: __ENV.apiUrl + materialBatchUrl.deleteMatbatch, method: "GET", isArray: "true" }, // TO-DO need to change DELETE
            matBatchEdit: { url: __ENV.apiUrl + materialBatchUrl.editMatbatch, method: "PUT" } // TO-DO need to change DELETE
        });
    }])

    //Making service call 
    .service('batchMaterialService', ['materialBatchResource', 'appConstants', '$q', '$log', function (materialBatchResource, appConstants, $q, $log) {

        this.registerBatchMaterial = function (mat) {
            var req = populateBatchHexRequest(mat);
            var deferred = $q.defer();
            try {
                materialBatchResource
                    .registerMatBatch(req)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };

        /****** below needs to be change. Hardcoded for demo */
        this.getMaterial = function (req) {
            var deferred = $q.defer();
            try {
                materialBatchResource
                    .retreiveMat(req)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };


        /****** below needs to be change. Hardcoded for demo */
        this.getMaterialList = function (req) {
            var deferred = $q.defer();
            try {
                materialBatchResource
                    .materialList(req)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };

        this.deleteMaterialBatch = function (req) {
            var deferred = $q.defer();
            try {
                materialBatchResource
                    .matBatchDelete(req)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };

        this.editMaterialBatch = function (req) {
            var deferred = $q.defer();
            try {
                materialBatchResource
                    .matBatchEdit(req)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };

        function populateBatchHexRequest(mat) {
            return {
                rawmaterial: mat.id,
                quantity: parseInt(mat.quantity),
                regDate: PARSER.parseStrDate(new Date())
            }
        }
    }]);