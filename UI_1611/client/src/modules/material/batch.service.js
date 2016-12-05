/*
 *   material service to make service calls for material registration/shipment/acknowledge using ngResource
 *
 */

'use strict';
angular.module('materialModule')

// Registering/Retreiving/shipping/acknowledging material
.value('materialBatchUrl', {
    'registerBatch': 'rawmaterial/batch', // TO-DO need to change against WEB API URL
    /****** below needs to be change. Hardcoded for demo */
    'list': 'rawmaterial/list/:page', // TO-DO need to change against WEB API URL
    'deleteMatbatch': 'asset/data/deleteMaterial.json', // TO-DO need to change against WEB API URL
    'update': 'rawmaterial/batch/',
    'retreive': 'rawmaterial/:id',
    'rmList': 'rawmaterial/list/rm/all'
})

//Configuring resource for making service call
.service('materialBatchResource', ['$resource', 'materialBatchUrl', '__ENV', 'appConstants', function ($resource, materialBatchUrl, __ENV, appConstants) {

    return $resource('', {
        id: '@id',
        page: '@page'
    }, {
        /****** below needs to be change. Hardcoded for demo */
        materialList: {
            url: 'http://35.164.15.146:8082/' + materialBatchUrl.list,
            method: "GET"
        },
        /**************************************************************** */
        registerMatBatch: {
            url: 'http://35.164.15.146:8082/' + materialBatchUrl.registerBatch,
            method: "POST"
        }, //  // TO-DO need to change POST
        retreiveMat: {
            url: 'http://35.164.15.146:8082/' + materialBatchUrl.retreive,
            method: "GET",
            isArray: "true"
        }, // TO-DO need to change DELETE
        matBatchDelete: {
            url: __ENV.apiUrl + materialBatchUrl.deleteMatbatch,
            method: "GET",
            isArray: "true"
        }, // TO-DO need to change DELETE
        matBatchUpdate: {
            url: 'http://35.164.15.146:8082/' + materialBatchUrl.update,
            method: "PUT"
        }, // TO-DO need to change DELETE
        rmList: {
            url: 'http://35.164.15.146:8082/' + materialBatchUrl.rmList,
            method: "GET"
        },
    });
}])

//Making service call 
.service('batchMaterialService', ['materialBatchResource', 'appConstants', '$q', '$log', 'materialBatchUrl', '$http', function (materialBatchResource, appConstants, $q, $log, materialBatchUrl, $http) {

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
                .retreiveMat({
                    id: req.id
                })
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
                .materialList({
                    page: req.page
                })
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
    this.getRMList = function (req) {
        var deferred = $q.defer();
        try {
            materialBatchResource
                .rmList()
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

    this.updateMaterialBatch = function (req) {
        var deferred = $q.defer();
        try {
            var url = 'http://35.164.15.146:8082/' + materialBatchUrl.update + req.id;
            delete req['id'];
            $http.put(url, req)
                .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject(appConstants.FUNCTIONAL_ERR);
                    });
        } catch (e) {
            $log.error(appConstants.FUNCTIONAL_ERR, e);
        }
        return deferred.promise;
    };

    function populateBatchHexRequest(mat) {
        return {
            rawmaterial: parseInt(mat.rawmaterial),
            quantity: parseInt(mat.quantity),
            regDate: PARSER.parseStrDate(new Date())
        }
    }
}]);