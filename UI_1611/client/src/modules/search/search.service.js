/*
 *   User service to make service calls for user login/registration using ngResource
 *
 */

'use strict';
angular.module('searchModule')

//Registering shipment track url
.value('shipmentUrl', {
    'track': 'shipment/track/:id', // TO-DO replace with WEB API URL
    'productShipments': 'asset/data/productShipmentList.json', // TO-DO replace with WEB API URL
    'materialShipments': 'asset/data/materialShipmentList.json' // TO-DO replace with WEB API URL
})

//Configuring resource for making service call
.service('trackResource', ['$resource', 'shipmentUrl', '__ENV', function ($resource, shipmentUrl, __ENV) {
    return $resource('', {id: '@id'}, {
        trackShipment: {
            url: 'http://35.164.15.146:8082/' + shipmentUrl.track,
            method: "GET"
        },
        /****** below needs to be change. Hardcoded for demo */
        productShipmentRecords: {
            url: __ENV.apiUrl + shipmentUrl.productShipments,
            method: "GET",
            isArray: true
        },
        materialShipmentRecords: {
            url: __ENV.apiUrl + shipmentUrl.materialShipments,
            method: "GET",
            isArray: true
        }
    });
}])

//Making service call for searching shipment details
.service('searchServiceAPI', ['trackResource', '$q', 'appConstants', '$log', function (trackResource, $q, appConstants, $log) {
    this.search = function (searchQuery) {
        var deferred = $q.defer();
        try {
            trackResource
                .trackShipment({
                    id: searchQuery
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
    this.getProductShipmentList = function (user) {
        var deferred = $q.defer();
        try {
            trackResource
                .productShipmentRecords(user)
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
    this.getMaterialShipmentList = function (user) {
        var deferred = $q.defer();
        try {
            trackResource
                .materialShipmentRecords(user)
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