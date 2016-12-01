/*
*   material service to make service calls for material registration/shipment/acknowledge using ngResource
*
*/

'use strict';
angular.module('materialModule')

    // Registering/Retreiving/shipping/acknowledging material
    .value('registerMaterialUrl', {
        'register': 'api/material/register.json',  // TO-DO need to change against WEB API URL
        /****** below needs to be change. Hardcoded for demo */
        'list': 'asset/data/materialList.json', // TO-DO need to change against WEB API URL
        /****** below needs to be change. Hardcoded for demo */
        'delete': 'asset/data/deleteMaterial.json',   // TO-DO need to change against WEB API URL
        'upload': 'api/material/upload',
        'edit': 'rawmaterial/:_id'
    })

    //Configuring resource for making service call
    .service('registerMaterialResource', ['$resource', 'registerMaterialUrl', '__ENV', 'appConstants', function ($resource, registerMaterialUrl, __ENV, appConstants) {

        return $resource('', { _id: '@materialId' }, {
            /****** below needs to be change. Hardcoded for demo */
            materialList: { url: __ENV.apiUrl + registerMaterialUrl.list, method: "GET", isArray: "true" },
            /**************************************************************** */
            registerMat: { url: __ENV.apiUrl + registerMaterialUrl.register, method: "POST" },  //  // TO-DO need to change POST
            /****** below needs to be change. Hardcoded for demo */
            matDelete: { url: __ENV.apiUrl + registerMaterialUrl.deleteMat, method: "GET", isArray: "true" }, // TO-DO need to change DELETE
            editMat: { url: __ENV.apiUrl + registerMaterialUrl.edit, method: "PUT" },
            fileUpload: { url: __ENV.apiUrl + registerMaterialUrl.upload, method: "POST", isArray: "true", transformRequest: appConstants.HEADER_CONFIG.transformRequest, headers: appConstants.HEADER_CONFIG.headers } // TO-DO need to change DELETE
        });
    }])

    //Making service call 
    .service('registerMaterialService', ['registerMaterialResource', 'appConstants', '$q', '$log', function (registerMaterialResource, appConstants, $q, $log) {

        this.registerMaterial = function (mat) {
            var req = populateMaterialHexRequest(mat);
            var deferred = $q.defer();
            try {
                registerMaterialResource
                    .registerMat(req)
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
                registerMaterialResource
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

        this.deleteMaterial = function (req) {
            var deferred = $q.defer();
            try {
                registerMaterialResource
                    .matDelete(req)
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


        this.uploadFile = function (req) {
            var deferred = $q.defer();
            try {
                registerMaterialResource
                    .fileUpload(req)
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

        this.editMaterial = function (req) {
            var deferred = $q.defer();
            try {
                registerMaterialResource
                    .editMat(req)
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

        function populateMaterialHexRequest(mat) {
            return {
                name: CONVERTER.strTohex(mat.materialName),
                mnfDate: mat.productionDate,
                expDate: mat.expiryDate,
                model: CONVERTER.strTohex(mat.modelNumber),
                quality: CONVERTER.strTohex(mat.quality),
                dimension: CONVERTER.strTohex(mat.dimension),
                weight: parseInt(mat.weight),
                images: PARSER.parseStrToHexImage(mat.filePath)
            }
        };

    }]);