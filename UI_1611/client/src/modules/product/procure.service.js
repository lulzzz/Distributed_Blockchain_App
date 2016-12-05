/*
 *   User service to make service calls for user login/registration using ngResource
 *
 */

'use strict';
angular.module('productModule')

// Registering/Retreiving/shipping/acknowledging product
.value('procureUrl', {

    'list': 'asset/data/productList.json', // TO-DO need to change against WEB API URL
    'procure': 'asset/data/register.json', // TO-DO need to change against WEB API URL
    'ackProductLineage': 'asset/data/productAckLineage.json'
})

//Configuring resource for making service call
.service('procureResource', ['$resource', 'procureUrl', '__ENV', 'appConstants', function ($resource, procureUrl, __ENV, appConstants) {

    return $resource('', {
        id: '@id'
    }, {
        /****** below needs to be change. Hardcoded for demo */
        productList: {
            url: __ENV.apiUrl + procureUrl.list,
            method: "GET",
            isArray: "true"
        },
        procureProd: {
            url: __ENV.apiUrl + procureUrl.procure,
            method: "GET"
        }, // TO-DO need to change POST
        /****** below needs to be change. Hardcoded for demo */
        ackProductLineage: {
            url: __ENV.apiUrl + procureUrl.ackProductLineage,
            method: "GET"
        }
    });
}])

//Making service call 
.service('procureService', ['procureResource', 'appConstants', '$q', '$log', function (procureResource, appConstants, $q, $log) {

    /****** below needs to be change. Hardcoded for demo */
    this.getProductList = function (data) {
        var deferred = $q.defer();
        try {
            procureResource
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

    this.procureProduct = function (list) {
        var deferred = $q.defer();
        try {
            procureResource
                .procureProd(list)
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

    this.getAckLineageData = function (req) {
        var deferred = $q.defer();
        try {
            procureResource
                .ackProductLineage(req)
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