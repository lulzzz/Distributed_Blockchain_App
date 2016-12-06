/*
 *   material service to make service calls for material registration/shipment/acknowledge using ngResource
 *
 */

'use strict';
angular.module('materialModule')

// Registering/Retreiving/shipping/acknowledging material
.value('procureMaterialUrl', {
    'pendingList': 'shipment/pending/:page',
    'procure': 'shipment/acknowledge',
    'ackMaterialLineage': 'asset/data/materialAckLineage.json'
})

//Configuring resource for making service call
.service('procureMaterialResource', ['$resource', 'procureMaterialUrl', '__ENV', 'appConstants', function ($resource, procureMaterialUrl, __ENV, appConstants) {

    return $resource('', {
        id: '@id',
        page: '@page'
    }, {

        materialList: {
            url: 'http://35.164.15.146:8082/' + procureMaterialUrl.pendingList,
            method: "GET"
        },

        procureMat: {
            url: 'http://35.164.15.146:8082/' + procureMaterialUrl.procure,
            method: "PUT"
        },
        ackMaterialLineage: {
            url: __ENV.apiUrl + procureMaterialUrl.ackMaterialLineage,
            method: "GET"
        }
    });
}])

//Making service call 
.service('procureMaterialService', ['procureMaterialResource', 'appConstants', '$q', '$log', '$http', 'procureMaterialUrl', function (procureMaterialResource, appConstants, $q, $log, $http, procureMaterialUrl) {

    this.getMaterialList = function (req) {
        var deferred = $q.defer();
        try {
            procureMaterialResource
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

    this.procureMaterial = function (req) {
        var deferred = $q.defer();
        try {
            var url = 'http://35.164.15.146:8082/' + procureMaterialUrl.procure;
            $http.put(url, {trackingId: req})
                .success(function (data, status, headers, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(appConstants.FUNCTIONAL_ERR);
                });
        } catch (e) {
            $log.error(appConstants.FUNCTIONAL_ERR, e);
        }
        return deferred.promise;
    };

    this.getAckLineageData = function (req) {
        var deferred = $q.defer();
        try {
            procureMaterialResource
                .ackMaterialLineage(req)
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