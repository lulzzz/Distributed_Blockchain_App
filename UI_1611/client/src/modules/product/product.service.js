/*
*   User service to make service calls for user login/registration using ngResource
*
*/

'use strict';
angular.module('productModule')

    // Registering/Retreiving/shipping/acknowledging product
    .value('productUrl', {
        'register': 'api/product/register.json',  // TO-DO need to change against WEB API URL
        /****** below needs to be change. Hardcoded for demo */
        'list': 'asset/data/productList.json', // TO-DO need to change against WEB API URL
        'materials': 'asset/data/materialList.json', // TO-DO need to change against WEB API URL
        'ship': 'asset/data/register.json',  // TO-DO need to change against WEB API URL
        'procure': 'asset/data/register.json',   // TO-DO need to change against WEB API URL
        /****** below needs to be change. Hardcoded for demo */
        'deleteProd': 'asset/data/deleteProduct.json',   // TO-DO need to change against WEB API URL
        'upload': 'api/material/upload',
        'getProduct': 'asset/data/product.json',
        'retailerList': 'asset/data/retailerList.json'
    })

    //Configuring resource for making service call
    .service('productResource', ['$resource', 'productUrl', '__ENV', 'appConstants', function ($resource, productUrl, __ENV, appConstants) {

        return $resource('', {_id: '@productId'}, {
            /****** below needs to be change. Hardcoded for demo */
            productList: { url: __ENV.apiUrl + productUrl.list, method: "GET", isArray: "true" },
            materialList: { url: __ENV.apiUrl + productUrl.materials, method: "GET", isArray: "true" },
            /**************************************************************** */
            registerProduct: { url: __ENV.apiUrl + productUrl.register, method: "POST", transformRequest: appConstants.HEADER_CONFIG.transformRequest, headers: appConstants.HEADER_CONFIG.headers },  //  // TO-DO need to change POST
            shipProduct: { url: __ENV.apiUrl + productUrl.ship, method: "GET" },   // TO-DO need to change POST
            ackProduct: { url: __ENV.apiUrl + productUrl.acknowledge, method: "GET" },  // TO-DO need to change POST
            /****** below needs to be change. Hardcoded for demo */
            productDelete: { url: __ENV.apiUrl + productUrl.deleteProd, method: "GET", isArray: "true" }, // TO-DO need to change DELETE
            fileUpload: { url: __ENV.apiUrl + productUrl.upload, method: "POST", isArray: "true", transformRequest: appConstants.HEADER_CONFIG.transformRequest, headers: appConstants.HEADER_CONFIG.headers }, // TO-DO need to change DELETE
            retreiveProd: { url: __ENV.apiUrl + productUrl.getProduct, method: "GET"}, // TO-DO need to change DELETE
            retailerList: { url: __ENV.apiUrl + productUrl.retailerList, method: "GET", isArray: "true"}
        });
    }])

    //Making service call 
    .service('productService', ['productResource', 'appConstants', '$q', '$log', function (productResource, appConstants, $q, $log) {
        
        this.registerProduct = function (product) {
             
            var deferred = $q.defer();
            try{
                productResource
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
                productResource
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
                productResource
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
        this.getProdut = function (req) {
            var deferred = $q.defer();
            try{
                productResource
                    .retreiveProd(req)
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
       
        /********************************************************** */
         this.shipProduct = function (list) {
            var deferred = $q.defer();
            try{
                productResource
                    .shipProduct(list)
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
        this.procureProduct = function (list) {
            var deferred = $q.defer();
            try{
                productResource
                    .procureProd(list)
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
                productResource
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
                productResource
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

        this.getRetailerList = function (req) {
            var deferred = $q.defer();
            try{
                productResource
                    .retailerList(req)
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