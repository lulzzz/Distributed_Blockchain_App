/*
*   User service to make service calls for user login/registration using ngResource
*
*/

'use strict';
angular.module('productModule')

    // Registering/Retreiving/shipping/acknowledging product
    .value('registerUrl', {
        'register': 'rawmaterial',  // TO-DO need to change against WEB API URL
        /****** below needs to be change. Hardcoded for demo */
        'materialList': 'rawmaterial/list/rm/all', // TO-DO need to change against WEB API URL
        'list': 'rawmaterial/list/:page', // TO-DO need to change against WEB API URL
        'deleteProd': 'asset/data/deleteProduct.json',   // TO-DO need to change against WEB API URL
        'upload': 'file/upload',
        'update': 'rawmaterial/:id',
        'retreive': 'rawmaterial/:id',
        'registerProductLineage': 'asset/data/productRegisterLineage.json'
    })

    //Configuring resource for making service call
    .service('registerResource', ['$resource', 'registerUrl', '__ENV', 'appConstants', function ($resource, registerUrl, __ENV, appConstants) {

        return $resource('', {id:'@id', page:'@page'}, {
            /****** below needs to be change. Hardcoded for demo */
            productList: { url:  'http://35.164.15.146:8082/' + registerUrl.list, method: "GET"},
            materialList: { url:  'http://35.164.15.146:8082/' + registerUrl.materialList, method: "GET", isArray: "true" },
            /**************************************************************** */
            registerProduct: { url:  'http://35.164.15.146:8082/' + registerUrl.register, method: "POST"},  //  // TO-DO need to change POST
            prodDelete: { url: __ENV.apiUrl + registerUrl.deleteProd, method: "GET", isArray: "true" }, // TO-DO need to change DELETE
            fileUpload: { url:  'http://35.164.15.146:8082/' + registerUrl.upload, method: "POST", isArray: "true", transformRequest: appConstants.HEADER_CONFIG.transformRequest, headers: appConstants.HEADER_CONFIG.headers }, // TO-DO need to change DELETE
            updateProd: { url: 'http://35.164.15.146:8082/' + registerUrl.update, method: "PUT" },
            retreiveProd: { url: 'http://35.164.15.146:8082/' + registerUrl.retreive, method: "GET", isArray: "true" },
            registerProductLineage: { url: __ENV.apiUrl + registerUrl.registerProductLineage, method: "GET"}
        });
    }])

    //Making service call 
    .service('registerService', ['registerResource', 'appConstants', '$q', '$log', function (registerResource, appConstants, $q, $log) {
        
        this.registerProduct = function (product) {
            var req = populateProductHexRequest(prod);
            var deferred = $q.defer();
            try{
                registerResource
                    .registerProduct(product)
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
        
        /****** below needs to be change. Hardcoded for demo */
        this.getProduct = function (req) {
            var deferred = $q.defer();
            try {
                registerResource
                    .retreiveProd({id: req.id})
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
        this.getMaterialList = function (data) {
            var deferred = $q.defer();
            try{
                registerResource
                    .materialList({page: data.page})
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
        
        /****** below needs to be change. Hardcoded for demo */
        this.getProductList = function (data) {
            var deferred = $q.defer();
            try{
                registerResource
                    .productList({page: data.page})
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

        /****** below needs to be change. Hardcoded for demo */
        this.deleteProduct = function (data) {
            var deferred = $q.defer();
            try{
                registerResource
                    .prodDelete({id: data.id})
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

        this.uploadFile = function (req) {
            var deferred = $q.defer();
            try{
                registerResource
                    .fileUpload(req)
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
        
        this.updateProduct = function (req) {
            var deferred = $q.defer();
            try {
                registerResource
                    .updateProd({id: req.id})
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

        this.getRegisterLineageData = function (req) {
            var deferred = $q.defer();
            try{
                registerResource
                    .registerProductLineage(req)
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
        
        
        function populateProductHexRequest(prod) {
            return {
                name: CONVERTER.strTohex(prod.productName),
                mnfDate: prod.manufactureDate,
                model: CONVERTER.strTohex(prod.modelNumber),
                quality: CONVERTER.strTohex(prod.quality),
                dimension: CONVERTER.strTohex(prod.dimension),
                weight: parseInt(prod.weight),
                images: PARSER.parseStrToHexImage(prod.filePath)
            }
        };

    }]);

   