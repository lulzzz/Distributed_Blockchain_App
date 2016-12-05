/*
 *   User service to make service calls for user login/registration using ngResource
 *
 */

'use strict';
angular.module('productModule')

// Registering/Retreiving/shipping/acknowledging product
.value('shipUrl', {
    /****** below needs to be change. Hardcoded for demo */
    'list': 'asset/data/productList.json', // TO-DO need to change against WEB API URL
    'ship': 'asset/data/register.json', // TO-DO need to change against WEB API URL
    'getProduct': 'asset/data/product.json',
    'retailerList': 'asset/data/retailerList.json',
    'shipProductLineage': 'asset/data/productShipLineage.json'
})

//Configuring resource for making service call
.service('shipResource', ['$resource', 'shipUrl', '__ENV', 'appConstants', function ($resource, shipUrl, __ENV, appConstants) {

    return $resource('', {
        id: '@id'
    }, {
        /****** below needs to be change. Hardcoded for demo */
        productList: {
            url: __ENV.apiUrl + shipUrl.list,
            method: "GET",
            isArray: "true"
        },
        shipProduct: {
            url: __ENV.apiUrl + shipUrl.ship,
            method: "GET"
        }, // TO-DO need to change POST
        retreiveProd: {
            url: __ENV.apiUrl + shipUrl.getProduct,
            method: "GET"
        }, // TO-DO need to change DELETE
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


    /****** below needs to be change. Hardcoded for demo */
    this.getProductList = function (data) {
        var deferred = $q.defer();
        try {
            shipResource
                .productList(data)
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

    /********************************************************** */
    this.shipProduct = function (list) {
        var deferred = $q.defer();
        try {
            shipResource
                .shipProduct(list)
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