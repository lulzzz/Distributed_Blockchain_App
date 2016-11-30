/*
*   User service to make service calls for user login/registration using ngResource
*
*/

'use strict';
angular.module('productModule')

    // Registering/Retreiving/shipping/acknowledging product
    .value('registerUrl', {
        'register': 'api/product/register.json',  // TO-DO need to change against WEB API URL
        /****** below needs to be change. Hardcoded for demo */
        'materials': 'asset/data/materialList.json', // TO-DO need to change against WEB API URL
        'list': 'asset/data/productList.json', // TO-DO need to change against WEB API URL
        'deleteProd': 'asset/data/deleteProduct.json',   // TO-DO need to change against WEB API URL
        'upload': 'api/material/upload',
        'registerProductLineage': 'asset/data/productRegisterLineage.json'
    })

    //Configuring resource for making service call
    .service('registerResource', ['$resource', 'registerUrl', '__ENV', 'appConstants', function ($resource, registerUrl, __ENV, appConstants) {

        return $resource('', {_id: '@productId'}, {
            /****** below needs to be change. Hardcoded for demo */
            productList: { url: __ENV.apiUrl + registerUrl.list, method: "GET", isArray: "true" },
            materialList: { url: __ENV.apiUrl + registerUrl.materials, method: "GET", isArray: "true" },
            /**************************************************************** */
            registerProduct: { url: __ENV.apiUrl + registerUrl.register, method: "POST"},  //  // TO-DO need to change POST
            prodDelete: { url: __ENV.apiUrl + registerUrl.deleteProd, method: "GET", isArray: "true" }, // TO-DO need to change DELETE
            fileUpload: { url: __ENV.apiUrl + registerUrl.upload, method: "POST", isArray: "true", transformRequest: appConstants.HEADER_CONFIG.transformRequest, headers: appConstants.HEADER_CONFIG.headers }, // TO-DO need to change DELETE
            registerProductLineage: { url: __ENV.apiUrl + registerUrl.registerProductLineage, method: "GET"}
        });
    }])

    //Making service call 
    .service('registerService', ['registerResource', 'appConstants', '$q', '$log', function (registerResource, appConstants, $q, $log) {
        
        this.registerProduct = function (product) {
             
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
        this.getMaterialList = function (data) {
            var deferred = $q.defer();
            try{
                registerResource
                    .materialList(data)
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
                    .productList(data)
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
                    .prodDelete(data)
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

        
    }]);