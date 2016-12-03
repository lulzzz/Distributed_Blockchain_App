/*
*   material service to make service calls for material registration/shipment/acknowledge using ngResource
*
*/

'use strict';
angular.module('materialModule')

    // Registering/Retreiving/shipping/acknowledging material
    .value('registerMaterialUrl', {
        'register': 'rawmaterial',  // TO-DO need to change against WEB API URL
        /****** below needs to be change. Hardcoded for demo */
        'list': 'rawmaterial/list/:page', // TO-DO need to change against WEB API URL
        /****** below needs to be change. Hardcoded for demo */
        'deleteMat': 'asset/data/deleteMaterial.json',   // TO-DO need to change against WEB API URL
        'upload': 'file/upload',
        'update': 'rawmaterial/:id',
        'retreive': 'rawmaterial/:id'
    })

    //Configuring resource for making service call
    .service('registerMaterialResource', ['$resource', 'registerMaterialUrl', '__ENV', 'appConstants', function ($resource, registerMaterialUrl, __ENV, appConstants) {

        return $resource('', {id:'@id', page:'@page'}, {
            /****** below needs to be change. Hardcoded for demo */
            materialList: { url: 'http://35.164.15.146:8082/' + registerMaterialUrl.list, method: "GET"},
            /**************************************************************** */
            registerMat: { url: 'http://35.164.15.146:8082/' + registerMaterialUrl.register, method: "POST"},  //  // TO-DO need to change POST
            /****** below needs to be change. Hardcoded for demo */
            matDelete: { url: __ENV.apiUrl + registerMaterialUrl.deleteMat, method: "GET", isArray: "true" }, // TO-DO need to change DELETE
            retreiveMat: { url: 'http://35.164.15.146:8082/' + registerMaterialUrl.retreive, method: "GET", isArray: "true" },
            updateMat: { url: 'http://35.164.15.146:8082/' + registerMaterialUrl.update, method: "PUT" },
            fileUpload: { url: 'http://35.164.15.146:8082/' + registerMaterialUrl.upload, method: "POST", isArray: "true", transformRequest: appConstants.HEADER_CONFIG.transformRequest, headers: appConstants.HEADER_CONFIG.headers } // TO-DO need to change DELETE
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
        this.getMaterial = function (req) {
            var deferred = $q.defer();
            try {
                registerMaterialResource
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
        this.getMaterialList = function (req) {
            var deferred = $q.defer();
            try {
                registerMaterialResource
                    .materialList({page: req.page})
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
                    .matDelete({id: req.id})
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

        this.updateMaterial = function (req) {
            var deferred = $q.defer();
            try {
                registerMaterialResource
                    .updateMat({id: req.id})
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
