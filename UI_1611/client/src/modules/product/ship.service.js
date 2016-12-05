/*
 *   User service to make service calls for user login/registration using ngResource
 *
 */

'use strict';
angular.module('productModule')

// Registering/Retreiving/shipping/acknowledging product
.value('shipUrl', {
    'productList': 'product/list/all', 
    'ship': 'shipment', 
    'retreive': 'product/:id',
    'retailerList': 'asset/data/retailerList.json',
    'shipProductLineage': 'asset/data/productShipLineage.json'
})

//Configuring resource for making service call
.service('shipResource', ['$resource', 'shipUrl', '__ENV', 'appConstants', function ($resource, shipUrl, __ENV, appConstants) {

    return $resource('', {
        id: '@id',
        page: '@page'
    }, {
        productList: {
            url: 'http://35.164.15.146:8082/' + shipUrl.productList,
            method: "GET",
            isArray: "true"
        },
        shipProduct: {
            url: 'http://35.164.15.146:8082/' + shipUrl.ship,
            method: "GET"
        }, 
        retreiveProd: {
            url: 'http://35.164.15.146:8082/' + shipUrl.retreive,
            method: "GET"
        }, 
        retailerList: {
            url: __ENV.apiUrl + shipUrl.retailerList,
            method: "GET",
            isArray: "true"
        },
        shipProductLineage: {
            url: __ENV.apiUrl + shipUrl.shipProductLineage,
            method: "GET"
        }
    });
}])

//Making service call 
.service('shipService', ['shipResource', 'appConstants', '$q', '$log', function (shipResource, appConstants, $q, $log) {

    this.getProductList = function (data) {
        var deferred = $q.defer();
        try {
            shipResource
                .productList()
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

    this.getProduct = function (req) {
        var deferred = $q.defer();
        try {
            shipResource
                .retreiveProd(req)
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

    this.shipProduct = function (prod) {
        var req = bverifyUtil.getShipmentHexRequest(mat, 1);
        var deferred = $q.defer();
        try {
            shipResource
                .shipProduct(req)
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

    this.getRetailerList = function (req) {
        var deferred = $q.defer();
        try {
            shipResource
                .retailerList(req)
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

    this.getShipLineageData = function (req) {
        var deferred = $q.defer();
        try {
            shipResource
                .shipProductLineage(req)
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