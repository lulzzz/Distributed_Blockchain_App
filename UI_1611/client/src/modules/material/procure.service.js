/*
*   material service to make service calls for material registration/shipment/acknowledge using ngResource
*
*/

'use strict';
angular.module('materialModule')

    // Registering/Retreiving/shipping/acknowledging material
    .value('procureMaterialUrl', {
        'list': 'asset/data/materialList.json', // TO-DO need to change against WEB API URL
        'procure': 'asset/data/register.json'   // TO-DO need to change against WEB API URL
    })

    //Configuring resource for making service call
    .service('procureMaterialResource', ['$resource', 'procureMaterialUrl', '__ENV', 'appConstants', function ($resource, procureMaterialUrl, __ENV, appConstants) {

        return $resource('', {_id: '@materialId'}, {
            /****** below needs to be change. Hardcoded for demo */
            materialList: { url: __ENV.apiUrl + procureMaterialUrl.list, method: "GET", isArray: "true" },
            /**************************************************************** */
            procureMat: { url: __ENV.apiUrl + procureMaterialUrl.procure, method: "GET" },  // TO-DO need to change POST
        });
    }])

    //Making service call 
    .service('procureMaterialService', ['procureMaterialResource', 'appConstants', '$q', '$log', function (procureMaterialResource, appConstants, $q, $log) {
       
        /****** below needs to be change. Hardcoded for demo */
        this.getMaterialList = function (req) {
            var deferred = $q.defer();
            try{
                procureMaterialResource
                    .materialList(req)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };

        this.procureMaterial = function (list) {
            var deferred = $q.defer();
            try{
                procureMaterialResource
                    .procureMat(list)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
        
    }]);