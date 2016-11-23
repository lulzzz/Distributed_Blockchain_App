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
        'products': 'asset/data/productList.json', // TO-DO need to change against WEB API URL
        'materials': 'asset/data/materialList.json', // TO-DO need to change against WEB API URL
        'ship': 'asset/data/register.json',  // TO-DO need to change against WEB API URL
        'acknowledge': 'asset/data/register.json',   // TO-DO need to change against WEB API URL
        /****** below needs to be change. Hardcoded for demo */
        'deleteProd': 'asset/data/deleteProduct.json',   // TO-DO need to change against WEB API URL
        'deleteMat': 'asset/data/deleteMaterial.json'   // TO-DO need to change against WEB API URL
    })

    //Configuring resource for making service call
    .service('productResource', ['$resource', 'productUrl', '__ENV', 'appConstants', function ($resource, productUrl, __ENV, appConstants) {

        return $resource('', {_id: '@productId'}, {
            /****** below needs to be change. Hardcoded for demo */
            productList: { url: __ENV.apiUrl + productUrl.products, method: "GET", isArray: "true" },
            materialList: { url: __ENV.apiUrl + productUrl.materials, method: "GET", isArray: "true" },
            /**************************************************************** */
            registerProduct: { url: __ENV.apiUrl + productUrl.register, method: "POST", transformRequest: appConstants.HEADER_CONFIG.transformRequest, headers: appConstants.HEADER_CONFIG.headers },  //  // TO-DO need to change POST
            shipProduct: { url: __ENV.apiUrl + productUrl.ship, method: "GET" },   // TO-DO need to change POST
            ackProduct: { url: __ENV.apiUrl + productUrl.acknowledge, method: "GET" },  // TO-DO need to change POST
            /****** below needs to be change. Hardcoded for demo */
            productDelete: { url: __ENV.apiUrl + productUrl.deleteProd, method: "GET", isArray: "true" }, // TO-DO need to change DELETE
            matDelete: { url: __ENV.apiUrl + productUrl.deleteMat, method: "GET", isArray: "true" } // TO-DO need to change DELETE
        });
    }])

    //Making service call 
    .service('productServiceAPI', ['productResource', 'appConstants', '$q', '$log', function (productResource, appConstants, $q, $log) {
        
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
        this.ackProduct = function (list) {
            var deferred = $q.defer();
            try{
                productResource
                    .ackProduct(list)
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
        this.productDelete = function (data) {
            var deferred = $q.defer();
            try{
                productResource
                    .productDelete(data)
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
        this.materialDelete = function (data) {
            var deferred = $q.defer();
            try{
                productResource
                    .matDelete(data)
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