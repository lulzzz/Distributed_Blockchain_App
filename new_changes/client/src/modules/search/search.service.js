/*
*   User service to make service calls for user login/registration using ngResource
*
*/

'use strict';
angular.module('bverifyApp')

    //Registering shipment track url
    .value('shipmentUrl',  {
        'track': 'api/track'
    })

    //Configuring resource for making service call
    .service('trackResource', ['$resource', 'shipmentUrl', '__ENV', function ($resource, shipmentUrl, __ENV) {
        return $resource('', {}, {
            trackShipment: { url: __ENV.apiUrl + shipmentUrl.track, method: "GET" }
        });
    }])

    //Making service call for searching shipment details
    .service('searchServiceAPI', ['trackResource', '$q', 'appConstants', '$log', function (trackResource, $q, appConstants, $log) {
        this.search = function (searchObj) {
            var deferred = $q.defer();
            try {
                trackResource
                    .trackShipment({ id: searchObj.id })
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