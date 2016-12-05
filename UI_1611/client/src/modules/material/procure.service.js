/*
 *   material service to make service calls for material registration/shipment/acknowledge using ngResource
 *
 */

'use strict';
angular.module('materialModule')

// Registering/Retreiving/shipping/acknowledging material
.value('procureMaterialUrl', {
    'pendingList': 'shipment/pending/:page',
    'procure': 'asset/data/register.json',
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
            method: "GET",
            isArray: "true"
        },

        procureMat: {
            url: 'http://35.164.15.146:8082/' + procureMaterialUrl.procure,
            method: "GET"
        },
        ackMaterialLineage: {
            url: __ENV.apiUrl + procureMaterialUrl.ackMaterialLineage,
            method: "GET"
        }
    });
}])

//Making service call 
.service('procureMaterialService', ['procureMaterialResource', 'appConstants', '$q', '$log', function (procureMaterialResource, appConstants, $q, $log) {

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

    this.procureMaterial = function (list) {
        var deferred = $q.defer();
        try {
            procureMaterialResource
                .procureMat(list)
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