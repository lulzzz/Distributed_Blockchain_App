/*
 *   material service to make service calls for material registration/shipment/acknowledge using ngResource
 *
 */

'use strict';
angular.module('materialModule')

// Registering/Retreiving/shipping/acknowledging material
.value('shipMaterialUrl', {
    'materialList': 'rawmaterial/list/rmbatch/all',
    'ship': 'shipment',
    'materialRetreive': 'rawmaterial/:id',
    'batchMaterialRetreive': 'rawmaterial/batch/:id',
    'manufacturerList': 'asset/data/manufacturerList.json'
})

//Configuring resource for making service call
.service('shipMaterialResource', ['$resource', 'shipMaterialUrl', '__ENV', 'appConstants', function ($resource, shipMaterialUrl, __ENV, appConstants) {

    return $resource('', {
        id: '@id',
        page: '@page'
    }, {
        materialList: {
            url: 'http://35.164.15.146:8082/' + shipMaterialUrl.materialList,
            method: "GET"
        },
        shipMat: {
            url: 'http://35.164.15.146:8082/' + shipMaterialUrl.ship,
            method: "POST"
        }, 
        retreiveMat: {
            url: 'http://35.164.15.146:8082/' + shipMaterialUrl.materialRetreive,
            method: "GET"
        }, 
         retreiveBatchMat: {
            url: 'http://35.164.15.146:8082/' + shipMaterialUrl.batchMaterialRetreive,
            method: "GET"
        },
        manufacturerList: {
            url: __ENV.apiUrl + shipMaterialUrl.manufacturerList,
            method: "GET",
            isArray: "true"
        }
    });
}])

//Making service call 
.service('shipMaterialService', ['shipMaterialResource', 'appConstants', '$q', '$log', function (shipMaterialResource, appConstants, $q, $log) {

    this.getMaterialList = function (req) {
        var deferred = $q.defer();
        try {
            shipMaterialResource
                .materialList()
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

    this.getMaterial = function (req) {
        var deferred = $q.defer();
        try {
            shipMaterialResource
                .retreiveMat({id: req.id})
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
    this.getMaterialBatch = function (req) {
        var deferred = $q.defer();
        try {
            shipMaterialResource
                .retreiveBatchMat({
                    id: req.batchId
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

    this.shipMaterial = function (mat) {
        var req = bverifyUtil.getShipmentHexRequest(mat, 0);
        var deferred = $q.defer();
        try {
            shipMaterialResource
                .shipMat(req)
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

    this.getManufacturerList = function (req) {
        var deferred = $q.defer();
        try {
            shipMaterialResource
                .manufacturerList(req)
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

}]);