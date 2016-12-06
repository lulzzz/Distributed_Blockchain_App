/*
 *   material service to make service calls for material registration/shipment/acknowledge using ngResource
 *
 */

'use strict';
angular.module('materialModule')

// Registering/Retreiving/shipping/acknowledging material
.value('registerMaterialUrl', {
    'register': 'rawmaterial', // TO-DO need to change against WEB API URL
    /****** below needs to be change. Hardcoded for demo */
    'list': 'rawmaterial/list/:page', // TO-DO need to change against WEB API URL
    /****** below needs to be change. Hardcoded for demo */
    'deleteMat': 'asset/data/deleteMaterial.json', // TO-DO need to change against WEB API URL
    'upload': 'file/upload',
    'update': 'rawmaterial/',
    'retreive': 'rawmaterial/:id'
})

//Configuring resource for making service call
.service('registerMaterialResource', ['$resource', 'registerMaterialUrl', '__ENV', 'appConstants', function ($resource, registerMaterialUrl, __ENV, appConstants) {

    return $resource('', {
        id: '@id',
        page: '@page'
    }, {
        materialList: {
            url: 'http://35.164.15.146:8082/' + registerMaterialUrl.list,
            method: "GET"
        },
        registerMat: {
            url: 'http://35.164.15.146:8082/' + registerMaterialUrl.register,
            method: "POST"
        },
        matDelete: {
            url: __ENV.apiUrl + registerMaterialUrl.deleteMat,
            method: "GET",
            isArray: "true"
        },
        retreiveMat: {
            url: 'http://35.164.15.146:8082/' + registerMaterialUrl.retreive,
            method: "GET"
        },
        updateMat: {
            url: 'http://35.164.15.146:8082/' + registerMaterialUrl.update,
            method: "PUT"
        },
        fileUpload: {
            url: 'http://35.164.15.146:8082/' + registerMaterialUrl.upload,
            method: "POST",
            isArray: "true",
            transformRequest: appConstants.HEADER_CONFIG.transformRequest,
            headers: appConstants.HEADER_CONFIG.headers
        }
    });
}])

//Making service call 
.service('registerMaterialService', ['registerMaterialResource', 'appConstants', '$q', '$log', '$http', 'registerMaterialUrl', function (registerMaterialResource, appConstants, $q, $log, $http, registerMaterialUrl) {

    this.registerMaterial = function (mat) {
        var req = populateMaterialHexRequest(mat);
        delete req['id'];
        delete req['quantity'];
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

    this.getMaterial = function (req) {
        var deferred = $q.defer();
        try {
            registerMaterialResource
                .retreiveMat({
                    id: req.id
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

    this.getMaterialList = function (req) {
        var deferred = $q.defer();
        try {
            registerMaterialResource
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

    this.deleteMaterial = function (req) {
        var deferred = $q.defer();
        try {
            registerMaterialResource
                .matDelete({
                    id: req.id
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

    this.updateMaterial = function (mat) {
        var req = populateMaterialHexRequest(mat);
        var deferred = $q.defer();
        try {
            var url = 'http://35.164.15.146:8082/' + registerMaterialUrl.update + req.id;
            delete req['id'];
            delete req['quantity'];
            $http.put(url, req)
                .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject(appConstants.SERVICE_ERROR);
                    });
        } catch (e) {
            $log.error(appConstants.FUNCTIONAL_ERR, e);
        }
        return deferred.promise;
    };

    function populateMaterialHexRequest(mat) {
        return {
            id: parseInt(mat.id),
            name: CONVERTER.strTohex(mat.materialName),
            mnfDate: mat.productionDate,
            expDate: mat.expiryDate,
            model: CONVERTER.strTohex(mat.modelNumber),
            quality: CONVERTER.strTohex(mat.quality),
            dimension: CONVERTER.strTohex(mat.dimension),
            weight: CONVERTER.strTohex(mat.weight),
            images: PARSER.parseStrToHexImage(['asset/images/bag1.png'])
            //images: PARSER.parseStrToHexImage(mat.filePath)
        }
    };

}]);